import os, sys
import numpy as np  # pylint: disable=import-error
import cv2  # pylint: disable=import-error
import mxnet as mx  # pylint: disable=import-error
import time
from threading import Event, Thread, Timer, Lock
import math
import json

# import awscam
from file_output import FileOutput

# from publish import Publisher
from ggiot import GGIoT
from camera import VideoStream
from save_frames import SaveFrames
from inference import Infer

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter("AWS_IOT_THING_NAME", "Unknown")
CAMERA_TYPE = get_parameter("CAMERA_TYPE", "")
PATH_TO_CAMERA = get_parameter("PATH_TO_CAMERA", "/dev/video0")
ML_MODEL_PATH = get_parameter("ML_MODEL_PATH", "")
ML_MODEL_NAME = get_parameter("ML_MODEL_NAME", "")
ML_MODEL_TYPE = get_parameter("ML_MODEL_TYPE", "")
PREFIX = "sputnik"
TOPIC_INFERENCE = "{}/{}/inference".format(PREFIX, THING_NAME)
TOPIC_SHADOW_ACCEPTED = "$aws/things/{}/shadow/update/accepted".format(THING_NAME)
CAMERA = None

INFERENCE_CAMERA = {
    "capture": "Off",
    "threaded": "Off",
    "s3Upload": "Off",
    "s3Bucket": "Off",
    "resolution": "858x480",
    "crop": "224x224",
    "s3KeyPrefix": "ml-inference-camera/{}/default".format(THING_NAME),
    "categories": []
}
FACTORY_LOCK = Lock()

def timeInMillis(): return int(round(time.time() * 1000))

def parseIncomingShadow(shadow):

    global INFERENCE_CAMERA

    if "state" in shadow:
        state = shadow["state"]

        if "desired" in state:
            desired = state["desired"]

            if "inferenceCamera" in desired:

                inferenceCamera = desired["inferenceCamera"]

                FACTORY_LOCK.acquire()

                if "capture" in inferenceCamera and INFERENCE_CAMERA["capture"] != inferenceCamera["capture"]:
                    INFERENCE_CAMERA["capture"] = inferenceCamera["capture"]
                    print("parseIncomingShadow: updating capture to {}".format(INFERENCE_CAMERA["capture"]))
                if "threaded" in inferenceCamera and INFERENCE_CAMERA["threaded"] != inferenceCamera["threaded"]:
                    INFERENCE_CAMERA["threaded"] = inferenceCamera["threaded"]
                    print("parseIncomingShadow: updating threaded to {}".format(INFERENCE_CAMERA["threaded"]))
                if "s3Upload" in inferenceCamera and INFERENCE_CAMERA["s3Upload"] != inferenceCamera["s3Upload"]:
                    INFERENCE_CAMERA["s3Upload"] = inferenceCamera["s3Upload"]
                    print("parseIncomingShadow: updating s3Upload to {}".format(INFERENCE_CAMERA["s3Upload"]))
                if "s3Bucket" in inferenceCamera and INFERENCE_CAMERA["s3Bucket"] != inferenceCamera["s3Bucket"]:
                    INFERENCE_CAMERA["s3Bucket"] = inferenceCamera["s3Bucket"]
                    print("parseIncomingShadow: updating s3Bucket to {}".format(INFERENCE_CAMERA["s3Bucket"]))
                if "s3KeyPrefix" in inferenceCamera and INFERENCE_CAMERA["s3KeyPrefix"] != inferenceCamera["s3KeyPrefix"]:
                    INFERENCE_CAMERA["s3KeyPrefix"] = inferenceCamera["s3KeyPrefix"]
                    print("parseIncomingShadow: updating s3KeyPrefix to {}".format(INFERENCE_CAMERA["s3KeyPrefix"]))
                if "resolution" in inferenceCamera and INFERENCE_CAMERA["resolution"] != inferenceCamera["resolution"]:
                    INFERENCE_CAMERA["resolution"] = inferenceCamera["resolution"]
                    print("parseIncomingShadow: updating resolution to {}".format(INFERENCE_CAMERA["resolution"]))
                if "crop" in inferenceCamera and INFERENCE_CAMERA["crop"] != inferenceCamera["crop"]:
                    INFERENCE_CAMERA["crop"] = inferenceCamera["crop"]
                    print("parseIncomingShadow: updating crop to {}".format(INFERENCE_CAMERA["crop"]))
                if "categories" in inferenceCamera and INFERENCE_CAMERA["categories"] != inferenceCamera["categories"]:
                    INFERENCE_CAMERA["categories"] = inferenceCamera["categories"]
                    print("parseIncomingShadow: updating categories to {}".format(INFERENCE_CAMERA["categories"]))

                FACTORY_LOCK.release()

                GGIOT.updateThingShadow(payload={"state": {"reported": {"inferenceCamera": INFERENCE_CAMERA}}})

def parseResolution(strResolution):
    resolution = strResolution.split("x")
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])

try:
    GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

    print("Start of lambda function")

    parseIncomingShadow(GGIOT.getThingShadow())

    resolution = parseResolution(INFERENCE_CAMERA["resolution"])
    frame = 255*np.ones([resolution[1], resolution[0], 3])
    OUTPUT = FileOutput("/tmp/results.mjpeg", frame, GGIOT)
    OUTPUT.start()

    crop = parseResolution(INFERENCE_CAMERA["crop"])

    print({
        "message": "Start of lambda function",
        "OpenCV": cv2.__version__,
        "MXNET": mx.__version__,
        "Model": ML_MODEL_PATH + ML_MODEL_NAME,
        "FileOutput": "/tmp/results.mjpeg",
        "Categories": INFERENCE_CAMERA["categories"],
        "Camera": CAMERA_TYPE,
        "PathToCamera": PATH_TO_CAMERA,
        "Resolution": resolution,
        "Crop": crop
    })

    CAMERA = VideoStream(camera_type=CAMERA_TYPE, path_to_camera=PATH_TO_CAMERA, width=resolution[0], height=resolution[1])
    print("CAMERA: Starting the camera with 2 reads...")
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    CAMERA.start()

    MODEL = Infer(
        model_type=ML_MODEL_TYPE,
        model_path=ML_MODEL_PATH,
        model_name=ML_MODEL_NAME,
        width=crop[0],
        height=crop[1],
        categories=INFERENCE_CAMERA["categories"],
        stream=CAMERA.stream
    )

    SAVE_FRAMES = SaveFrames(path="/tmp/")

    GGIOT.info("Starting function")

except Exception as err:
    GGIOT.exception(str(err))
    print("Error: {}".format(str(err)))
    time.sleep(1)

FPS = 0
LAST_UPDATE = timeInMillis()
NB_FRAMES_PROCESSED = 0

def camera_handler():

    global LAST_UPDATE
    global FPS
    global NB_FRAMES_PROCESSED
    global INFERENCE_CAMERA
    global MODEL

    print("Frame: reading")
    ret, frame = CAMERA.read()
    if ret == False:
        print("Something is wrong, cant read frame")
        print(frame)
        time.sleep(5)
        return

    size = parseResolution(INFERENCE_CAMERA["resolution"])
    crop = parseResolution(INFERENCE_CAMERA["crop"])

    frame = cv2.resize(frame, size)
    font = cv2.FONT_HERSHEY_SIMPLEX

    topleft = ((size[0] - crop[0]) / 2, (size[1] - crop[1]) / 2)
    bottomright = ((size[0] + crop[0]) / 2, (size[1] + crop[1]) / 2)

    cv2.rectangle(frame, topleft, bottomright, (0, 0, 255), 3)

    inference_frame = frame[topleft[1]:bottomright[1]:1, topleft[0]:bottomright[0]:1]

    try:

        result = MODEL.do(inference_frame)
        print("Inference result: {}".format(json.dumps(result)))

        NB_FRAMES_PROCESSED += 1

        now = timeInMillis()
        if now - LAST_UPDATE >= 1000:
            FPS = 1000 * NB_FRAMES_PROCESSED / (now - LAST_UPDATE)
            FPS = math.floor(FPS * 10000) / 10000
            LAST_UPDATE = timeInMillis()
            NB_FRAMES_PROCESSED = 0

        GGIOT.publish(TOPIC_INFERENCE, {
            # "type":  "inference",
            # "payload": {
            "results": result,
            "fps": str(FPS),
            "frame": {
                "size": inference_frame.size,
                "shape": inference_frame.shape
            }
            # }
        })

        cv2.rectangle(frame, (0, size[1] - 20), (size[0], size[1]), (0, 0, 0), -1)
        cv2.putText(frame, "FPS: {} {}".format(str(FPS), json.dumps(result)), (5, size[1] - 5), font, 0.4, (0, 255, 0), 1)

        if INFERENCE_CAMERA["capture"] == "On":
            filename = SAVE_FRAMES.getTimestampFilename()
            SAVE_FRAMES.saveToFile(
                filename=filename,
                frame=frame
            )

    except Exception as err:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type, fname, exc_tb.tb_lineno)
        GGIOT.exception(str(err))
        raise err

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
                # FACTORY_LOCK.acquire()
                if "threaded" in INFERENCE_CAMERA and INFERENCE_CAMERA["threaded"] == "On":
                    # FACTORY_LOCK.release()
                    camera_handler()

        except Exception as err:
            GGIOT.exception(str(err))
            time.sleep(1)


mainAppThread = MainAppThread()
mainAppThread.start()


def lambda_handler(event, context):
    GGIOT.info({
        "location": "lambda_handler",
        "event": event
    })

    try:
        topic = context.client_context.custom["subject"]
        print("Topic: {}".format(topic))
        if topic == TOPIC_SHADOW_ACCEPTED:
            print("lambda_handler: {}: Shadow topic".format(topic))
            parseIncomingShadow(event)
        else:
            print("lambda_handler: {}: Some other topic".format(topic))
            camera_handler()
    except Exception as err:
        print("ERROR in the context: {}".format(str(err)))

    return

