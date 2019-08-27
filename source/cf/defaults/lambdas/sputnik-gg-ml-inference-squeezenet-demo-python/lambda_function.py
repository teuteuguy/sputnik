from camera import VideoStream
import sys
import os
import time
from threading import Event, Thread, Timer
import math

from ggiot import GGIoT

#############################################
# Helpers
#############################################


def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default


def timeInMillis(): return int(round(time.time() * 1000))


def lambda_handler(event, context):
    return


def parseResolution(strResolution):
    resolution = strResolution.split('x')
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])


THING_NAME = get_parameter('AWS_IOT_THING_NAME', 'Unknown')
CAMERA_TYPE = get_parameter("CAMERA_TYPE", "")
PATH_TO_CAMERA = get_parameter("PATH_TO_CAMERA", "/dev/video0")
PREFIX = 'sputnik'
TOPIC_CAMERA = '{0}/{1}/camera'.format(PREFIX, THING_NAME)
ML_MODEL_PATH = get_parameter('ML_MODEL_PATH', '')
RESOLUTION = "224x224"
CAMERA = None


try:
    print("Start of lambda function")
    GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

    resolution = parseResolution(RESOLUTION)

    print("Getting last camera frame")
    CAMERA = VideoStream(camera_type=CAMERA_TYPE, path_to_camera=PATH_TO_CAMERA,
                         width=resolution[0], height=resolution[1])

    import numpy as np  # pylint: disable=import-error
    import cv2  # pylint: disable=import-error

    print("CAMERA: Starting the camera with 2 reads...")
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    CAMERA.start()

    # import awscam  # pylint: disable=import-error
    from file_output import FileOutput

    print("OpenCV: {}".format(cv2.__version__))

    print("Initilizing ouput file")
    frame = CAMERA.get_white_frame()
    OUTPUT = FileOutput('/tmp/results.mjpeg', frame, GGIOT)
    OUTPUT.start()
    OUTPUT.update(frame)

    print("Loading model at: {}".format(ML_MODEL_PATH))
    import load_model
    MODEL = load_model.ImagenetModel(
        synset_path=ML_MODEL_PATH + 'synset.txt',
        network_prefix=ML_MODEL_PATH + 'squeezenet_v1.1',
        label_names=None
    )


except Exception as err:
    print("Exception: {}".format(err))
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
