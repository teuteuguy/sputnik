import os
import sys
import time
import json

from publish import Publisher

import serial
import serial.threaded

# THING_NAME = 'AMCF1_zmENs9ecm'
# SERIALPORT_PORT = '/dev/cu.SLAB_USBtoUART'
# SERIALPORT_SPEED = 115200

THING_NAME = '{}'.format(os.environ['THING_NAME'])
SERIALPORT_PORT = '{}'.format(os.environ['SERIALPORT_PORT'])
SERIALPORT_SPEED = '{}'.format(os.environ['SERIALPORT_SPEED'])

TOPIC_SENSORS = 'mtm/{}/sensors'.format(THING_NAME)
TOPIC_ADMIN = 'mtm/{}/admin'.format(THING_NAME)


try:
    PUB = Publisher(TOPIC_ADMIN, THING_NAME)

    PUB.info("Restart of Lambda")

    def function_handler(event, context):
        return

    PUB.info('Starting main loop')

except Exception as err:
    PUB.exception(str(err))
    time.sleep(1)


desiredBelt = {
    "beltMode": 2,
    "beltSpeed": 1
}

reportedBeltControl = {
    "beltMode": 2,
    "beltSpeed": 1
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


def getCharFor(beltSpeed, beltMode):
    char = '5'
    if beltSpeed == 1:
        if beltMode == 1:
            char = '4'
        elif beltMode == 2:
            char = '5'
        elif beltMode == 3:
            char = '6'
    elif beltSpeed == 2:
        if beltMode == 1:
            char = '3'
        elif beltMode == 2:
            char = '5'
        elif beltMode == 3:
            char = '7'

    return char



def syncShadow():

    result = False

    try:

        state = PUB.getThingShadow()

        if 'desired' in state:

            print 'Syncshadow RX: ' + json.dumps(state['desired'])
            print
            print 'Syncshadow VS: ' + json.dumps(desiredBelt)

            if 'beltMode' in state['desired'] and desiredBelt['beltMode'] != state['desired']['beltMode']:
                desiredBelt['beltMode'] = state['desired']['beltMode']
                result = True

            if 'beltSpeed' in state['desired'] and desiredBelt['beltSpeed'] != state['desired']['beltSpeed']:
                desiredBelt['beltSpeed'] = state['desired']['beltSpeed']
                result = True

    except Exception as err:
        PUB.exception(str(err))
        time.sleep(1)
        print 'ERROR in syncShadow: {}'.format(err)
        result = False

    return result


class MySerial(serial.threaded.LineReader):
    def __init__(self):
        super(MySerial, self).__init__()

    def handle_line(self, data):
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
                                self.write_line(getCharFor(desiredBelt['beltSpeed'], desiredBelt['beltMode']))
                            else:
                                reportedBeltControl['beltSpeed'] = data['state']['reported']['speed']

                        if 'mode' in data['state']['reported']:
                            if data['state']['reported']['mode'] != 1 and data['state']['reported']['mode'] != 2 and data['state']['reported']['mode'] != 3:
                                print 'Incorrect mode reported'
                                self.write_line(getCharFor(desiredBelt['speed'], desiredBelt['beltMode']))
                            else:
                                reportedBeltControl['mode'] = data['state']['reported']['mode']

                        PUB.updateThingShadow(payload={'state': {'reported': reportedBeltControl}})

                if 'chassis' in data:

                    if 'x' in data['chassis'] and 'y' in data['chassis'] and 'z' in data['chassis']:

                        if data['chassis']['x'] != reportedBeltSensors['chassis']['x'] or \
                           data['chassis']['y'] != reportedBeltSensors['chassis']['y'] or \
                           data['chassis']['z'] != reportedBeltSensors['chassis']['z']:

                            reportedBeltSensors['chassis'].update(data['chassis'])

                            PUB.publish(TOPIC_SENSORS, reportedBeltSensors)

                if syncShadow():
                    self.write_line(getCharFor(desiredBelt['beltSpeed'], desiredBelt['beltMode']))

        except Exception as ex:
            print 'ERROR in handle_line: {}'.format(ex)


def main_loop():
    try:
        print 'Start'
        ser = serial.serial_for_url(SERIALPORT_PORT, int(SERIALPORT_SPEED))
        with serial.threaded.ReaderThread(ser, MySerial) as protocol:
            while True:
                try:
                    time.sleep(1)
                except Exception as err:
                    PUB.exception(str(err))
                    raise err

    except Exception as err:
        PUB.exception(str(err))
        time.sleep(1)
        ser.close()

    Timer(0, main_loop).start()

main_loop()

