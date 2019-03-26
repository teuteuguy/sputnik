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

SENSOR_DATA_TOPIC = '{0}/{1}/sensordata'.format(PREFIX, THING_NAME)

print('Murata Lambda function starting')
print('THING_NAME:                   {}'.format(THING_NAME))
print('SERIAL_PORT:                  {}'.format(SERIAL_PORT))
print('SHADOW_UPDATE_ACCEPTED_TOPIC: {}'.format(SHADOW_UPDATE_ACCEPTED_TOPIC))
print('SHADOW_UPDATE_DELTA_TOPIC:    {}'.format(SHADOW_UPDATE_DELTA_TOPIC))
print('SENSOR_DATA_TOPIC:            {}'.format(SENSOR_DATA_TOPIC))

GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

def reportTo(mode):
    GGIOT.updateThingShadow(payload={
        "state": {
            "reported": {
                "mode": mode
            }
        }
    })

def reportAndDesireTo(mode):
    GGIOT.updateThingShadow(payload={
        "state": {
            "desired": {
                "mode": mode
            },
            "reported": {
                "mode": mode
            }
        }
    })

MURATA = Murata()

class MainThread(Thread):
    def __init__(self):
        super(MainThread, self).__init__()
        self.stop_request = Event()

        self.mode = "init"
        reportTo(self.mode)

        MURATA.initialize()

        self.mode = "idle"
        reportTo(self.mode)


    def run(self):
        while 42:
            try:
                if MURATA.ser.inWaiting() > 0:
                    data = MURATA.readline()
                    if len(data) > 100:
                        ts, freqs, accs, rmsval, kurtosis, stemp, rssival, nodeid = MURATA.convertPacket(data)
                        message = {
                            "timestamp": ts,
                            "frequencies": freqs,
                            "accels": accs,
                            "rms": rmsval,
                            "kurtosis": kurtosis,
                            "surfaceTemperature": stemp,
                            "rssi": rssival,
                            "nodeId": nodeid
                        }
                        GGIOT.publish(topic=SENSOR_DATA_TOPIC, payload=message)

                if self.mode == "scan":
                    print("Scan mode: Enter:")

                    reportTo(self.mode)

                    result = MURATA.scan()

                    if result == 1:
                        print("Config mode: Enter")
                        result = MURATA.config()
                        if result == 1:
                            pass
                        #     f.seek(0);
                        #     f.write("0");
                        #     f.truncate();

                    MURATA.resume()
                    self.mode = "idle"
                    reportAndDesireTo(self.mode)

                if self.mode == "init":
                    print("Init: Enter")
                    reportTo(self.mode)

                    MURATA.initialize()
                    self.mode = "idle"
                    reportAndDesireTo(self.mode)

            except Exception as ex:
                print("ERROR: {}".format(str(ex)))
                time.sleep(1)

    def join(self):
        self.stop_request.set()

    def setMode(self, mode):
        print("Setting mode to: {}".format(mode))
        self.mode = mode

mainThread = MainThread()
mainThread.start()

def lambda_handler(event, context):
    topic = context.client_context.custom["subject"]
    print("lambda_handler: {}: {}".format(topic, json.dumps(event)))

    if event and "state" in event:
        state = event["state"]

        if topic == SHADOW_UPDATE_ACCEPTED_TOPIC:
            if "desired" in state and "mode" in state["desired"]:
                mainThread.setMode(state["desired"]["mode"])
        elif topic == SHADOW_UPDATE_DELTA_TOPIC:
            if "mode" in state:
                mainThread.setMode(state["mode"])

    return


