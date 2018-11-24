import json

TELEMETRY_STRING = " [TelemetryTask] [BELT_TELEMETRY] "
SHADOW_WATCHDOGTASK_STRING = " [WatchdogTask] [BELT_SHADOW] "
SHADOW_BELTSTATESERIAL_STRING = " [BeltStateSerial] [BELT_SHADOW] "
SHADOW_SERIALINPUTTASK_STRING = " [SerialInputTask] [BELT_SHADOW] "

class Belt:

    def __init__(self):
        self.SHADOW_DESIRED = {
            "mode": 2,
            "speed": 1,
            "chassis": False,
            "rpm": False,
            "proximity": False
        }
        self.SHADOW_REPORTED = {
            "mode": 2,
            "speed": 1,
            "chassis": False,
            "rpm": False,
            "proximity": False
        }
        self.SENSORS = {
            "speed": {
                "rpm": 0
            },
            "chassis": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "proximity": {
                "sensor1": 0,
                "sensor2": 0
            }
        }

    def getCharFor(self, speed, mode):
        char = "5"
        if speed == 1:
            if mode == 1:
                char = "4"
            elif mode == 2:
                char = "5"
            elif mode == 3:
                char = "6"
        elif speed == 2:
            if mode == 1:
                char = "3"
            elif mode == 2:
                char = "5"
            elif mode == 3:
                char = "7"

        return char

    def parseSerial(self, data, serialWrite, GGIOT, TOPIC_FOR_SENSORS):

        def writeDesiredToSerial():
            char = self.getCharFor(
                speed=self.SHADOW_DESIRED["speed"],
                mode=self.SHADOW_DESIRED["mode"]
            )
            print("Belt.parseSerial: Writing to serial: {}".format(char))
            serialWrite(char)

        beltData = None

        if TELEMETRY_STRING + "{" in data:
            beltData = json.loads(data.split(TELEMETRY_STRING)[1])
        elif SHADOW_WATCHDOGTASK_STRING + "{" in data:
            beltData = json.loads(data.split(SHADOW_WATCHDOGTASK_STRING)[1])
        elif SHADOW_BELTSTATESERIAL_STRING + "{" in data:
            beltData = json.loads(data.split(SHADOW_BELTSTATESERIAL_STRING)[1])
        elif SHADOW_SERIALINPUTTASK_STRING + "{" in data:
            beltData = json.loads(data.split(SHADOW_SERIALINPUTTASK_STRING)[1])

        if beltData != None and "state" in beltData and "reported" in beltData["state"]:
            reported = beltData["state"]["reported"]
            print("Belt.parseSerial: reported: {}".format(json.dumps(reported)))
            needToUpdateShadow = False

            if "speed" in reported:
                if reported["speed"] != 1 and reported["speed"] != 2:
                    writeDesiredToSerial()
                elif self.SHADOW_REPORTED["speed"] != reported["speed"]:
                    needToUpdateShadow = True
                    self.SHADOW_REPORTED["speed"] = reported["speed"]

            if "mode" in reported:
                if reported["mode"] != 1 and reported["mode"] != 2 and reported["mode"] != 3:
                    writeDesiredToSerial()
                elif self.SHADOW_REPORTED["mode"] != reported["mode"]:
                    needToUpdateShadow = True
                    self.SHADOW_REPORTED["mode"] = reported["mode"]

            if needToUpdateShadow == True:
                print("Belt.parseSerial: shadow.reported: {}".format(self.SHADOW_REPORTED))
                GGIOT.updateThingShadow(payload={"state": {"reported": self.SHADOW_REPORTED}})

            if self.SHADOW_REPORTED["mode"] != self.SHADOW_DESIRED["mode"] or self.SHADOW_REPORTED["speed"] != self.SHADOW_DESIRED["speed"]:
                writeDesiredToSerial()

        if beltData != None and "chassis" in beltData and self.SHADOW_DESIRED["chassis"] == True:
            GGIOT.publish(topic="{}/chassis".format(TOPIC_FOR_SENSORS), payload=beltData["chassis"])
            # print("Belt.parseSerial: chassis: {}".format(beltData["chassis"]))
        if beltData != None and "speed" in beltData and self.SHADOW_DESIRED["rpm"] == True and self.SENSORS["speed"]["rpm"] != beltData["speed"]["rpm"]:
            self.SENSORS["speed"]["rpm"] = beltData["speed"]["rpm"]
            GGIOT.publish(topic="{}/speed".format(TOPIC_FOR_SENSORS), payload=beltData["speed"])
            # print("Belt.parseSerial: rpm: {}".format(beltData["speed"]))
        if beltData != None and "proximity" in beltData and self.SHADOW_DESIRED["proximity"] == True and (self.SENSORS["proximity"]["sensor1"] != beltData["proximity"]["sensor1"] or self.SENSORS["proximity"]["sensor2"] != beltData["proximity"]["sensor2"]):
            self.SENSORS["proximity"]["sensor1"] = beltData["proximity"]["sensor1"]
            self.SENSORS["proximity"]["sensor2"] = beltData["proximity"]["sensor2"]
            GGIOT.publish(topic="{}/proximity".format(TOPIC_FOR_SENSORS), payload={
                "sensor1": self.SENSORS["proximity"]["sensor1"],
                "sensor2": self.SENSORS["proximity"]["sensor2"],
                "mode": self.SHADOW_REPORTED["mode"],
                "speed": self.SHADOW_REPORTED["speed"]
            })
            # print("Belt.parseSerial: proximity: {}".format(beltData["proximity"]))

    def parseIncomingShadow(self, data, GGIOT):

        if data and "state" in data and "desired" in data["state"]:
            desired = data["state"]["desired"]

            print("Belt.parseIncomingShadow: desired: {}".format(json.dumps(desired)))

            if "mode" in desired and desired["mode"] != self.SHADOW_DESIRED["mode"]:
                self.SHADOW_DESIRED["mode"] = int(desired["mode"])

            if "speed" in desired and desired["speed"] != self.SHADOW_DESIRED["speed"]:
                self.SHADOW_DESIRED["speed"] = int(desired["speed"])

            if "chassis" in desired and desired["chassis"] != self.SHADOW_DESIRED["chassis"]:
                self.SHADOW_DESIRED["chassis"] = int(desired["chassis"])
                self.SHADOW_REPORTED["chassis"] = int(desired["chassis"])

            if "rpm" in desired and desired["rpm"] != self.SHADOW_DESIRED["rpm"]:
                self.SHADOW_DESIRED["rpm"] = int(desired["rpm"])
                self.SHADOW_REPORTED["rpm"] = int(desired["rpm"])

            if "proximity" in desired and desired["proximity"] != self.SHADOW_DESIRED["proximity"]:
                self.SHADOW_DESIRED["proximity"] = int(desired["proximity"])
                self.SHADOW_REPORTED["proximity"] = int(desired["proximity"])
