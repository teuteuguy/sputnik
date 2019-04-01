from ggiot import GGIoT
import json
import os
import sense_hat  # pylint: disable=import-error
import socket
import sys
from threading import Event, Thread, Timer
import time

sense = sense_hat.SenseHat()


def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter("AWS_IOT_THING_NAME", "UNKNOWN")

PREFIX = "sputnik"
TOPIC_SENSORS = "{}/{}/sensors".format(PREFIX, THING_NAME)

SHADOW_OBJECT_NAME = "sense-hat"
SHADOW_OBJECT = {
    "color": {
        "on": [255, 255, 255],
        "off": [0, 0, 0]
    },
    "led": [
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0
    ],
    "mode": "led",
    "text": "None",
    "config": {
        "rotation": 0,
        "low_light": False,
        "freq": "1.0"
    }
}


class MainAppThread(Thread):

    global SHADOW_OBJECT

    def __init__(self):
        super(MainAppThread, self).__init__()
        self.stop_request = Event()
        print("MainAppThread.init")

    def join(self):
        self.stop_request.set()

    def run(self):
        try:
            sense.clear()

            parseIncomingShadow(GGIOT.getThingShadow())

            while 42:
                temperature1 = sense.get_temperature_from_humidity()
                temperature2 = sense.get_temperature_from_pressure()
                humidity = sense.get_humidity()
                pressure = sense.get_pressure()
                orientation = sense.get_orientation()
                north = sense.get_compass()
                gyro = sense.get_gyroscope()
                accel = sense.get_accelerometer()
                print("Temperature1: {}".format(temperature1))
                print("Temperature2: {}".format(temperature2))
                print("Humidity:     {}".format(humidity))
                print("Pressure:     {}".format(pressure))
                print("North:        {}".format(north))
                print("Orientation:  p: {pitch}, r: {roll}, y: {yaw}".format(**orientation))
                print("Gyro:         p: {pitch}, r: {roll}, y: {yaw}".format(**gyro))
                print("Accel:        p: {pitch}, r: {roll}, y: {yaw}".format(**accel))

                GGIOT.publish(TOPIC_SENSORS, {
                    "temperature": {
                        "1": temperature1,
                        "2": temperature2,
                    },
                    "humidity": humidity,
                    "pressure": pressure,
                    "north": north,
                    "orientation": orientation,
                    "gyro": gyro,
                    "accel": accel
                })

                time.sleep(float(SHADOW_OBJECT["config"]["freq"]))

        except Exception as err:
            print(err)
            time.sleep(5)


def printShadowObject():
    print(json.dumps(SHADOW_OBJECT))

def parseIncomingShadow(shadow):

    global SHADOW_OBJECT

    if "state" in shadow:
        state = shadow["state"]

        if "desired" in state:
            desired = state["desired"]

            if SHADOW_OBJECT_NAME in desired:

                obj = desired[SHADOW_OBJECT_NAME]

                if "color" in obj:
                    if "on" in obj["color"] and SHADOW_OBJECT["color"]["on"] != obj["color"]["on"]:
                        SHADOW_OBJECT["color"]["on"] = obj["color"]["on"]
                    if "off" in obj["color"] and SHADOW_OBJECT["color"]["off"] != obj["color"]["off"]:
                        SHADOW_OBJECT["color"]["off"] = obj["color"]["off"]
                if "led" in obj and SHADOW_OBJECT["led"] != obj["led"]:
                    SHADOW_OBJECT["led"] = obj["led"]
                if "mode" in obj and SHADOW_OBJECT["mode"] != obj["mode"]:
                    SHADOW_OBJECT["mode"] = obj["mode"]
                if "text" in obj and SHADOW_OBJECT["text"] != obj["text"]:
                    SHADOW_OBJECT["text"] = obj["text"]
                if "config" in obj:
                    if "rotation" in obj["config"] and SHADOW_OBJECT["config"]["rotation"] != obj["config"]["rotation"]:
                        SHADOW_OBJECT["config"]["rotation"] = obj["config"]["rotation"]
                    if "low_light" in obj["config"] and SHADOW_OBJECT["config"]["low_light"] != obj["config"]["low_light"]:
                        SHADOW_OBJECT["config"]["low_light"] = obj["config"]["low_light"]
                    if "freq" in obj["config"] and SHADOW_OBJECT["config"]["freq"] != obj["config"]["freq"]:
                        SHADOW_OBJECT["config"]["freq"] = obj["config"]["freq"]

                print("parseIncomingShadow: updating to {}".format(SHADOW_OBJECT))

                sense.clear()
                sense.set_rotation(SHADOW_OBJECT["config"]["rotation"])
                sense.low_light = SHADOW_OBJECT["config"]["low_light"]

                if SHADOW_OBJECT["mode"] == "led":
                    def change(x):
                        if x == 1:
                            return SHADOW_OBJECT["color"]["on"]
                        else:
                            return SHADOW_OBJECT["color"]["off"]

                    temp = list(map(lambda x: change(x), SHADOW_OBJECT["led"]))

                    sense.set_pixels(temp)

                elif SHADOW_OBJECT["mode"] == "text":
                    sense.show_message(SHADOW_OBJECT["text"])

                GGIOT.updateThingShadow(payload={"state": {"reported": {SHADOW_OBJECT_NAME: SHADOW_OBJECT}}})

                printShadowObject()

GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

mainAppThread = MainAppThread()
mainAppThread.start()

def lambda_handler(event, context):
    parseIncomingShadow(event)
    return
