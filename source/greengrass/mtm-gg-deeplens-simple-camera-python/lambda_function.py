import os
import time
import greengrasssdk
import platform
import json
from threading import Thread, Event

import awscam
import numpy as np
import cv2

from botocore.session import Session
import boto3


THINGNAME = '{}'.format(os.environ['AWS_IOT_THING_NAME'])
IOT_TOPIC_CAMERA = 'mtm/{}/camera'.format(THINGNAME)

simpleCamera = {
    "saveOriginals": "Off",
    "s3Bucket": "Off",
    "pathToPictures": "/tmp/",
    "jpegQuality": 50,
    "sleepInSecsAsStr": "1"
}

# Creating a greengrass core sdk client
client = greengrasssdk.client('iot-data')

# Retrieving platform information to send from Greengrass Core
my_platform = platform.platform()


class MyThread(Thread):

    def __init__(self):
        super(MyThread, self).__init__()
        self.stop_request = Event()

    def run(self):
        while True:
            print 'My Thread'
            if not my_platform:
                client.publish(
                    topic=IOT_TOPIC_CAMERA,
                    payload=json.dumps({
                        'event': 'hello',
                        'message': 'Hello from my thread! Sent from Greengrass Core.'
                    }))
            else:
                client.publish(
                    topic=IOT_TOPIC_CAMERA,
                    payload=json.dumps({
                        'event': 'hello',
                        'message': 'Hello from my thread! Sent from Greengrass Core running on platform: {}'.format(my_platform)
                    }))
            time.sleep(5)

    def join(self):
        self.stop_request.set()


def reportShadow():
    client.update_thing_shadow(
        thingName=THINGNAME,
        payload=json.dumps({
            'state': {
                'reported': {
                    'simpleCamera': simpleCamera
                }
            }
        })
    )

def syncShadow():
    response = client.get_thing_shadow(thingName=THINGNAME)
    payloadDict = json.loads(response['payload'])
    stateDict = payloadDict['state']

    # We are only interested in the Desired and Delta states.
    # Delta first cause that will force a reported to clear it
    if 'delta' in stateDict:
        if 'simpleCamera' in stateDict['delta']:
            simpleCamera.update(stateDict['delta']['simpleCamera'])
            print 'syncShadow: Delta {}'.format(json.dumps(simpleCamera))
            # report the change
            reportShadow()

    # Desired
    if 'desired' in stateDict:
        if 'simpleCamera' in stateDict['desired']:
            simpleCamera.update(stateDict['desired']['simpleCamera'])

def getTimestamp():
    return '{}'.format(int(round(time.time() * 1000)))

def saveFrameToFile(filename, frame):
    localFilename = simpleCamera['pathToPictures'] + filename
    print 'saveFrameToFile: Saving frame to {}'.format(localFilename)

    localWriteReturn = cv2.imwrite(localFilename, frame, [int(cv2.IMWRITE_JPEG_QUALITY), simpleCamera['jpegQuality']])
    if not localWriteReturn:
        raise Exception('Failed to save frame to file')

    return True, filename, localFilename

# Function to write to S3
# The function is creating an S3 client every time to use temporary credentials from the GG session over TES

def sendFileToS3(filename):
    # if simpleCamera['s3Bucket'] != 'Off':
    print 'sendFileToS3: Going to try sending stuff to S3'
    localFilename = simpleCamera['pathToPictures'] + filename
    try:
        session = Session()
        s3 = session.create_client('s3')
        with open(localFilename, 'rb') as f:
            data=f.read()
        s3.put_object(Bucket=simpleCamera['s3Bucket'], Key=THINGNAME + '/' + filename, Body=data)
        # os.environ['MY_FUNCTION_ARN'].split(':')[6] + '/' +
        return True
    except Exception as ex:
        print 'Failed to upload to s3: {}'.format(ex)
        return False
    # else:
    #     return False




def greengrassInfiniteLoop():
    """ Entry point of the lambda function"""
    try:

        # Report the Shadow a first time to tell system what state we're in
        reportShadow()

        # Temp thread to get feedback that things seem to be running.
        myThread = MyThread()
        myThread.start()

        print 'Start of while Loop'

        # Do work until the lambda is killed.
        while True:
            print 'Loop'
            # Get a frame from the video stream
            ret, frame = awscam.getLastFrame()
            if not ret:
                raise Exception('Failed to get frame from the stream')

            # Lets sync up our Shadow document
            syncShadow()

            # Create a filename for the given frame to be used through this loop
            timestamp = getTimestamp()

            filename = timestamp + '-original.jpg'

            # Save original frame to disk
            if simpleCamera['saveOriginals'] == 'On':
                result, filename, localFilename = saveFrameToFile(
                    filename=filename,
                    frame=frame
                )
                if result == True:
                    client.publish(topic=IOT_TOPIC_CAMERA, payload=json.dumps(
                        {'event': 'save', 'message': 'File saved to disk.', 'filename': filename, 'fullPath': localFilename, 'type': 'original'}))

                if simpleCamera['s3Bucket'] != 'Off':
                    if sendFileToS3(filename):
                        client.publish(topic=IOT_TOPIC_CAMERA, payload=json.dumps(
                            {'event': 'upload', 'message': 'Upload to S3: Successful.', 'filename': filename}))
                        os.remove(localFilename)
                else:
                    os.remove(localFilename)

            time.sleep(float(simpleCamera['sleepInSecsAsStr']))

    except Exception as ex:
        print 'ERROR: {}'.format(ex)
        client.publish(topic=IOT_TOPIC_CAMERA,
                       payload=json.dumps({
                           'event': 'error',
                           'message': 'Error in lambda: {}'.format(ex)
                       }))

# Execute the function above
greengrassInfiniteLoop()


# This is a dummy handler and will not be invoked
# Instead the code above will be executed in an infinite loop for our example
def function_handler(event, context):
    client.publish(topic=IOT_TOPIC_CAMERA,
                   payload=json.dumps({
                       'event': 'event',
                       'message': json.dumps(event)
                   }))
    return



