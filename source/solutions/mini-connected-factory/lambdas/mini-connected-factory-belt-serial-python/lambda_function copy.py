import json
import os
import platform
# import signal
from threading import Thread, Timer, Event
import threading
import time

from ggiot import GGIoT

from belt import Belt

import serial
import serial.threaded

if platform.system() != 'Darwin':
    # SYNC_SHADOW_FREQ = 0.1
    SYNC_SHADOW_FREQ = 2
    THING_NAME = '{}'.format(os.environ['THING_NAME'])
    SERIALPORT_PORT = '{}'.format(os.environ['SERIALPORT_PORT'])
    SERIALPORT_SPEED = '{}'.format(os.environ['SERIALPORT_SPEED'])
else:
    SYNC_SHADOW_FREQ = 2
    THING_NAME = 'HomeBelt'
    # SERIALPORT_PORT = '/dev/cu.SLAB_USBtoUART'
    SERIALPORT_PORT = '/dev/cu.Bluetooth-Incoming-Port'
    SERIALPORT_SPEED = 115200

try:
    PREFIX = 'mtm'
    TOPIC_FOR_SENSORS = 'mtm/{}/sensors'.format(THING_NAME)

    GGIOT = GGIoT(thing=THING_NAME, prefix='mtm')
    GGIOT.info("Lambda restart")

    BELT = Belt()

except Exception as err:
    GGIOT.exception(str(err))
    time.sleep(1)


SHADOW_DESIRED = {
    "beltMode": 2,
    "beltSpeed": 1
}


def parseIncomingShadow(shadow):

    if 'state' in shadow:

        state  = shadow['state']

        if 'desired' in state:

            if 'beltMode' in state['desired'] and SHADOW_DESIRED['beltMode'] != state['desired']['beltMode']:
                SHADOW_DESIRED['beltMode'] = state['desired']['beltMode']
                print("parseIncomingShadow: updating beltMode to {}".format(SHADOW_DESIRED['beltMode']))

            if 'beltSpeed' in state['desired'] and SHADOW_DESIRED['beltSpeed'] != state['desired']['beltSpeed']:
                SHADOW_DESIRED['beltSpeed'] = state['desired']['beltSpeed']
                print("parseIncomingShadow: updating beltSpeed to {}".format(SHADOW_DESIRED['beltSpeed']))

            GGIOT.info("New Shadow received")


class BeltSerialRXThread(Thread):

    global SERIAL
    global SHADOW_DESIRED

    def __init__(self):
        super(BeltSerialRXThread, self).__init__()
        self.stop_request = Event()
        self.BELT_SENSORS = {
            "chassis": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "speed": {
                "rpm": 0
            }
        }
        self.SHADOW_REPORTED_BELT_CONTROL = {
            "beltMode": 2,
            "beltSpeed": 1
        }
        print("BeltSerialRXThread.init")

    def join(self):
        self.stop_request.set()

    def run(self):

        while 42:

            try:
                if SERIAL.is_open == False:
                    print("BeltSerialRXThread.run: Serial port closed for some reason. re-opening")
                    time.sleep(2)
                    SERIAL.open()
                else:

                    print("BeltSerialRXThread.run: readline()")
                    data = SERIAL.readline().strip()

                    print("BeltSerialRXThread.run: " + data)

                    beltHasReportedState = False

                    if " [BELT_SHADOW] {" in data:
                        data = json.loads(data.split(" [BELT_SHADOW] ")[1])
                        beltHasReportedState = True

                    elif " [BELT_TELEMETRY] {" in data:
                        data = json.loads(data.split(" [BELT_TELEMETRY] ")[1])
                        beltHasReportedState = True

                    if beltHasReportedState:

                        if 'state' in data:

                            if 'reported' in data['state']:

                                needToUpdateShadow = False

                                if 'speed' in data['state']['reported']:
                                    if data['state']['reported']['speed'] != 1 and \
                                    data['state']['reported']['speed'] != 2:
                                        print("BeltSerialRXThread.run: Incorrect speed reported")
                                        SERIAL.write(BELT.getCharFor(SHADOW_DESIRED['beltSpeed'], SHADOW_DESIRED['beltMode']))
                                        # self.write_line(BELT.getCharFor(
                                        #     SHADOW_DESIRED['beltSpeed'], SHADOW_DESIRED['beltMode']))
                                    else:
                                        if self.SHADOW_REPORTED_BELT_CONTROL['beltSpeed'] != data['state']['reported']['speed']:
                                            needToUpdateShadow = True
                                            self.SHADOW_REPORTED_BELT_CONTROL['beltSpeed'] = data['state']['reported']['speed']

                                if 'mode' in data['state']['reported']:
                                    if data['state']['reported']['mode'] != 1 and data['state']['reported']['mode'] != 2 and data['state']['reported']['mode'] != 3:
                                        print("BeltSerialRXThread.run: Incorrect mode reported")
                                        SERIAL.write(BELT.getCharFor(SHADOW_DESIRED['speed'], SHADOW_DESIRED['beltMode']))
                                        # self.write_line(BELT.getCharFor(SHADOW_DESIRED['speed'], SHADOW_DESIRED['beltMode']))
                                    else:
                                        if self.SHADOW_REPORTED_BELT_CONTROL['beltMode'] != data['state']['reported']['mode']:
                                            needToUpdateShadow = True
                                            self.SHADOW_REPORTED_BELT_CONTROL['beltMode'] = data['state']['reported']['mode']

                                if needToUpdateShadow:
                                    GGIOT.updateThingShadow(payload={'state': {'reported': self.SHADOW_REPORTED_BELT_CONTROL}})

                        if 'chassis' in data:

                            if 'x' in data['chassis'] and 'y' in data['chassis'] and 'z' in data['chassis']:

                                if data['chassis']['x'] != self.BELT_SENSORS['chassis']['x'] or \
                                data['chassis']['y'] != self.BELT_SENSORS['chassis']['y'] or \
                                data['chassis']['z'] != self.BELT_SENSORS['chassis']['z']:

                                    self.BELT_SENSORS['chassis'].update(data['chassis'])

                                    GGIOT.publish(TOPIC_FOR_SENSORS, self.BELT_SENSORS)

                        print("Current Desired is: {}".format(json.dumps(SHADOW_DESIRED)))
                        print("Current Reported is: {}".format(json.dumps(self.SHADOW_REPORTED_BELT_CONTROL)))
                        if self.SHADOW_REPORTED_BELT_CONTROL['beltMode'] != SHADOW_DESIRED['beltMode'] or \
                                self.SHADOW_REPORTED_BELT_CONTROL['beltSpeed'] != SHADOW_DESIRED['beltSpeed']:
                            SERIAL.write(BELT.getCharFor(SHADOW_DESIRED['beltSpeed'], SHADOW_DESIRED['beltMode']))

            except Exception as ex:
                print("BeltSerialRXThread.run: ERROR: {}".format(ex))
                GGIOT.exception(str(ex))

# SERIAL = serial.serial_for_url(SERIALPORT_PORT, int(SERIALPORT_SPEED))
SERIAL = serial.Serial()
SERIAL.baudrate = int(SERIALPORT_SPEED)
SERIAL.port = SERIALPORT_PORT
SERIAL.timeout = 0
SERIAL.open()
SERIAL.write('0')

beltSerialRXThread = BeltSerialRXThread()
beltSerialRXThread.start()

def lambda_handler(event, context):
    GGIOT.info({ "location": "lambda_handler", "event": event })
    parseIncomingShadow(event)
    return

