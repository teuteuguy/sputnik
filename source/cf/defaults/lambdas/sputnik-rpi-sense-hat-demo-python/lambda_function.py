from ggiot import GGIoT
import json
import os
import socket
import sys
from threading import Event, Thread, Timer
import time
import datetime
import math

from sense_hat import SenseHat  # pylint: disable=import-error

#############################################
## INIT
#############################################
#Initialize sense hat
sense = SenseHat()
sense.set_imu_config(True, True, True)
sense.set_rotation(180)
sense.low_light = True
sense.clear(255, 255, 0)
print("Sense Hat and IMU initialized")

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter("AWS_IOT_THING_NAME", "UNKNOWN")
PREFIX = "sputnik"

#CONSTANT and variables declaration
#Change it with your configuration
JOYSTICK_IS_TRIGGER = True
SEND_TELEMETRY = True
FREQUENCY = 1.0

TOPIC_TELEMETRY = "{}/{}/telemetry".format(PREFIX, THING_NAME)
TOPIC_JOYSTICK = "{}/{}/joystick".format(PREFIX, THING_NAME)
TOPIC_SCREEN = "{}/{}/screen".format(PREFIX, THING_NAME)
TOPIC_SHADOW_UPDATE_ACCEPTED = "$aws/things/{}/shadow/update/accepted".format(THING_NAME)

#############################################
## SENSE HAT INPUTS
#############################################
#Callback for joystick event
def joystick_callback(event):
    global JOYSTICK_IS_TRIGGER
    if event.action == "pressed" and JOYSTICK_IS_TRIGGER:
        print("Joystick was pressed: %s" % (json.dumps(event)))
        GGIOT.publish(topic=TOPIC_JOYSTICK, payload=event)

#Assigning callback
sense.stick.direction_any = joystick_callback

# Get readings from the sense hat
def getSenseHatReadings():
    senseHatReadings = {}

    # Readings from sensors
    senseHatReadings['id'] = THING_NAME
    senseHatReadings['humidity'] = math.floor(sense.humidity)
    senseHatReadings['temperature'] = math.floor(sense.temp)
    senseHatReadings['temperatureFromPressure'] = math.floor(sense.get_temperature_from_pressure())
    senseHatReadings['pressure'] = math.floor(sense.pressure)
    senseHatReadings['orientation'] = sense.orientation
    senseHatReadings['gyroscope'] = sense.gyroscope
    senseHatReadings['accelerometer'] = sense.accelerometer
    senseHatReadings['compass'] = sense.compass
    senseHatReadings['gyroscopeRAW'] = sense.gyroscope_raw
    senseHatReadings['accelerometerRAW'] = sense.accelerometer_raw
    x = sense.get_accelerometer_raw()['x']
    y = sense.get_accelerometer_raw()['y']
    z = sense.get_accelerometer_raw()['z']
    senseHatReadings['magnitude'] = math.sqrt(x*x + y*y + z*z)
    senseHatReadings['compassRAW'] = sense.compass_raw
    senseHatReadings['epoch'] = int(time.time())
    senseHatReadings['timestamplocal'] = str(datetime.datetime.now().isoformat()).split('.')[0]
    senseHatReadings['timestamputc'] = str(datetime.datetime.utcnow().isoformat()).split('.')[0]

    return senseHatReadings

#############################################
## MAIN CODE
#############################################

def printShadowObject():
    print("JOYSTICK_IS_TRIGGER: {}".format(JOYSTICK_IS_TRIGGER))
    print("SEND_TELEMETRY:      {}".format(SEND_TELEMETRY))
    print("FREQUENCY:           {}".format(FREQUENCY))

def parseIncomingShadow(shadow):

    global JOYSTICK_IS_TRIGGER
    global SEND_TELEMETRY
    global FREQUENCY

    if "state" in shadow:
        state = shadow["state"]
        if "desired" in state:
            desired = state["desired"]

            if "joystickIsTrigger" in desired and "sendTelemetry" in desired and "frequency" in desired:
                JOYSTICK_IS_TRIGGER = desired['joystickIsTrigger']
                SEND_TELEMETRY = desired['sendTelemetry']
                FREQUENCY = desired['frequency']
                GGIOT.updateThingShadow(payload={"state": {"reported": {"joystickIsTrigger": JOYSTICK_IS_TRIGGER, "sendTelemetry": SEND_TELEMETRY, "frequency": FREQUENCY}}})

                printShadowObject()


def lambda_handler(event, context):
    try:
        topic = context.client_context.custom["subject"]
        payload = event
        print('Received message on topic %s: %s\n' % (topic, json.dumps(payload)))

        if topic == TOPIC_SHADOW_UPDATE_ACCEPTED:
            parseIncomingShadow(event)
        elif topic == TOPIC_SCREEN:
            if 'r' in payload and 'g' in payload and 'b' in payload:
                sense.clear(payload['r'], payload['g'], payload['b'])
            elif 'text' in payload:
                sense.show_message(payload['text'], scroll_speed=0.05)

    except Exception as e:
        print(e)

    return

GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

class MainAppThread(Thread):

    global FREQUENCY
    global SEND_TELEMETRY
    global JOYSTICK_IS_TRIGGER

    def __init__(self):
        super(MainAppThread, self).__init__()
        self.stop_request = Event()
        print("MainAppThread.init")

    def join(self):
        self.stop_request.set()

    def run(self):
        try:
            #Indicates it's connected and ready
            sense.clear(0, 255, 0)

            parseIncomingShadow(GGIOT.getThingShadow())

            while 42:
                senseHatReadings = getSenseHatReadings()
                printShadowObject()

                if (str(SEND_TELEMETRY) == 'True'):
                    GGIOT.publish(TOPIC_TELEMETRY, senseHatReadings)
                    print('Published to topic %s: %s\n' % (TOPIC_TELEMETRY, json.dumps(senseHatReadings)))

                time.sleep(float(FREQUENCY))

        except Exception as err:
            print(err)
            time.sleep(5)



mainAppThread = MainAppThread()
mainAppThread.start()
