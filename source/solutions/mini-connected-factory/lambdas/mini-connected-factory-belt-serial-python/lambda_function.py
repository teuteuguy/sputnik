from threading import Thread, Timer, Event
import platform
import os
import time
import json

from ggiot import GGIoT
from belt import Belt

import serial
import serial.threaded

PREFIX = "mtm"

if platform.system() != "Darwin":
    SYNC_SHADOW_FREQ = 2
    THING_NAME = "{}".format(os.environ["THING_NAME"])
    SERIALPORT_PORT = "{}".format(os.environ["SERIALPORT_PORT"])
    SERIALPORT_SPEED = "{}".format(os.environ["SERIALPORT_SPEED"])
else:
    SYNC_SHADOW_FREQ = 2
    THING_NAME = "HomeBelt"
    SERIALPORT_PORT = "/dev/cu.SLAB_USBtoUART"
    SERIALPORT_SPEED = 115200

TOPIC_FOR_SENSORS = "{}/{}/sensors".format(PREFIX, THING_NAME)

BELT = Belt()
GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

class MainThread(Thread):

    def __init__(self):
        super(MainThread, self).__init__()
        self.stop_request = Event()
        self.needToUpdateBelt = False

    def run(self):
        while 42:
            try:
                print("MainThread: Opening Serial port")
                SERIAL = serial.serial_for_url(SERIALPORT_PORT, int(SERIALPORT_SPEED))

                class LineReaderClass(serial.threaded.LineReader):
                    def __init__(self):
                        super(LineReaderClass, self).__init__()

                    def connection_made(self, transport):
                        super(LineReaderClass, self).connection_made(transport)
                        print("MainThread: port opened")

                    def connection_lost(self, exc):
                        print("MainThread: port closed: {}".format(str(exc)))

                    def handle_line(self, data):
                        # print("MainThread.run: {}".format(data))
                        try:
                            BELT.parseSerial(data, self.write_line, GGIOT, TOPIC_FOR_SENSORS)
                        except Exception as err:
                            print("MainThread: corrupted line: {}".format(data))
                            print("MainThread: corrupted line: {}".format(str(err)))

                with serial.threaded.ReaderThread(SERIAL, LineReaderClass) as protocol:
                    while 42:
                        # Keep the serial port open.
                        if self.needToUpdateBelt:
                            self.needToUpdateBelt = False
                            BELT.writeDesiredToSerial(protocol.write_line)
                        # pass

            except Exception as ex:
                print("ERROR: {}".format(str(ex)))

    def join(self):
        self.stop_request.set()

    def updateBeltRequested(self):
        self.needToUpdateBelt = True

mainThread = MainThread()
mainThread.start()


''' Init '''
BELT.parseIncomingShadow(GGIOT.getThingShadow())

''' Function Handler '''
def lambda_handler(event, context):
    '''
    This lambda function's purpose is to connect the 3D printed belt over a serial connection.
    The belt will change it's behavior based on shadow updates (update, delta etc...).
    '''
    topic = context.client_context.custom["subject"]
    print("lambda_handler: {}: {}".format(topic, json.dumps(event)))

    if BELT.parseIncomingShadow(event):
        mainThread.updateBeltRequested()

    return

