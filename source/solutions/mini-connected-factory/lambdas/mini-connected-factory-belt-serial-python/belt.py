import json

TELEMETRY_STRING = " [BELT_TELEMETRY] "
SHADOW_STRING = " [BELT_SHADOW] "
PROXIMITY_STRING = " [BELT_PROXIMITY] "

class Belt:

    def __init__(self):
        self.SHADOW_DESIRED = {
            "mode": 2,
            "speed": 1
        }
        self.SHADOW_REPORTED = {
            "mode": 2,
            "speed": 1
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

    def writeDesiredToSerial(self, serialWrite):
        char = self.getCharFor(speed=self.SHADOW_DESIRED["speed"], mode=self.SHADOW_DESIRED["mode"])
        print("Belt.parseSerial: Writing to serial: {}".format(char))
        serialWrite(char)

    def parseSerial(self, data, serialWrite, GGIOT, TOPIC_FOR_SENSORS):

        beltData = None
        needToUpdateShadow = False
        needToWriteToBelt = False

        if PROXIMITY_STRING + "{" in data:
            beltData = json.loads(data.split(PROXIMITY_STRING)[1])

            if "mode" in beltData and self.SHADOW_REPORTED["mode"] != beltData["mode"]:
                self.SHADOW_REPORTED["mode"] = beltData["mode"]
                needToUpdateShadow = True

            if "speed" in beltData and self.SHADOW_REPORTED["speed"] != beltData["speed"]:
                self.SHADOW_REPORTED["speed"] = beltData["speed"]
                needToUpdateShadow = True

            if self.SENSORS["proximity"]["sensor1"] != beltData["sensor1"] or self.SENSORS["proximity"]["sensor2"] != beltData["sensor2"]:
                self.SENSORS["proximity"]["sensor1"] = beltData["sensor1"]
                self.SENSORS["proximity"]["sensor2"] = beltData["sensor2"]

                GGIOT.publish(topic="{}/proximity".format(TOPIC_FOR_SENSORS), payload={
                    "sensor1": self.SENSORS["proximity"]["sensor1"],
                    "sensor2": self.SENSORS["proximity"]["sensor2"],
                    "mode": self.SHADOW_REPORTED["mode"],
                    "speed": self.SHADOW_REPORTED["speed"]
                })

        elif TELEMETRY_STRING + "{" in data:
            beltData = json.loads(data.split(TELEMETRY_STRING)[1])

            if "chassis" in beltData and (self.SENSORS["chassis"]["x"] != beltData["chassis"]["x"] or self.SENSORS["chassis"]["y"] != beltData["chassis"]["y"] or self.SENSORS["chassis"]["z"] != beltData["chassis"]["z"]):
                self.SENSORS["chassis"] = beltData["chassis"]
                GGIOT.publish(topic="{}/chassis".format(TOPIC_FOR_SENSORS), payload=beltData["chassis"])

            if "speed" in beltData and self.SENSORS["speed"]["rpm"] != beltData["speed"]["rpm"]:
                self.SENSORS["speed"]["rpm"] = beltData["speed"]["rpm"]
                GGIOT.publish(topic="{}/speed".format(TOPIC_FOR_SENSORS), payload=beltData["speed"])

        elif SHADOW_STRING + "{" in data:
            beltData = json.loads(data.split(SHADOW_STRING)[1])

            if "state" in beltData and "reported" in beltData["state"]:
                reported = beltData["state"]["reported"]
                # print("Belt.parseSerial: reported: {}".format(json.dumps(reported)))

                if "speed" in reported:
                    if reported["speed"] != 1 and reported["speed"] != 2:
                        needToWriteToBelt = True
                    elif self.SHADOW_REPORTED["speed"] != reported["speed"]:
                        self.SHADOW_REPORTED["speed"] = reported["speed"]
                        needToUpdateShadow = True

                if "mode" in reported:
                    if reported["mode"] != 1 and reported["mode"] != 2 and reported["mode"] != 3:
                        needToWriteToBelt = True
                    elif self.SHADOW_REPORTED["mode"] != reported["mode"]:
                        self.SHADOW_REPORTED["mode"] = reported["mode"]
                        needToUpdateShadow = True

                if needToWriteToBelt or self.SHADOW_REPORTED["mode"] != self.SHADOW_DESIRED["mode"] or self.SHADOW_REPORTED["speed"] != self.SHADOW_DESIRED["speed"]:
                    self.writeDesiredToSerial(serialWrite)

        if needToUpdateShadow == True:
            GGIOT.updateThingShadow(payload={"state": {"reported": self.SHADOW_REPORTED}})


    def parseIncomingShadow(self, data):

        needToWriteToBelt = False

        if data and "state" in data and "desired" in data["state"]:

            desired = data["state"]["desired"]

            print("Belt.parseIncomingShadow: desired: {}".format(json.dumps(desired)))

            if "mode" in desired:
                self.SHADOW_DESIRED["mode"] = int(desired["mode"])
                needToWriteToBelt = True

            if "speed" in desired:
                self.SHADOW_DESIRED["speed"] = int(desired["speed"])
                needToWriteToBelt = True

        return needToWriteToBelt
