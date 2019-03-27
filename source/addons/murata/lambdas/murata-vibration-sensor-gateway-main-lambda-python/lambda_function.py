from ggiot import GGIoT
import json
import os
import sys
import time
from threading import Thread, Timer, Event

from murata import Murata

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter("AWS_IOT_THING_NAME", "UNKNOWN")
SERIAL_PORT = get_parameter("SERIAL_PORT", "UNKNOWN")
PREFIX = "murata"

SHADOW_UPDATE_ACCEPTED_TOPIC = '$aws/things/{0}/shadow/update/accepted'.format(THING_NAME)
SHADOW_UPDATE_DELTA_TOPIC = '$aws/things/{0}/shadow/update/delta'.format(THING_NAME)

MURATA_SENSOR_NODE_DEVICE_TYPE_ID = "murata-sensor-node-v1.0"
MURATA_SENSOR_NODE_DEVICE_BLUEPRINT_ID = "murata-vibration-sensor-node-v1.0"


def SENSOR_NODE_DATA_TOPIC(nodeId="UNKNOWN"):
    return '{0}/{1}/{2}/data'.format(PREFIX, THING_NAME, nodeId)

def SENSOR_NODE_PRESENCE_TOPIC(nodeId="UNKNOWN"):
    return '{0}/{1}/presence/{2}'.format(PREFIX, THING_NAME, nodeId)

print('Murata Lambda function starting')
print('THING_NAME:                   {}'.format(THING_NAME))
print('SERIAL_PORT:                  {}'.format(SERIAL_PORT))
print('SHADOW_UPDATE_ACCEPTED_TOPIC: {}'.format(SHADOW_UPDATE_ACCEPTED_TOPIC))
print('SHADOW_UPDATE_DELTA_TOPIC:    {}'.format(SHADOW_UPDATE_DELTA_TOPIC))
print('SENSOR_NODE_DATA_TOPIC:       {}'.format(SENSOR_NODE_DATA_TOPIC()))

GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

def updateThingShadow(state):
    GGIOT.updateThingShadow(payload={
        "state": state
    })


def publishNodePresence(nodeId):
    GGIOT.publish(topic=SENSOR_NODE_PRESENCE_TOPIC(nodeId), payload={
        "cmd": "addDevice",
        "thingName":  "MURATA_{}".format(nodeId),
        "generateCert": False,
        "spec": {},
        "deviceTypeId": MURATA_SENSOR_NODE_DEVICE_TYPE_ID,
        "deviceBlueprintId": MURATA_SENSOR_NODE_DEVICE_BLUEPRINT_ID
    })


MURATA = Murata()

class MainThread(Thread):
    def __init__(self):
        super(MainThread, self).__init__()
        self.stop_request = Event()

        MURATA.initialize()
        self.mode = "idle"
        self.config = "000109FF09090909000102670001000000000000000001"

        updateThingShadow({
            "reported": {
                "mode": self.mode,
                "config": self.config
            }
        })

        self.nodes = []

    def run(self):
        while 42:
            try:
                if MURATA.ser.inWaiting() > 0:
                    data = MURATA.readline()

                    if len(data) > 100 and data[0:7] == "ERXDATA":

                        nodeId, messageId, rssiVal, timestamp, freqs, accs, rmsVal, kurtosis, sTemp = MURATA.convertPacket(data)
                        # ts, freqs, accs, rmsval, kurtosis, stemp, rssival, nodeId = MURATA.convertPacket(data)
                        message = {
                            "messageId": messageId,
                            "timestamp": timestamp,
                            "frequencies": freqs,
                            "accels": accs,
                            "rms": rmsVal,
                            "kurtosis": kurtosis,
                            "surfaceTemperature": sTemp,
                            "rssi": rssiVal,
                            "nodeId": nodeId
                        }

                        GGIOT.publish(topic=SENSOR_NODE_DATA_TOPIC(nodeId=nodeId), payload=message)

                        if nodeId not in self.nodes:
                            publishNodePresence(nodeId)
                            self.nodes.append(nodeId)

                if self.mode == "scan":
                    print("Scan mode: Enter:")

                    result, nodeId, networkId = MURATA.scan()

                    if result == True:
                        print("Scan mode: found {0} for {1}".format(nodeId, networkId))
                        print("Configure: {0} with {1}".format(nodeId, self.config))

                        if MURATA.config(nodeId, self.config) == True:
                            if nodeId not in self.nodes:
                                publishNodePresence(nodeId)
                                self.nodes.append(nodeId)

                    MURATA.resume()
                    self.mode = "idle"
                    updateThingShadow({
                        "reported": {
                            "mode": self.mode
                        },
                        "desired": {
                            "mode": self.mode
                        }
                    })

                if self.mode == "init":
                    print("Init: Enter")

                    MURATA.initialize()
                    self.mode = "idle"
                    updateThingShadow({
                        "reported": {
                            "mode": self.mode
                        },
                        "desired": {
                            "mode": self.mode
                        }
                    })

            except Exception as ex:
                print("ERROR: {}".format(str(ex)))
                time.sleep(1)

    def join(self):
        self.stop_request.set()

    def setMode(self, mode):
        print("Setting mode to: {0}".format(mode))
        self.mode = mode
        updateThingShadow({
            "reported": {
                "mode": self.mode
            }
        })

    def setConfig(self, config):
        print("Setting config to: {0}".format(config))
        self.config = config
        updateThingShadow({
            "reported": {
                "config": self.config
            }
        })

mainThread = MainThread()
mainThread.start()

def lambda_handler(event, context):
    topic = context.client_context.custom["subject"]
    print("lambda_handler: {}: {}".format(topic, json.dumps(event)))

    state = event.get("state")
    mode = None
    config = None

    if state != None:

        if topic == SHADOW_UPDATE_ACCEPTED_TOPIC:
            desired = state.get("desired")
            if desired != None:
                mode = desired.get("mode")
                config = desired.get("config")
        elif topic == SHADOW_UPDATE_DELTA_TOPIC:
            mode = state.get("mode")
            config = state.get("config")

        if mode != None:
            mainThread.setMode(mode)
        if config != None:
            mainThread.setConfig(config)

    return


