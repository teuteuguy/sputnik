import os
import numpy as np  # pylint: disable=import-error
import cv2  # pylint: disable=import-error
import mxnet as mx  # pylint: disable=import-error
import time
from threading import Event, Thread, Timer, Lock
import math

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
PREFIX = "mtm"
TOPIC_INFERENCE = "{}/{}/inference".format(PREFIX, THING_NAME)
TOPIC_SHADOW_ACCEPTED = "$aws/things/{}/shadow/update/accepted".format(THING_NAME)
CAMERA = None

FACTORY_CAMERA = {
    "capture": "Off",
    "threaded": "Off",
    "s3Upload": "Off",
    "s3Bucket": "Off",
    "resolution": "858x480",
    "crop": "224x224",
    "s3KeyPrefix": "mini-connected-factory-camera-v1.1/{}/default".format(THING_NAME),
    "categories": ["hat", "nohat", "nolego"]
}
FACTORY_LOCK = Lock()

def timeInMillis(): return int(round(time.time() * 1000))

def parseIncomingShadow(shadow):

    global FACTORY_CAMERA

    if "state" in shadow:
        state = shadow["state"]

        if "desired" in state:
            desired = state["desired"]

            if "factoryCamera" in desired:

                factoryCamera = desired["factoryCamera"]

                FACTORY_LOCK.acquire()

                if "capture" in factoryCamera and FACTORY_CAMERA["capture"] != factoryCamera["capture"]:
                    FACTORY_CAMERA["capture"] = factoryCamera["capture"]
                    print("parseIncomingShadow: updating capture to {}".format(FACTORY_CAMERA["capture"]))
                if "threaded" in factoryCamera and FACTORY_CAMERA["threaded"] != factoryCamera["threaded"]:
                    FACTORY_CAMERA["threaded"] = factoryCamera["threaded"]
                    print("parseIncomingShadow: updating threaded to {}".format(FACTORY_CAMERA["threaded"]))
                if "s3Upload" in factoryCamera and FACTORY_CAMERA["s3Upload"] != factoryCamera["s3Upload"]:
                    FACTORY_CAMERA["s3Upload"] = factoryCamera["s3Upload"]
                    print("parseIncomingShadow: updating s3Upload to {}".format(FACTORY_CAMERA["s3Upload"]))
                if "s3Bucket" in factoryCamera and FACTORY_CAMERA["s3Bucket"] != factoryCamera["s3Bucket"]:
                    FACTORY_CAMERA["s3Bucket"] = factoryCamera["s3Bucket"]
                    print("parseIncomingShadow: updating s3Bucket to {}".format(FACTORY_CAMERA["s3Bucket"]))
                if "s3KeyPrefix" in factoryCamera and FACTORY_CAMERA["s3KeyPrefix"] != factoryCamera["s3KeyPrefix"]:
                    FACTORY_CAMERA["s3KeyPrefix"] = factoryCamera["s3KeyPrefix"]
                    print("parseIncomingShadow: updating s3KeyPrefix to {}".format(FACTORY_CAMERA["s3KeyPrefix"]))
                if "resolution" in factoryCamera and FACTORY_CAMERA["resolution"] != factoryCamera["resolution"]:
                    FACTORY_CAMERA["resolution"] = factoryCamera["resolution"]
                    print("parseIncomingShadow: updating resolution to {}".format(FACTORY_CAMERA["resolution"]))
                if "crop" in factoryCamera and FACTORY_CAMERA["crop"] != factoryCamera["crop"]:
                    FACTORY_CAMERA["crop"] = factoryCamera["crop"]
                    print("parseIncomingShadow: updating crop to {}".format(FACTORY_CAMERA["crop"]))
                if "categories" in factoryCamera and FACTORY_CAMERA["categories"] != factoryCamera["categories"]:
                    FACTORY_CAMERA["categories"] = factoryCamera["categories"]
                    print("parseIncomingShadow: updating categories to {}".format(FACTORY_CAMERA["categories"]))

                FACTORY_LOCK.release()

                GGIOT.updateThingShadow(payload={"state": {"reported": {"factoryCamera": FACTORY_CAMERA}}})

def parseResolution(strResolution):
    resolution = strResolution.split("x")
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])

try:
    GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

    print("Start of lambda function")

    parseIncomingShadow(GGIOT.getThingShadow())

    resolution = parseResolution(FACTORY_CAMERA["resolution"])
    frame = 255*np.ones([resolution[1], resolution[0], 3])
    OUTPUT = FileOutput("/tmp/results.mjpeg", frame, GGIOT)
    OUTPUT.start()

    crop = parseResolution(FACTORY_CAMERA["crop"])

    print({
        "message": "Start of lambda function",
        "OpenCV": cv2.__version__,
        "MXNET": mx.__version__,
        "Model": ML_MODEL_PATH + ML_MODEL_NAME,
        "FileOutput": "/tmp/results.mjpeg",
        "Categories": FACTORY_CAMERA["categories"],
        "Camera": CAMERA_TYPE,
        "PathToCamera": PATH_TO_CAMERA,
        "Resolution": resolution,
        "Crop": crop
    })

    CAMERA = VideoStream(camera_type=CAMERA_TYPE, path_to_camera=PATH_TO_CAMERA, width=resolution[0], height=resolution[1])
    print("CAMERA: Starting the camera with 2 reads...")
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))
    print("CAMERA.read(): {}".format(CAMERA.read()[0]))

    MODEL = Infer(
        model_type=ML_MODEL_TYPE,
        model_path=ML_MODEL_PATH,
        model_name=ML_MODEL_NAME,
        width=crop[0],
        height=crop[1],
        categories=FACTORY_CAMERA["categories"],
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
    global FACTORY_CAMERA
    global MODEL

    print("Frame: reading")
    ret, frame = CAMERA.read()
    if ret == False:
        print("Something is wrong, cant read frame")
        time.sleep(5)
        return

    size = parseResolution(FACTORY_CAMERA["resolution"])
    crop = parseResolution(FACTORY_CAMERA["crop"])

    frame = cv2.resize(frame, size)
    font = cv2.FONT_HERSHEY_SIMPLEX

    topleft = ((size[0] - crop[0]) / 2, (size[1] - crop[1]) / 2)
    bottomright = ((size[0] + crop[0]) / 2, (size[1] + crop[1]) / 2)

    cv2.rectangle(frame, topleft, bottomright, (0, 0, 255), 3)

    inference_frame = frame[topleft[1]:bottomright[1]:1, topleft[0]:bottomright[0]:1]

    # GGIOT.info("Frame loaded: {}, {}, {}, {}".format(inference_frame.size, inference_frame.shape, topleft, bottomright))

    try:

        result = MODEL.do(inference_frame)
        print("Inference result: {}".format(result))

        NB_FRAMES_PROCESSED += 1

        now = timeInMillis()
        if now - LAST_UPDATE >= 1000:
            FPS = 1000 * NB_FRAMES_PROCESSED / (now - LAST_UPDATE)
            FPS = math.floor(FPS * 10000) / 10000
            LAST_UPDATE = timeInMillis()
            NB_FRAMES_PROCESSED = 0

        GGIOT.publish(TOPIC_INFERENCE, {
            "type":  "inference",
            "payload": {
                "results": result,
                "fps": str(FPS),
                "frame": {
                    "size": inference_frame.size,
                    "shape": inference_frame.shape
                }
            }
        })

        cv2.rectangle(frame, (0, size[1] - 40), (size[0], size[1]), (0, 0, 0), -1)
        cv2.putText(frame, "FPS: {} {}".format(str(FPS), result), (5, size[1] - 5), font, 0.4, (0, 255, 0), 1)

        if FACTORY_CAMERA["capture"] == "On":
            filename = SAVE_FRAMES.getTimestampFilename()
            SAVE_FRAMES.saveToFile(
                filename=filename,
                frame=frame
            )

    except Exception as err:
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
                if "threaded" in FACTORY_CAMERA and FACTORY_CAMERA["threaded"] == "On":
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
            print("Shadow topic")
            parseIncomingShadow(event)
        else:
            print("Some other topic")
            camera_handler()
    except Exception as err:
        print("ERROR in the context: {}".format(str(err)))

    return


# def lambda_handler(event, context):

#     global LAST_UPDATE
#     global FPS
#     global NB_FRAMES_PROCESSED

#     ret, frame = awscam.getLastFrame()

#     inference_size_x = 224
#     inference_size_y = 224

#     w = inference_size_x * 2
#     h = inference_size_y * 2
#     x = 1920 / 2 - w / 2
#     y = 1080 / 2 - h / 2

#     frame = frame[y:y+h, x:x+w]

#     PUB.info("Frame loaded: {}, {}".format(frame.size, frame.shape))

#     frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#     frame = cv2.resize(frame, (inference_size_x, inference_size_y))  # resize

#     PUB.info("Frame resized: {}, {}".format(frame.size, frame.shape))

#     try:
#         category, probability = model.do(frame)

#         NB_FRAMES_PROCESSED += 1

#         now = time.time()
#         if now - LAST_UPDATE >= 1:
#             FPS = NB_FRAMES_PROCESSED / (now - LAST_UPDATE)
#             FPS = math.floor(FPS * 100) / 100
#             LAST_UPDATE = time.time()
#             NB_FRAMES_PROCESSED = 0


#         advice = "inconclusive"

#         if probability > 0.8:
#             if category == "hat":
#                 advice = "safe"
#             elif category == "nohat":
#                 advice = "not safe"

#         PUB.publish(IOT_TOPIC_INFERENCE, {
#             "type":  "inference",
#             "payload": {
#                 "probability": str(probability),
#                 "advice": advice,
#                 "fps": str(FPS),
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
# #         LAST_UPDATE = time.time()
# #         results = []
# #         FPS = 0
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

# #             PUB.info("Frame loaded {}, {}".format(frame.size, frame.shape))

# #             frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
# #             frame = cv2.resize(frame, (inference_size_x, inference_size_y)) # resize

# #             PUB.info("Frame resized")

# #             try:
# #                 category, probability = model.do(frame)
# #                 results.append(category)
# #                 font = cv2.FONT_HERSHEY_DUPLEX
# #                 title = str(FPS) + " - " + category + " - " + str(probability)

# #                 PUB.publish(IOT_TOPIC_INFERENCE, {
# #                     "type":  "inference",
# #                     "payload": {
# #                         "probability": str(probability),
# #                         "title": title
# #                     }
# #                 })

# #                 if probability > 0.6:
# #                     prob_no_hat = probability
# #                     if category == "hat":
# #                         prob_no_hat = 1.0 - probability
# #                     elif category == "nohat":
# #                         probability =  1.0 - probability
# #                     cv2.rectangle(frame, (0, 0), (int(frame.shape[1] * 0.2 * prob_no_hat), 80),
# #                                 (0, 0, 255), -1)
# #                     cv2.rectangle(frame, (0, 90), (int(frame.shape[1] * 0.2 * probability), 170), (0, 255, 0), -1)
# #                     font = cv2.FONT_HERSHEY_SIMPLEX
# #                     cv2.putText(frame, "Not Safe", (10, 70), font, 1, (225, 225, 225), 8)
# #                     cv2.putText(frame, "Safe", (10, 160), font, 1, (225, 225, 225), 8)

# #                     # if prob_no_hat > 0.8: # definitely not safe
# #                     #     PUB.info("")
# #                     # #     PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_STOP, "speed": BELT_DEFAULT_SPEED } } })
# #                     # elif probability > 0.8: # definitely safe
# #                     #     PUB.info("Frame resized")
# #                     # #     PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_FORWARD, "speed": BELT_DEFAULT_SPEED } } })

# #             except Exception as err:
# #                 PUB.exception(str(err))
# #                 raise err

# #             now = time.time()
# #             if now - LAST_UPDATE >= 1:
# #                 LAST_UPDATE = time.time()
# #                 PUB.events(results)
# #                 FPS = len(results)
# #                 results = []

# #             OUTPUT.update(frame)

# #     except Exception as err:
# #         PUB.exception(str(err))
# #         time.sleep(1)

# #     Timer(0, main_loop).start()

# # OUTPUT.stop()
# # VS.stop()

# # main_loop()
