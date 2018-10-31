import os
import sys
import time
import greengrasssdk
import json
from threading import Thread, Event

# Creating a greengrass core sdk client
client = greengrasssdk.client('iot-data')

THINGNAME = '{}'.format(os.environ['DEVICE_IOT_THING_NAME'])
SERIALPORT_PORT = '{}'.format(os.environ['SERIALPORT_PORT'])
SERIALPORT_SPEED = '{}'.format(os.environ['SERIALPORT_SPEED'])

import serial

ser = serial.Serial()
ser.baudrate = int(SERIALPORT_SPEED)
ser.port = SERIALPORT_PORT
ser.timeout = 0.1
ser.open()

desiredBelt = {
    "mode": 1,
    "speed": 1
}

reportedBelt = {
    "mode": 2,
    "speed": 1,
    "error": "",
    "sensors": {
        "chassis": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "speed": {
            "rpm": 0
        }
    }
}


class SerialRXThread(Thread):

    global reportedBelt
    global ser

    def __init__(self):
        super(SerialRXThread, self).__init__()
        self.stop_request = Event()

    def run(self):
        while True:
            # print 'Thread loop'
            # Belt sends periodically the following messages:
            # {"chassis":{"x":1776,"y":1402,"z":1873}}
            # {"speed":{"rpm":0}}
            # {"state":{"reported":{"mode":2,"speed":1","error":0}}}
            # and logs. But lets not worry about those for now.
            try:
                line = ser.readline().strip()
                # kdp line = ser.read(300).strip()
                print 'Serial read: ' + line

                data = json.loads(line)
                if 'state' in data:
                    if 'reported' in data['state']:
                        if (reportedBelt['speed'] != data['state']['reported']['speed']) or (reportedBelt['mode'] != data['state']['reported']['mode']):
                            reportedBelt['speed'] = data['state']['reported']['speed']
                            reportedBelt['mode'] = data['state']['reported']['mode']
                            print '======== Updated speed & mode - REPORTED ========';
                            # reportShadow()
                if 'chassis' in data:
                    if cmp(reportedBelt['sensors']['chassis'], data['chassis']) != 0:
                        reportedBelt['sensors']['chassis'].update(data['chassis'])
                        # reportShadow()
                if 'speed' in data:
                    if cmp(reportedBelt['sensors']['speed'], data['speed']) != 0:
                        reportedBelt['sensors']['speed'].update(data['speed'])
                        # reportShadow()

            except Exception as ex:
                # ser.close(); -- not required for belt v1
                # print 'ERROR in thread: {}'.format(ex)
                # ser.open(); -- not required for belt v1

    def join(self):
        self.stop_request.set()



def reportShadow():
    # print 'Report shadow'
    client.update_thing_shadow(
        thingName=THINGNAME,
        payload=json.dumps({
            'state': {
                'reported': {
                    'belt': reportedBelt
                }
            }
        })
    )


def syncShadow():
    response = client.get_thing_shadow(thingName=THINGNAME)
    payloadDict = json.loads(response['payload'])
    stateDict = payloadDict['state']

    # We are only interested in the Desired.
    if 'desired' in stateDict:
        if 'belt' in stateDict['desired']:
            print 'Syncshadow rx: ' + json.dumps(stateDict['desired']['belt'])
            print 'Syncshadow vs: ' + json.dumps(desiredBelt)
            if cmp(desiredBelt, stateDict['desired']['belt']) != 0:
                desiredBelt.update(stateDict['desired']['belt'])
                try:
                    ser.write(json.dumps({"desired": desiredBelt}) + '\n')
                    print '======== Updated speed & mode - DESIRED ========';
                except Exception as ex:
                    print 'ERROR in syncShadow: {}'.format(ex)


def greengrassInfiniteLoop():
    """ Entry point of the lambda function"""
    while True:
        try:
            serialRXThread = SerialRXThread()
            serialRXThread.start()

            print 'Start of while Loop'

            # Do work until the lambda is killed.
            while True:
                syncShadow()
                time.sleep(0.5)
                reportShadow()
                time.sleep(0.5)

        except Exception as ex:
            print 'ERROR: {}'.format(ex)

        time.sleep(5)


# Execute the function above
greengrassInfiniteLoop()


# This is a dummy handler and will not be invoked
# Instead the code above will be executed in an infinite loop for our example
def function_handler(event, context):
    return
