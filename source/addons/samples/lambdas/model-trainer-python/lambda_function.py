import os
import numpy as np  # pylint: disable=import-error
import cv2  # pylint: disable=import-error
import time
from threading import Event, Thread, Timer
import math
import json

# import awscam  # pylint: disable=import-error
from file_output import FileOutput

from botocore.session import Session  # pylint: disable=import-error
import boto3  # pylint: disable=import-error

from ggiot import GGIoT
from camera import VideoStream

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter("AWS_IOT_THING_NAME", "Unknown")
CAMERA_TYPE = get_parameter("CAMERA_TYPE", "")
PATH_TO_CAMERA = get_parameter("PATH_TO_CAMERA", "/dev/video0")

PREFIX = "sputnik"
SHADOW_OBJECT_NAME = "modelTrainer"
TOPIC_CAMERA = "{}/{}/camera".format(PREFIX, THING_NAME)
CAMERA = None

SHADOW_OBJECT = {
    "capture": "Off",
    "categories": [],
    "s3Upload": "Off",
    "s3Bucket": "Off",
    "s3KeyPrefix": "model-trainer-v1.0/{}/rawdata".format(THING_NAME),
    "resolution": "858x480",
    "crop": "224x224"
}


def timeInMillis(): return int(round(time.time() * 1000))

def parseIncomingShadow(shadow):

    global SHADOW_OBJECT

    if "state" in shadow:
        state = shadow["state"]

        if "desired" in state:
            desired = state["desired"]

            if SHADOW_OBJECT_NAME in desired:

                obj = desired[SHADOW_OBJECT_NAME]

                if "capture" in obj and SHADOW_OBJECT["capture"] != obj["capture"]:
                    SHADOW_OBJECT["capture"] = obj["capture"]
                    print("parseIncomingShadow: updating capture to {}".format(SHADOW_OBJECT["capture"]))
                if "s3Upload" in obj and SHADOW_OBJECT["s3Upload"] != obj["s3Upload"]:
                    SHADOW_OBJECT["s3Upload"] = obj["s3Upload"]
                    print("parseIncomingShadow: updating s3Upload to {}".format(SHADOW_OBJECT["s3Upload"]))
                if "s3Bucket" in obj and SHADOW_OBJECT["s3Bucket"] != obj["s3Bucket"]:
                    SHADOW_OBJECT["s3Bucket"] = obj["s3Bucket"]
                    print("parseIncomingShadow: updating s3Bucket to {}".format(SHADOW_OBJECT["s3Bucket"]))
                if "s3KeyPrefix" in obj and SHADOW_OBJECT["s3KeyPrefix"] != obj["s3KeyPrefix"]:
                    SHADOW_OBJECT["s3KeyPrefix"] = obj["s3KeyPrefix"]
                    print("parseIncomingShadow: updating s3KeyPrefix to {}".format(SHADOW_OBJECT["s3KeyPrefix"]))
                if "resolution" in obj and SHADOW_OBJECT["resolution"] != obj["resolution"]:
                    SHADOW_OBJECT["resolution"] = obj["resolution"]
                    print("parseIncomingShadow: updating resolution to {}".format(SHADOW_OBJECT["resolution"]))
                if "crop" in obj and SHADOW_OBJECT["crop"] != obj["crop"]:
                    SHADOW_OBJECT["crop"] = obj["crop"]
                    print("parseIncomingShadow: updating crop to {}".format(SHADOW_OBJECT["crop"]))
                if "categories" in obj and SHADOW_OBJECT["categories"] != obj["categories"]:
                    SHADOW_OBJECT["categories"] = obj["categories"]
                    print("parseIncomingShadow: updating categories to {}".format(SHADOW_OBJECT["categories"]))
                    for cat in SHADOW_OBJECT["categories"]:
                        if not os.path.exists("/tmp/{}".format(cat)):
                            os.makedirs("/tmp/{}".format(cat))

                GGIOT.updateThingShadow(payload={"state": {"reported": {SHADOW_OBJECT_NAME: SHADOW_OBJECT}}})

                printShadowObject()

def printShadowObject():
    print(json.dumps(SHADOW_OBJECT))


def parseResolution(strResolution):
    resolution = strResolution.split("x")
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])

try:
    GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

    message = {
        "message": "Start of lambda function",
        "OpenCV": cv2.__version__,
        "FileOutput": "/tmp/results.mjpeg",
        "Camera": CAMERA_TYPE,
        "PathToCamera": PATH_TO_CAMERA,
    }
    GGIOT.info(message)

    parseIncomingShadow(GGIOT.getThingShadow())

    resolution = parseResolution(SHADOW_OBJECT["resolution"])
    frame = 255*np.ones([resolution[0], resolution[1], 3])
    OUTPUT = FileOutput("/tmp/results.mjpeg", frame, GGIOT)
    OUTPUT.start()

    CAMERA = VideoStream(camera_type=CAMERA_TYPE, path_to_camera=PATH_TO_CAMERA,
                         width=resolution[0], height=resolution[1])
    print("CAMERA: Starting the camera with 2 reads...")
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    CAMERA.start()

    print("Starting")


except Exception as err:
    GGIOT.exception(str(err))
    print("Error: {}".format(str(err)))
    time.sleep(1)

def getTimestamp():
    return "{}".format(int(round(time.time() * 1000)))

def saveFrameToFile(path, filename, frame):
    fullPath = "{}{}".format(path, filename)
    print("saveFrameToFile: Saving frame to {}".format(fullPath))

    localWriteReturn = cv2.imwrite(fullPath, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not localWriteReturn:
        raise Exception("Failed to save frame to file")

    return fullPath

def sendFileToS3(fullPath, filename, category="cat1"):

    global SHADOW_OBJECT

    print("sendFileToS3: Going to try sending {} to S3".format(filename))

    try:
        session = Session()
        s3 = session.create_client("s3")

        with open(fullPath, "rb") as f:
            data = f.read()

        s3Key = SHADOW_OBJECT["s3KeyPrefix"] + "/" + category + "/" + filename
        s3.put_object(Bucket=SHADOW_OBJECT["s3Bucket"], Key=s3Key, Body=data)

        return True, s3Key

    except Exception as ex:
        print("Failed to upload to s3: {}".format(ex))
        return False, False


FPS = 0
LAST_UPDATE = timeInMillis()
NB_FRAMES_PROCESSED = 0

def camera_handler():

    global LAST_UPDATE
    global FPS
    global NB_FRAMES_PROCESSED
    global SHADOW_OBJECT

    ret, frame = CAMERA.read()
    if ret == False:
        print("Something is wrong, cant read frame")
        print(frame)
        time.sleep(5)
        return

    size = parseResolution(SHADOW_OBJECT["resolution"])
    crop = parseResolution(SHADOW_OBJECT["crop"])

    frame = cv2.resize(frame, size)
    font = cv2.FONT_HERSHEY_SIMPLEX

    topleft = ((size[0] - crop[0]) / 2, (size[1] - crop[1]) / 2)
    bottomright = ((size[0] + crop[0]) / 2, (size[1] + crop[1]) / 2)

    cv2.rectangle(frame, topleft, bottomright, (0, 0, 255), 3)

    NB_FRAMES_PROCESSED += 1

    now = timeInMillis()
    if now - LAST_UPDATE >= 1000:
        FPS = 1000 * NB_FRAMES_PROCESSED / (now - LAST_UPDATE)
        FPS = math.floor(FPS * 10000) / 10000
        LAST_UPDATE = timeInMillis()
        NB_FRAMES_PROCESSED = 0

    cv2.rectangle(frame, (0, size[1] - 20), (size[0], size[1]), (0, 0, 0), -1)
    cv2.putText(frame, "FPS: {}".format(str(FPS)), (5, size[1] - 5), font, 0.4, (0, 255, 0), 1)

    if SHADOW_OBJECT["capture"] != "Off":

        # Create a filename for the given frame to be used through this loop
        timestamp = getTimestamp()

        filename = timestamp + ".jpg"

        try:

            # Save frame to disk
            fullPath = saveFrameToFile(
                path="/tmp/{}/".format(SHADOW_OBJECT["capture"]),
                filename=filename,
                frame=frame
            )

            print("camera_handler: Saved frame to file {}".format(filename))

            if SHADOW_OBJECT["s3Upload"] == "On":

                    result, s3Key = sendFileToS3(fullPath=fullPath, filename=filename,
                                                category=SHADOW_OBJECT["capture"])
                    if result == True:
                        os.remove(fullPath)
                        message = "camera_handler: uploaded to S3 at {}".format(s3Key)
                        print(message)
                        GGIOT.info(message)
                        GGIOT.publish(TOPIC_CAMERA, {
                            "fps": str(FPS),
                            "frame": {
                                "size": frame.size,
                                "shape": frame.shape
                            },
                            "s3Key": s3Key
                        })
                    else:
                        message = "camera_handler: upload to S3 failed for {}".format(filename)
                        print(message)
                        GGIOT.exception(message)

            else:
                GGIOT.publish(TOPIC_CAMERA, {
                    "fps": str(FPS),
                    "frame": {
                        "size": frame.size,
                        "shape": frame.shape
                    },
                    "filename": filename
                })
                time.sleep(1)

        except Exception as err:
            GGIOT.exception(str(err))
            time.sleep(1)

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
    parseIncomingShadow(event)
    return

