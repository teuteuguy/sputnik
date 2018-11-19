import os
import numpy as np  # pylint: disable=import-error
import cv2  # pylint: disable=import-error
import time
from threading import Event, Thread, Timer
import math

# import awscam
from file_output import FileOutput

# from publish import Publisher
from ggiot import GGIoT
from camera import VideoStream
from inference import Infer

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter('AWS_IOT_THING_NAME', 'Unknown')
PATH_TO_CAMERA = get_parameter('PATH_TO_CAMERA', '/dev/null')
PREFIX = 'mtm'
TOPIC_INFERENCE = '{}/{}/inference'.format(PREFIX, THING_NAME)
CAMERA = None

FACTORY_CAMERA = {
    "capture": "Off",
    "s3Upload": "Off",
    "s3Bucket": "Off",
    "resolution": "858x480",
    "crop": "224x224",
    "s3KeyPrefix": "mini-connected-factory-camera-v1.1/{}/default".format(THING_NAME),
    "categories": ["hat", "nohat"]
}

ML_MODEL_PATH = get_parameter('ML_MODEL_PATH', '')

# IOT_TOPIC_INFERENCE = 'mtm/{}/inference'.format(THING_NAME)
# IOT_TOPIC_ADMIN = 'mtm/{}/admin'.format(THING_NAME)
# IOT_TOPIC_SHADOW_UPDATE = '$aws/things/{}/shadow/update'.format(THING_NAME)


def timeInMillis(): return int(round(time.time() * 1000))

def parseIncomingShadow(shadow):

    global FACTORY_CAMERA

    if 'state' in shadow:
        state = shadow['state']

        if 'desired' in state:
            desired = state['desired']

            if 'factoryCamera' in desired:

                factoryCamera = desired['factoryCamera']

                if 'capture' in factoryCamera and FACTORY_CAMERA['capture'] != factoryCamera['capture']:
                    FACTORY_CAMERA['capture'] = factoryCamera['capture']
                    print("parseIncomingShadow: updating capture to {}".format(FACTORY_CAMERA['capture']))
                if 's3Upload' in factoryCamera and FACTORY_CAMERA['s3Upload'] != factoryCamera['s3Upload']:
                    FACTORY_CAMERA['s3Upload'] = factoryCamera['s3Upload']
                    print("parseIncomingShadow: updating s3Upload to {}".format(FACTORY_CAMERA['s3Upload']))
                if 's3Bucket' in factoryCamera and FACTORY_CAMERA['s3Bucket'] != factoryCamera['s3Bucket']:
                    FACTORY_CAMERA['s3Bucket'] = factoryCamera['s3Bucket']
                    print("parseIncomingShadow: updating s3Bucket to {}".format(FACTORY_CAMERA['s3Bucket']))
                if 's3KeyPrefix' in factoryCamera and FACTORY_CAMERA['s3KeyPrefix'] != factoryCamera['s3KeyPrefix']:
                    FACTORY_CAMERA['s3KeyPrefix'] = factoryCamera['s3KeyPrefix']
                    print("parseIncomingShadow: updating s3KeyPrefix to {}".format(FACTORY_CAMERA['s3KeyPrefix']))
                if 'resolution' in factoryCamera and FACTORY_CAMERA['resolution'] != factoryCamera['resolution']:
                    FACTORY_CAMERA['resolution'] = factoryCamera['resolution']
                    print("parseIncomingShadow: updating resolution to {}".format(FACTORY_CAMERA['resolution']))
                if 'crop' in factoryCamera and FACTORY_CAMERA['crop'] != factoryCamera['crop']:
                    FACTORY_CAMERA['crop'] = factoryCamera['crop']
                    print("parseIncomingShadow: updating crop to {}".format(FACTORY_CAMERA['crop']))
                if 'categories' in factoryCamera and FACTORY_CAMERA['categories'] != factoryCamera['categories']:
                    FACTORY_CAMERA['categories'] = factoryCamera['categories']
                    print("parseIncomingShadow: updating categories to {}".format(FACTORY_CAMERA['categories']))

                GGIOT.updateThingShadow(payload={'state': {'reported': {'factoryCamera': FACTORY_CAMERA}}})

def parseResolution(strResolution):
    resolution = strResolution.split('x')
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])

try:
    GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

    GGIOT.info("Start of lambda function")
    GGIOT.info('OpenCV '+cv2.__version__)

    parseIncomingShadow(GGIOT.getThingShadow())

    resolution = parseResolution(FACTORY_CAMERA['resolution'])
    frame = 255*np.ones([resolution[0], resolution[1], 3])
    OUTPUT = FileOutput('/tmp/results.mjpeg', frame, GGIOT)
    OUTPUT.start()

    CAMERA = VideoStream(PATH_TO_CAMERA, resolution[0], resolution[1])
    ret, frame = CAMERA.read()
    ret, frame = CAMERA.read()

    GGIOT.info('Loading model at ' + ML_MODEL_PATH)
    model = Infer(path=ML_MODEL_PATH, size=parseResolution(
        FACTORY_CAMERA['crop'])[1], categories=FACTORY_CAMERA['categories'])

    print("Starting")

except Exception as err:
    GGIOT.exception(str(err))
    print("Error: {}".format(str(err)))
    time.sleep(1)

last_update = timeInMillis()
nbFramesProcessed = 0
fps = 0


def camera_handler():

    global last_update
    global fps
    global nbFramesProcessed
    global FACTORY_CAMERA

    print('Frame: reading')
    ret, frame = CAMERA.read()
    print('Frame: read')
    if ret == False:
        print('Something is wrong, cant read frame')
        time.sleep(5)
        return

    size = parseResolution(FACTORY_CAMERA['resolution'])
    crop = parseResolution(FACTORY_CAMERA['crop'])

    frame = cv2.resize(frame, size)
    font = cv2.FONT_HERSHEY_SIMPLEX

    topleft = ((size[0] - crop[0]) / 2, (size[1] - crop[1]) / 2)
    bottomright = ((size[0] + crop[0]) / 2, (size[1] + crop[1]) / 2)

    inference_frame = frame[topleft[1]:bottomright[1]:1, topleft[0]:bottomright[0]:1]

    GGIOT.info('Frame loaded: {}, {}'.format(frame.size, frame.shape))

    try:
        category, probability = model.do(inference_frame)

        nbFramesProcessed += 1

        now = time.time()
        if now - last_update >= 1:
            fps = nbFramesProcessed / (now - last_update)
            fps = math.floor(fps * 100) / 100
            last_update = time.time()
            nbFramesProcessed = 0

        GGIOT.publish(TOPIC_INFERENCE, {
            "type":  "inference",
            "payload": {
                "probability": str(probability),
                "fps": str(fps),
                "category": category,
                "frame": {
                    "size": inference_frame.size,
                    "shape": inference_frame.shape
                }
            }
        })

    except Exception as err:
        GGIOT.exception(str(err))
        raise err

    # cv2.rectangle(frame, topleft, bottomright, (0, 0, 255), 3)
    cv2.putText(frame, 'FPS: {}'.format(str(fps)), (5, size[1] - 5), font, 0.4, (0, 0, 255), 1)
    OUTPUT.update(frame)

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


def lambda_handler(event, context):
    GGIOT.info({"location": "lambda_handler", "event": event})
    camera_handler()
    return


# def lambda_handler(event, context):

#     global last_update
#     global fps
#     global nbFramesProcessed

#     ret, frame = awscam.getLastFrame()

#     inference_size_x = 224
#     inference_size_y = 224

#     w = inference_size_x * 2
#     h = inference_size_y * 2
#     x = 1920 / 2 - w / 2
#     y = 1080 / 2 - h / 2

#     frame = frame[y:y+h, x:x+w]

#     PUB.info('Frame loaded: {}, {}'.format(frame.size, frame.shape))

#     frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#     frame = cv2.resize(frame, (inference_size_x, inference_size_y))  # resize

#     PUB.info('Frame resized: {}, {}'.format(frame.size, frame.shape))

#     try:
#         category, probability = model.do(frame)

#         nbFramesProcessed += 1

#         now = time.time()
#         if now - last_update >= 1:
#             fps = nbFramesProcessed / (now - last_update)
#             fps = math.floor(fps * 100) / 100
#             last_update = time.time()
#             nbFramesProcessed = 0


#         advice = 'inconclusive'

#         if probability > 0.8:
#             if category == 'hat':
#                 advice = 'safe'
#             elif category == 'nohat':
#                 advice = 'not safe'

#         PUB.publish(IOT_TOPIC_INFERENCE, {
#             "type":  "inference",
#             "payload": {
#                 "probability": str(probability),
#                 "advice": advice,
#                 "fps": str(fps),
#                 "category": category,
#                 "frame": {
#                     "size": frame.size,
#                     "shape": frame.shape
#                 }
#             }
#         })

#     except Exception as err:
#         PUB.exception(str(err))
#         raise err

#     OUTPUT.update(frame)

#     return

# class MainAppThread(Thread):

#     def __init__(self):
#         super(MainAppThread, self).__init__()
#         self.stop_request = Event()
#         print("MainAppThread.init")

#     def join(self):
#         self.stop_request.set()

#     def run(self):
#         try:
#             while 42:
#                 lambda_handler({}, {})

#         except Exception as err:
#             PUB.exception(str(err))
#             time.sleep(1)

#         # mainAppThread.start()


# mainAppThread = MainAppThread()
# mainAppThread.start()


# # def main_loop():
# #     try:
# #         last_update = time.time()
# #         results = []
# #         fps = 0
# #         while 42 :
# #             # # in case the belt is stuck in a position with an unsafe lego figure in view,
# #             # # create the file RESUME_COMMAND_FILE_PATH to force resume the belt
# #             # if os.path.exists(RESUME_COMMAND_FILE_PATH):
# #             #     PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_FORWARD, "speed": BELT_DEFAULT_SPEED } } })

# #             ret, frame = awscam.getLastFrame()

# #             inference_size_x = 224
# #             inference_size_y = 224

# #             w = inference_size_x * 2
# #             h = inference_size_y * 2
# #             x = 1920 / 2 - w / 2
# #             y = 1080 / 2 - h / 2

# #             frame = frame[y:y+h, x:x+w]

# #             print(frame)

# #             PUB.info('Frame loaded {}, {}'.format(frame.size, frame.shape))

# #             frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
# #             frame = cv2.resize(frame, (inference_size_x, inference_size_y)) # resize

# #             PUB.info('Frame resized')

# #             try:
# #                 category, probability = model.do(frame)
# #                 results.append(category)
# #                 font = cv2.FONT_HERSHEY_DUPLEX
# #                 title = str(fps) + " - " + category + " - " + str(probability)

# #                 PUB.publish(IOT_TOPIC_INFERENCE, {
# #                     "type":  "inference",
# #                     "payload": {
# #                         "probability": str(probability),
# #                         "title": title
# #                     }
# #                 })

# #                 if probability > 0.6:
# #                     prob_no_hat = probability
# #                     if category == 'hat':
# #                         prob_no_hat = 1.0 - probability
# #                     elif category == 'nohat':
# #                         probability =  1.0 - probability
# #                     cv2.rectangle(frame, (0, 0), (int(frame.shape[1] * 0.2 * prob_no_hat), 80),
# #                                 (0, 0, 255), -1)
# #                     cv2.rectangle(frame, (0, 90), (int(frame.shape[1] * 0.2 * probability), 170), (0, 255, 0), -1)
# #                     font = cv2.FONT_HERSHEY_SIMPLEX
# #                     cv2.putText(frame, 'Not Safe', (10, 70), font, 1, (225, 225, 225), 8)
# #                     cv2.putText(frame, 'Safe', (10, 160), font, 1, (225, 225, 225), 8)

# #                     # if prob_no_hat > 0.8: # definitely not safe
# #                     #     PUB.info('')
# #                     # #     PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_STOP, "speed": BELT_DEFAULT_SPEED } } })
# #                     # elif probability > 0.8: # definitely safe
# #                     #     PUB.info('Frame resized')
# #                     # #     PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_FORWARD, "speed": BELT_DEFAULT_SPEED } } })

# #             except Exception as err:
# #                 PUB.exception(str(err))
# #                 raise err

# #             now = time.time()
# #             if now - last_update >= 1:
# #                 last_update = time.time()
# #                 PUB.events(results)
# #                 fps = len(results)
# #                 results = []

# #             OUTPUT.update(frame)

# #     except Exception as err:
# #         PUB.exception(str(err))
# #         time.sleep(1)

# #     Timer(0, main_loop).start()

# # OUTPUT.stop()
# # VS.stop()

# # main_loop()
