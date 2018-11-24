from ggiot import GGIoT
import os
import sys
import time
import json

THING_NAME_CAMERA = "{}".format(os.environ["THING_NAME_CAMERA"])
THING_NAME_BELT = "{}".format(os.environ["THING_NAME_BELT"])
PREFIX = "mtm"
TOPIC_SENSORS_PROXIMITY = "{}/{}/sensors/proximity".format(PREFIX, THING_NAME_BELT)
TOPIC_TRIGGER = "make/inference"
TOPIC_INFERENCE = "{}/{}/inference".format(PREFIX, THING_NAME_CAMERA)

GGIOT = GGIoT(thing=THING_NAME_BELT, prefix=PREFIX)

print("")
print("Start of Lambda function")
print("THING_NAME_BELT: " + THING_NAME_BELT)
print("TOPIC_SENSORS_PROXIMITY: " + TOPIC_SENSORS_PROXIMITY)
print("")
print("")

def getBeltState():
    data = GGIOT.getThingShadow()

    if "state" in data and "reported" in data["state"]:
        return data["state"]["reported"]
    else:
        return {}


def isStopped(reported):
    return reported["mode"] == 2


def isRunning(reported):
    return reported["mode"] != 2


def sensor1(event):
    return event["sensor1"] == 1

def sensor2(event):
    return event["sensor2"] == 1

def turnBeltOff():
    GGIOT.updateThingShadow(payload={"state": {"desired": { "mode": 2, "speed": 1}}})

def turnBeltOn():
    GGIOT.updateThingShadow(payload={"state": {"desired": {"mode": 3, "speed": 1}}})

def triggerPicture():
    GGIOT.publish(TOPIC_TRIGGER, {})


def lambda_handler(event, context):
    print("lambda_handler: {}".format(json.dumps(event)))

    topic = context.client_context.custom["subject"]
    print("Topic: {}".format(topic))
    if topic == TOPIC_SENSORS_PROXIMITY:
        if event["sensor1"] == 1 or event["sensor2"] == 1:
            # reported = getBeltState()
            # if "mode" in reported:
            if event["sensor2"] == 1 and event["mode"] != 2:
                # if sensor2(event) and isRunning(reported):
                print("handler: Need to stop the belt.")
                turnBeltOff()
                triggerPicture()
            if event["sensor1"] == 1 and event["mode"] == 2:
                # if sensor1(event) and not isRunning(reported):
                print("handler: Need to start the belt.")
                turnBeltOn()

    if topic == TOPIC_INFERENCE and "results" in event:
        if event["results"]["hat"] > 80:
            print("GOOD")
            turnBeltOn()

    return
