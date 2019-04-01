import os
import numpy as np  # pylint: disable=import-error
import cv2  # pylint: disable=import-error
import time
from threading import Event, Thread, Timer
import math

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
TOPIC_CAMERA = "{}/{}/camera".format(PREFIX, THING_NAME)
CAMERA = None

SIMPLE_CAMERA = {
    "capture": "Off",
    "sleepInSecsAsStr": "0.5",
    "s3UploadSleepInSecsAsStr": "5",
    "s3Upload": "Off",
    "s3Bucket": "Off",
    "s3KeyPrefix": "deeplens-image-capture/{}/default".format(THING_NAME),
    "resolution": "1920x1080",
    "crop": "224x224"
}


def timeInMillis(): return int(round(time.time() * 1000))

def parseIncomingShadow(shadow):

    global SIMPLE_CAMERA

    if "state" in shadow:
        state = shadow["state"]

        if "desired" in state:
            desired = state["desired"]

            if "simpleCamera" in desired:

                simpleCamera = desired["simpleCamera"]

                if "capture" in simpleCamera and SIMPLE_CAMERA["capture"] != simpleCamera["capture"]:
                    SIMPLE_CAMERA["capture"] = simpleCamera["capture"]
                    print("parseIncomingShadow: updating capture to {}".format(SIMPLE_CAMERA["capture"]))
                if "sleepInSecsAsStr" in simpleCamera and SIMPLE_CAMERA["sleepInSecsAsStr"] != simpleCamera["sleepInSecsAsStr"]:
                    SIMPLE_CAMERA["sleepInSecsAsStr"] = simpleCamera["sleepInSecsAsStr"]
                    print("parseIncomingShadow: updating sleepInSecsAsStr to {}".format(
                        SIMPLE_CAMERA["sleepInSecsAsStr"]))
                if "s3UploadSleepInSecsAsStr" in simpleCamera and SIMPLE_CAMERA["s3UploadSleepInSecsAsStr"] != simpleCamera["s3UploadSleepInSecsAsStr"]:
                    SIMPLE_CAMERA["s3UploadSleepInSecsAsStr"] = simpleCamera["s3UploadSleepInSecsAsStr"]
                    print("parseIncomingShadow: updating s3UploadSleepInSecsAsStr to {}".format(
                        SIMPLE_CAMERA["s3UploadSleepInSecsAsStr"]))
                if "s3Upload" in simpleCamera and SIMPLE_CAMERA["s3Upload"] != simpleCamera["s3Upload"]:
                    SIMPLE_CAMERA["s3Upload"] = simpleCamera["s3Upload"]
                    print("parseIncomingShadow: updating s3Upload to {}".format(SIMPLE_CAMERA["s3Upload"]))
                if "s3Bucket" in simpleCamera and SIMPLE_CAMERA["s3Bucket"] != simpleCamera["s3Bucket"]:
                    SIMPLE_CAMERA["s3Bucket"] = simpleCamera["s3Bucket"]
                    print("parseIncomingShadow: updating s3Bucket to {}".format(SIMPLE_CAMERA["s3Bucket"]))
                if "s3KeyPrefix" in simpleCamera and SIMPLE_CAMERA["s3KeyPrefix"] != simpleCamera["s3KeyPrefix"]:
                    SIMPLE_CAMERA["s3KeyPrefix"] = simpleCamera["s3KeyPrefix"]
                    print("parseIncomingShadow: updating s3KeyPrefix to {}".format(SIMPLE_CAMERA["s3KeyPrefix"]))
                if "resolution" in simpleCamera and SIMPLE_CAMERA["resolution"] != simpleCamera["resolution"]:
                    SIMPLE_CAMERA["resolution"] = simpleCamera["resolution"]
                    print("parseIncomingShadow: updating resolution to {}".format(SIMPLE_CAMERA["resolution"]))
                if "crop" in simpleCamera and SIMPLE_CAMERA["crop"] != simpleCamera["crop"]:
                    SIMPLE_CAMERA["crop"] = simpleCamera["crop"]
                    print("parseIncomingShadow: updating crop to {}".format(SIMPLE_CAMERA["crop"]))

                GGIOT.updateThingShadow(payload={"state": {"reported": {"simpleCamera": SIMPLE_CAMERA}}})

def parseResolution(strResolution):
    resolution = strResolution.split("x")
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])

try:
    GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

    GGIOT.info("Start of lambda function")
    GGIOT.info("OpenCV "+cv2.__version__)

    parseIncomingShadow(GGIOT.getThingShadow())

    resolution = parseResolution(SIMPLE_CAMERA["resolution"])
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

def saveFrameToFile(filename, frame):
    fullPath = "/tmp/" + filename
    print("saveFrameToFile: Saving frame to {}".format(fullPath))

    localWriteReturn = cv2.imwrite(fullPath, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not localWriteReturn:
        raise Exception("Failed to save frame to file")

    return fullPath

def sendFileToS3(fullPath, filename):

    global SIMPLE_CAMERA

    print("sendFileToS3: Going to try sending {} to S3".format(filename))

    try:
        session = Session()
        s3 = session.create_client("s3")

        with open(fullPath, "rb") as f:
            data = f.read()

        s3Key = SIMPLE_CAMERA["s3KeyPrefix"] + "/" + filename
        s3.put_object(Bucket=SIMPLE_CAMERA["s3Bucket"], Key=s3Key, Body=data)

        return True, s3Key

    except Exception as ex:
        print("Failed to upload to s3: {}".format(ex))
        return False, False

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
                GGIOT.exception("Upload to S3 failed for: {}".format(self.filename))
        except Exception as err:
            GGIOT.exception(str(err))
            time.sleep(1)


FPS = 0
LAST_UPDATE = timeInMillis()
NB_FRAMES_PROCESSED = 0

def camera_handler():

    global LAST_UPDATE
    global FPS
    global NB_FRAMES_PROCESSED
    global SIMPLE_CAMERA

    print("Frame: reading")
    ret, frame = CAMERA.read()
    if ret == False:
        print("Something is wrong, cant read frame")
        print(frame)
        time.sleep(5)
        return

    size = parseResolution(SIMPLE_CAMERA["resolution"])
    crop = parseResolution(SIMPLE_CAMERA["crop"])

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

    if SIMPLE_CAMERA["capture"] == "On":

        # Create a filename for the given frame to be used through this loop
        timestamp = getTimestamp()

        filename = timestamp + ".jpg"

        # Save frame to disk
        fullPath = saveFrameToFile(
            filename=filename,
            frame=frame
        )

        GGIOT.publish(TOPIC_CAMERA, {
            "fps": str(FPS),
            "frame": {
                "size": frame.size,
                "shape": frame.shape
            },
            "filename": filename
        })

        if SIMPLE_CAMERA["s3Bucket"] != "Off" and SIMPLE_CAMERA["s3Upload"] == "On":
            s3Thread = S3Thread(fullPath, filename)
            s3Thread.start()
            time.sleep(float(SIMPLE_CAMERA["s3UploadSleepInSecsAsStr"]))

        if SIMPLE_CAMERA["s3Upload"] == "Off":
            time.sleep(float(SIMPLE_CAMERA["sleepInSecsAsStr"]))

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

