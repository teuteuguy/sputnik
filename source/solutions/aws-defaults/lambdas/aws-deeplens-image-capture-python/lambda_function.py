import os
import numpy as np
import cv2
import time
from threading import Event, Thread, Timer
import math

import awscam
from file_output import FileOutput

from ggiot import GGIoT

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter('AWS_IOT_THING_NAME', 'Unknown')
IOT_TOPIC_ADMIN = 'mtm/{}/admin'.format(THING_NAME)
IOT_TOPIC_SHADOW_UPDATE = '$aws/things/{}/shadow/update'.format(THING_NAME)
CAPTURE_FREQ = get_parameter('CAPTURE_FREQ', '0.5')

SIMPLE_CAMERA = {
    "capture": "Off",
    "sleepInSecsAsStr": CAPTURE_FREQ,
    "s3Bucket": "Off",
    "resolution": "1920x1080"
}


def timeInMillis(): return int(round(time.time() * 1000))

def parseIncomingShadow(shadow):

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
                if 's3Bucket' in simpleCamera and SIMPLE_CAMERA['s3Bucket'] != simpleCamera['s3Bucket']:
                    SIMPLE_CAMERA['s3Bucket'] = simpleCamera['s3Bucket']
                    print("parseIncomingShadow: updating s3Bucket to {}".format(SIMPLE_CAMERA['s3Bucket']))
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
    localFilename = '/tmp/' + filename
    print("saveFrameToFile: Saving frame to {}".format(localFilename))

    localWriteReturn = cv2.imwrite(localFilename, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not localWriteReturn:
        raise Exception('Failed to save frame to file')

    return True, filename, localFilename


last_update = timeInMillis()
nbFramesProcessed = 0
fps = 0

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
        result, filename, localFilename = saveFrameToFile(
            filename=filename,
            frame=frame
        )
        if result == True:
            GGIOT.publish(IOT_TOPIC_ADMIN, {
                "type":  "info",
                "payload": {
                    "fps": str(fps),
                    "frame": {
                        "size": frame.size,
                        "shape": frame.shape
                    },
                    "filename": filename
                }
            })

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

        # mainAppThread.start()


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
