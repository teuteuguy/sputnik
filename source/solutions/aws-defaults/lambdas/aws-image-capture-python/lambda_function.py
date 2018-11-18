import os
import numpy as np  # pylint: disable=import-error
import cv2  # pylint: disable=import-error
import time
from threading import Event, Thread, Timer
import math

import awscam  # pylint: disable=import-error
from file_output import FileOutput

from botocore.session import Session  # pylint: disable=import-error
import boto3  # pylint: disable=import-error

from ggiot import GGIoT

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter('AWS_IOT_THING_NAME', 'Unknown')
PREFIX = 'mtm'
TOPIC_CAMERA = 'mtm/{}/camera'.format(THING_NAME)

SIMPLE_CAMERA = {
    "capture": "Off",
    "sleepInSecsAsStr": "0.5",
    "s3UploadSleepInSecsAsStr": "5",
    "s3Upload": "Off",
    "s3Bucket": "Off",
    "s3KeyPrefix": "aws-deeplens-image-capture/{}/default".format(THING_NAME),
    "resolution": "1920x1080"
}


def timeInMillis(): return int(round(time.time() * 1000))

def parseIncomingShadow(shadow):

    global SIMPLE_CAMERA

    if 'state' in shadow:
        state = shadow['state']

        if 'desired' in state:
            desired = state['desired']

            if 'simpleCamera' in desired:

                simpleCamera = desired['simpleCamera']

                if 'capture' in simpleCamera and SIMPLE_CAMERA['capture'] != simpleCamera['capture']:
                    SIMPLE_CAMERA['capture'] = simpleCamera['capture']
                    print("parseIncomingShadow: updating capture to {}".format(SIMPLE_CAMERA['capture']))
                if 'sleepInSecsAsStr' in simpleCamera and SIMPLE_CAMERA['sleepInSecsAsStr'] != simpleCamera['sleepInSecsAsStr']:
                    SIMPLE_CAMERA['sleepInSecsAsStr'] = simpleCamera['sleepInSecsAsStr']
                    print("parseIncomingShadow: updating sleepInSecsAsStr to {}".format(
                        SIMPLE_CAMERA['sleepInSecsAsStr']))
                if 's3UploadSleepInSecsAsStr' in simpleCamera and SIMPLE_CAMERA['s3UploadSleepInSecsAsStr'] != simpleCamera['s3UploadSleepInSecsAsStr']:
                    SIMPLE_CAMERA['s3UploadSleepInSecsAsStr'] = simpleCamera['s3UploadSleepInSecsAsStr']
                    print("parseIncomingShadow: updating s3UploadSleepInSecsAsStr to {}".format(
                        SIMPLE_CAMERA['s3UploadSleepInSecsAsStr']))
                if 's3Upload' in simpleCamera and SIMPLE_CAMERA['s3Upload'] != simpleCamera['s3Upload']:
                    SIMPLE_CAMERA['s3Upload'] = simpleCamera['s3Upload']
                    print("parseIncomingShadow: updating s3Upload to {}".format(SIMPLE_CAMERA['s3Upload']))
                if 's3Bucket' in simpleCamera and SIMPLE_CAMERA['s3Bucket'] != simpleCamera['s3Bucket']:
                    SIMPLE_CAMERA['s3Bucket'] = simpleCamera['s3Bucket']
                    print("parseIncomingShadow: updating s3Bucket to {}".format(SIMPLE_CAMERA['s3Bucket']))
                if 's3KeyPrefix' in simpleCamera and SIMPLE_CAMERA['s3KeyPrefix'] != simpleCamera['s3KeyPrefix']:
                    SIMPLE_CAMERA['s3KeyPrefix'] = simpleCamera['s3KeyPrefix']
                    print("parseIncomingShadow: updating s3KeyPrefix to {}".format(SIMPLE_CAMERA['s3KeyPrefix']))
                if 'resolution' in simpleCamera and SIMPLE_CAMERA['resolution'] != simpleCamera['resolution']:
                    SIMPLE_CAMERA['resolution'] = simpleCamera['resolution']
                    print("parseIncomingShadow: updating resolution to {}".format(SIMPLE_CAMERA['resolution']))

                GGIOT.updateThingShadow(payload={'state': {'reported': {'simpleCamera': SIMPLE_CAMERA}}})

def lambda_handler(event, context):
    GGIOT.info({"location": "lambda_handler", "event": event})
    parseIncomingShadow(event)
    return


def parseResolution(strResolution):
    resolution = strResolution.split('x')
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])

try:
    print("Start of lambda function")
    GGIOT = GGIoT(thing=THING_NAME, prefix='mtm')

    GGIOT.info("Loading new Thread")
    GGIOT.info('OpenCV '+cv2.__version__)

    parseIncomingShadow(GGIOT.getThingShadow())

    GGIOT.info('Initilizing ouput file')
    resolution = parseResolution(SIMPLE_CAMERA['resolution'])
    frame = 255*np.ones([resolution[0], resolution[1], 3])
    OUTPUT = FileOutput('/tmp/results.mjpeg', frame, GGIOT)
    OUTPUT.start()

    GGIOT.info('Getting last camera frame')
    ret, frame = awscam.getLastFrame()
    ret, frame = awscam.getLastFrame()

except Exception as err:
    GGIOT.exception(str(err))
    time.sleep(1)

def getTimestamp():
    return '{}'.format(int(round(time.time() * 1000)))


def saveFrameToFile(filename, frame):
    fullPath = '/tmp/' + filename
    print("saveFrameToFile: Saving frame to {}".format(fullPath))

    localWriteReturn = cv2.imwrite(fullPath, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not localWriteReturn:
        raise Exception('Failed to save frame to file')

    return fullPath


def sendFileToS3(fullPath, filename):

    global SIMPLE_CAMERA

    print("sendFileToS3: Going to try sending {} to S3".format(filename))

    try:
        session = Session()
        s3 = session.create_client('s3')

        with open(fullPath, 'rb') as f:
            data = f.read()

        s3Key = SIMPLE_CAMERA['s3KeyPrefix'] + '/' + filename
        s3.put_object(Bucket=SIMPLE_CAMERA['s3Bucket'], Key=s3Key, Body=data)

        return True, s3Key

    except Exception as ex:
        print("Failed to upload to s3: {}".format(ex))
        return False, False


last_update = timeInMillis()
nbFramesProcessed = 0
fps = 0


class S3Thread(Thread):

    def __init__(self, fullPath, filename):
        super(S3Thread, self).__init__()
        self.stop_request = Event()
        self.fullPath = fullPath
        self.filename = filename
        print("S3Thread.init")

    def join(self):
        self.stop_request.set()

    def run(self):
        try:
            result, s3Key = sendFileToS3(fullPath=self.fullPath, filename=self.filename)
            if result == True:
                os.remove(self.fullPath)
                message = "Upload to S3 done: {}".format(s3Key)
                print("S3Thread: {}".format(message))
                GGIOT.info(message)
            else:
                message = "Upload to S3 failed for: {}".format(self.filename)
                print("S3Thread: {}".format(message))
                GGIOT.exception('Upload to S3 failed for: {}'.format(self.filename))
        except Exception as err:
            GGIOT.exception(str(err))
            time.sleep(1)

def camera_handler():

    global last_update
    global fps
    global nbFramesProcessed
    global SIMPLE_CAMERA

    ret, frame = awscam.getLastFrame()
    frame = cv2.resize(frame, parseResolution(SIMPLE_CAMERA['resolution']))
    font = cv2.FONT_HERSHEY_SIMPLEX

    nbFramesProcessed += 1

    timeBetweenFrames = timeInMillis() - last_update
    if timeBetweenFrames > 1000:
        fps = math.floor(100 * (fps + (1000 * nbFramesProcessed / timeBetweenFrames)) / 2 ) / 100
        nbFramesProcessed = 0
        last_update = timeInMillis()


    cv2.putText(frame, 'FPS: {}'.format(str(fps)), (5, parseResolution(
        SIMPLE_CAMERA['resolution'])[1] - 5), font, 0.4, (0, 0, 255), 1)

    OUTPUT.update(frame)

    if SIMPLE_CAMERA['capture'] == 'On':

        # Create a filename for the given frame to be used through this loop
        timestamp = getTimestamp()

        filename = timestamp + '.jpg'

        # Save frame to disk
        fullPath = saveFrameToFile(
            filename=filename,
            frame=frame
        )

        GGIOT.publish(TOPIC_CAMERA, {
            "fps": str(fps),
            "frame": {
                "size": frame.size,
                "shape": frame.shape
            },
            "filename": filename
        })

        if SIMPLE_CAMERA['s3Bucket'] != 'Off' and SIMPLE_CAMERA['s3Upload'] == 'On':
            s3Thread = S3Thread(fullPath, filename)
            s3Thread.start()
            time.sleep(float(SIMPLE_CAMERA['s3UploadSleepInSecsAsStr']))

        if SIMPLE_CAMERA['s3Upload'] == 'Off':
            time.sleep(float(SIMPLE_CAMERA['sleepInSecsAsStr']))

    return

class MainAppThread(Thread):

    def __init__(self):
        super(MainAppThread, self).__init__()
        self.stop_request = Event()
        print("MainAppThread.init")

    def join(self):
        self.stop_request.set()

    def run(self):
        try:
            while 42:
                camera_handler()

        except Exception as err:
            GGIOT.exception(str(err))
            time.sleep(1)

mainAppThread = MainAppThread()
mainAppThread.start()











# def main_loop():
#     try:
#         last_update = time.time()
#         results = []
#         fps = 0
#         while 42 :
#             # # in case the belt is stuck in a position with an unsafe lego figure in view,
#             # # create the file RESUME_COMMAND_FILE_PATH to force resume the belt
#             # if os.path.exists(RESUME_COMMAND_FILE_PATH):
#             #     PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_FORWARD, "speed": BELT_DEFAULT_SPEED } } })

#             ret, frame = awscam.getLastFrame()

#             inference_size_x = 224
#             inference_size_y = 224

#             w = inference_size_x * 2
#             h = inference_size_y * 2
#             x = 1920 / 2 - w / 2
#             y = 1080 / 2 - h / 2

#             frame = frame[y:y+h, x:x+w]

#             print(frame)

#             PUB.info('Frame loaded {}, {}'.format(frame.size, frame.shape))

#             frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             frame = cv2.resize(frame, (inference_size_x, inference_size_y)) # resize

#             PUB.info('Frame resized')

#             try:
#                 category, probability = model.do(frame)
#                 results.append(category)
#                 font = cv2.FONT_HERSHEY_DUPLEX
#                 title = str(fps) + " - " + category + " - " + str(probability)

#                 PUB.publish(IOT_TOPIC_INFERENCE, {
#                     "type":  "inference",
#                     "payload": {
#                         "probability": str(probability),
#                         "title": title
#                     }
#                 })

#                 if probability > 0.6:
#                     prob_no_hat = probability
#                     if category == 'hat':
#                         prob_no_hat = 1.0 - probability
#                     elif category == 'nohat':
#                         probability =  1.0 - probability
#                     cv2.rectangle(frame, (0, 0), (int(frame.shape[1] * 0.2 * prob_no_hat), 80),
#                                 (0, 0, 255), -1)
#                     cv2.rectangle(frame, (0, 90), (int(frame.shape[1] * 0.2 * probability), 170), (0, 255, 0), -1)
#                     font = cv2.FONT_HERSHEY_SIMPLEX
#                     cv2.putText(frame, 'Not Safe', (10, 70), font, 1, (225, 225, 225), 8)
#                     cv2.putText(frame, 'Safe', (10, 160), font, 1, (225, 225, 225), 8)

#                     # if prob_no_hat > 0.8: # definitely not safe
#                     #     PUB.info('')
#                     # #     PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_STOP, "speed": BELT_DEFAULT_SPEED } } })
#                     # elif probability > 0.8: # definitely safe
#                     #     PUB.info('Frame resized')
#                     # #     PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_FORWARD, "speed": BELT_DEFAULT_SPEED } } })

#             except Exception as err:
#                 PUB.exception(str(err))
#                 raise err

#             now = time.time()
#             if now - last_update >= 1:
#                 last_update = time.time()
#                 PUB.events(results)
#                 fps = len(results)
#                 results = []

#             OUTPUT.update(frame)

#     except Exception as err:
#         PUB.exception(str(err))
#         time.sleep(1)

#     Timer(0, main_loop).start()

# OUTPUT.stop()
# VS.stop()

# main_loop()
