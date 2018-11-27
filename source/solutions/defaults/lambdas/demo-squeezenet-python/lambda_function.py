import sys
import os
import numpy as np  # pylint: disable=import-error
import cv2 # pylint: disable=import-error
import time
from threading import Event, Thread, Timer
import math
import load_model

# import awscam  # pylint: disable=import-error
from file_output import FileOutput

from ggiot import GGIoT
from camera import VideoStream

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter('AWS_IOT_THING_NAME', 'Unknown')
CAMERA_TYPE = get_parameter("CAMERA_TYPE", "")
PATH_TO_CAMERA = get_parameter("PATH_TO_CAMERA", "/dev/video0")
PREFIX = 'mtm'
TOPIC_CAMERA = 'mtm/{}/camera'.format(THING_NAME)
ML_MODEL_PATH = get_parameter('ML_MODEL_PATH', '')
RESOLUTION = "858x480"
CAMERA = None

def timeInMillis(): return int(round(time.time() * 1000))

def lambda_handler(event, context):
    return


def parseResolution(strResolution):
    resolution = strResolution.split('x')
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])

try:
    print("Start of lambda function")
    GGIOT = GGIoT(thing=THING_NAME, prefix='mtm')

    GGIOT.info('OpenCV '+cv2.__version__)

    GGIOT.info('Initilizing ouput file')
    resolution = parseResolution(RESOLUTION)
    frame = 255*np.ones([resolution[0], resolution[1], 3])
    OUTPUT = FileOutput('/tmp/results.mjpeg', frame, GGIOT)
    OUTPUT.start()
    OUTPUT.update(frame)

    GGIOT.info('Getting last camera frame')

    CAMERA = VideoStream(camera_type=CAMERA_TYPE, path_to_camera=PATH_TO_CAMERA,
                         width=resolution[0], height=resolution[1])
    print("CAMERA: Starting the camera with 2 reads...")
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    CAMERA.start()

    GGIOT.info('Loading model at ' + ML_MODEL_PATH)
    MODEL = load_model.ImagenetModel(
        synset_path=ML_MODEL_PATH + 'synset.txt',
        network_prefix=ML_MODEL_PATH + 'squeezenet_v1.1',
        label_names=None
        )


except Exception as err:
    GGIOT.exception(str(err))
    time.sleep(1)

last_update = timeInMillis()
nbFramesProcessed = 0
fps = 0

def camera_handler():

    global CAMERA
    global last_update
    global fps
    global nbFramesProcessed

    ret, frame = CAMERA.read()
    print('Frame read')
    if ret == False:
        print('Something is wrong, cant read frame')
        time.sleep(5)
        return

    # ret, frame = awscam.getLastFrame()
    print('Frame resize')
    frame = cv2.resize(frame, parseResolution(RESOLUTION))
    font = cv2.FONT_HERSHEY_SIMPLEX

    print('Frame resized')
    inference_size_x = parseResolution(RESOLUTION)[0] / 2
    inference_size_y = parseResolution(RESOLUTION)[1] / 2

    GGIOT.info('Frame loaded: {}, {}'.format(frame.size, frame.shape))

    if MODEL is not None:
        payload = []

        try:
            predictions = MODEL.predict_from_image(
                cvimage=frame,
                reshape=(inference_size_x, inference_size_y),
                N=15)
            print(predictions)

            for item in predictions:
                p, n = item
                prediction = {
                    "probability": "{}".format(p),
                    "name": n
                }
                payload.append(prediction)

            nbFramesProcessed += 1

            timeBetweenFrames = timeInMillis() - last_update
            if timeBetweenFrames > 1000:
                fps = math.floor(100 * (fps + (1000 * nbFramesProcessed / timeBetweenFrames)) / 2) / 100
                nbFramesProcessed = 0
                last_update = timeInMillis()

            GGIOT.publish(TOPIC_CAMERA, {
                "fps": str(fps),
                "frame": {
                    "size": frame.size,
                    "shape": frame.shape
                },
                "predictions": payload
            })

        except Exception as err:
            GGIOT.exception(str(err))
            print("Exception: {}".format(str(err)))
            e = sys.exc_info()[0]
            print("Exception occured during prediction: %s" % e)
            print(sys.exc_info())

    cv2.putText(frame, 'FPS: {}'.format(str(fps)), (5, parseResolution(RESOLUTION)[1] - 5), font, 0.4, (0, 0, 255), 1)

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
