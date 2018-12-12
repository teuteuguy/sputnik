from ggiot import GGIoT
import os
import sys
import time
import json

PREFIX = "mtm"

THING_NAME_CAMERA = "{}".format(os.environ["THING_NAME_CAMERA"])
THING_NAME_BELT = "{}".format(os.environ["THING_NAME_BELT"])

INPUT_TOPIC_BELT_PROXIMITY = "{}/{}/sensors/proximity".format(PREFIX, THING_NAME_BELT)
INPUT_TOPIC_CAMERA_INFERENCE = "{}/{}/inference".format(PREFIX, THING_NAME_CAMERA)
INPUT_TOPIC_CAMERA_SHADOW = "$aws/things/{}/shadow/update/accepted".format(THING_NAME_BELT)

OUTPUT_TOPIC_BELT_SHADOW = "{}/{}/shadow/update".format(PREFIX, THING_NAME_BELT)
OUTPUT_TOPIC_CAMERA_TRIGGER = "make/inference"

GGIOT = GGIoT(thing=THING_NAME_BELT, prefix=PREFIX)

print("")
print("Start of Lambda function")
print("THING_NAME_BELT: " + THING_NAME_BELT)
print("INPUT_TOPIC_BELT_PROXIMITY: " + INPUT_TOPIC_BELT_PROXIMITY)
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
    payload = {"state": {"desired": {"mode": 2, "speed": 1}}}
    # GGIOT.publish(topic=OUTPUT_TOPIC_BELT_SHADOW, payload=payload)
    GGIOT.updateThingShadow(payload=payload)

def turnBeltOn():
    payload = {"state": {"desired": {"mode": 3, "speed": 1}}}
    # GGIOT.publish(topic=OUTPUT_TOPIC_BELT_SHADOW, payload=payload)
    GGIOT.updateThingShadow(payload=payload)

def triggerPicture():
    GGIOT.publish(OUTPUT_TOPIC_CAMERA_TRIGGER, {})


def lambda_handler(event, context):
    topic = context.client_context.custom["subject"]
    print("lambda_handler: {}: {}".format(topic, json.dumps(event)))

    if topic == INPUT_TOPIC_BELT_PROXIMITY:
        if event["sensor1"] == 1 or event["sensor2"] == 1:

            if event["sensor2"] == 1 and event["mode"] != 2:
                print("lambda_handler: {}: Need to stop the belt.".format(topic))
                triggerPicture()
                turnBeltOff()

            if event["sensor1"] == 1 and event["mode"] == 2:
                print("lambda_handler: {}: Need to start the belt.".format(topic))
                turnBeltOn()

    if topic == INPUT_TOPIC_CAMERA_INFERENCE and "results" in event:

        print("lambda_handler: {}: Inference received {}.".format(topic, json.dumps(event)))

        inferenceDecision = GGIOT.getThingShadow(thingName=THING_NAME_CAMERA)

        category = inferenceDecision["state"]["desired"]["inferenceDecision"]["category"]
        threshold = inferenceDecision["state"]["desired"]["inferenceDecision"]["threshold"]

        print("lambda_handler: {}: inferenceDecision: {}, {}. Result at: {}".format(topic, category, threshold, event["results"][category]))

        if event["results"][category] > threshold:
            turnBeltOn()

    # if topic == INPUT_TOPIC_CAMERA_SHADOW and "state" in event and "desired" in event["state"] and "inferenceDecision" in event["state"]["desired"]:


    return
