import os
import sys
import time
import greengrasssdk
import json

import serial
import serial.threaded

# Creating a greengrass core sdk client
client = greengrasssdk.client('iot-data')

# THINGNAME = 'AMCF1_zmENs9ecm'
# SERIALPORT_PORT = '/dev/cu.SLAB_USBtoUART'
# SERIALPORT_SPEED = 115200

THINGNAME = '{}'.format(os.environ['THING_NAME'])
SERIALPORT_PORT = '{}'.format(os.environ['SERIALPORT_PORT'])
SERIALPORT_SPEED = '{}'.format(os.environ['SERIALPORT_SPEED'])

TOPIC_SENSORS = 'mtm/{}/sensors'.format(THINGNAME)


desiredBelt = {
    "mode": 2,
    "speed": 1
}

reportedBeltControl = {
    "mode": 2,
    "speed": 1
}

reportedBeltSensors = {
    "chassis": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "speed": {
        "rpm": 0
    }
}

def getCharFor(speed, mode):
    char = '5'
    if speed == 1:
        if mode == 1:
            char = '4'
        elif mode == 2:
            char = '5'
        elif mode == 3:
            char = '6'
    elif speed == 2:
        if mode == 1:
            char = '3'
        elif mode == 2:
            char = '5'
        elif mode == 3:
            char = '7'

    return char

def updateShadowControl():
    payload = json.dumps({ 'state': { 'reported': reportedBeltControl } })
    client.update_thing_shadow(thingName = THINGNAME, payload = payload)
    # print 'updateShadowControl: ' + payload

def publishSensorData():
    payload = reportedBeltSensors
    payload['thing'] = THINGNAME
    client.publish(topic=TOPIC_SENSORS, payload=json.dumps(payload))
    # client.update_thing_shadow(thingName = THINGNAME, payload = payload)
    # print 'publishSensorData: ' + payload


def syncShadow(serial):

    print 'SyncShadow'

    response = client.get_thing_shadow(thingName=THINGNAME)
    payloadDict = json.loads(response['payload'])
    stateDict = payloadDict['state']

    # We are only interested in the Desired.
    if 'desired' in stateDict:

        print 'Syncshadow rx: ' + json.dumps(stateDict['desired'])
        print 'Syncshadow vs: ' + json.dumps(desiredBelt)

        try:

            needSerial = False

            if 'mode' in stateDict['desired'] and desiredBelt['mode'] != stateDict['desired']['mode']:
                desiredBelt['mode'] = stateDict['desired']['mode']
                needSerial = True
            if 'speed' in stateDict['desired'] and desiredBelt['speed'] != stateDict['desired']['speed']:
                desiredBelt['speed'] = stateDict['desired']['speed']
                needSerial = True

            if needSerial:
                    print '================================================'
                    print 'Writing to belt on serial:'
                    serial.write_line(getCharFor(desiredBelt['speed'], desiredBelt['mode']))
                    print '======== Updated speed & mode - DESIRED ========'
                    print '================================================'

        except Exception as ex:
            print 'ERROR in syncShadow: {}'.format(ex)


class MySerial(serial.threaded.LineReader):
    def __init__(self):
        super(MySerial, self).__init__()

    def handle_line(self, data):
        # print data
        try:
            found = False
            if " [BELT_SHADOW] {" in data:
                data = json.loads(data.split(" [BELT_SHADOW] ")[1])
                found = True
                # print data
            elif " [BELT_TELEMETRY] {" in data:
                data = json.loads(data.split(" [BELT_TELEMETRY] ")[1])
                found = True
                # print data

            if found:
                if 'state' in data:

                    if 'reported' in data['state']:

                        if 'speed' in data['state']['reported']:
                            if data['state']['reported']['speed'] != 1 and \
                               data['state']['reported']['speed'] != 2:
                                print 'Incorrect speed reported'
                                self.write_line(getCharFor(desiredBelt['speed'], desiredBelt['mode']))
                            else:
                                reportedBeltControl['speed'] = data['state']['reported']['speed']

                        if 'mode' in data['state']['reported']:
                            if data['state']['reported']['mode'] != 1 and data['state']['reported']['mode'] != 2 and data['state']['reported']['mode'] != 3:
                                print 'Incorrect mode reported'
                                self.write_line(getCharFor(desiredBelt['speed'], desiredBelt['mode']))
                            else:
                                reportedBeltControl['speed'] = data['state']['reported']['speed']

                        updateShadowControl()

                if 'chassis' in data:

                    if 'x' in data['chassis'] and 'y' in data['chassis'] and 'z' in data['chassis']:

                        if data['chassis']['x'] != reportedBeltSensors['chassis']['x'] or \
                           data['chassis']['y'] != reportedBeltSensors['chassis']['y'] or \
                           data['chassis']['z'] != reportedBeltSensors['chassis']['z']:

                            reportedBeltSensors['chassis'].update(data['chassis'])
                            publishSensorData()

                syncShadow(serial = self)


        except Exception as ex:
            print 'ERROR in handle_line: {}'.format(ex)

def greengrassInfiniteLoop():
    """ Entry point of the lambda function"""
    while True:
        try:
            print 'Start'
            ser = serial.serial_for_url(SERIALPORT_PORT, int(SERIALPORT_SPEED))
            with serial.threaded.ReaderThread(ser, MySerial) as protocol:
                print 'Started'
                while True:
                    # syncShadow(protocol = protocol)
                    time.sleep(1)
                    # reportShadow()
                    # time.sleep(0.5)

        except Exception as ex:
            print 'ERROR: {}'.format(ex)

        time.sleep(5)

# Execute the function above
greengrassInfiniteLoop()

# This is a dummy handler and will not be invoked
# Instead the code above will be executed in an infinite loop for our example
def function_handler(event, context):
    return






# def greengrassInfiniteLoop():
#     """ Entry point of the lambda function"""
#     while True:
#         try:
#             serialRXThread = SerialRXThread()
#             serialRXThread.start()

#             print 'Start of while Loop'

#             # Do work until the lambda is killed.
#             while True:
#                 syncShadow()
#                 time.sleep(0.5)
#                 # reportShadow()
#                 # time.sleep(0.5)

#         except Exception as ex:
#             print 'ERROR: {}'.format(ex)

#         time.sleep(5)


# # Execute the function above
# greengrassInfiniteLoop()


# # This is a dummy handler and will not be invoked
# # Instead the code above will be executed in an infinite loop for our example
# def function_handler(event, context):
#     return
