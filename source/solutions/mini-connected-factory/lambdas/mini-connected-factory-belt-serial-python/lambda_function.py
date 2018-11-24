from threading import Thread, Timer, Event
import platform
import os
import time
import json

from ggiot import GGIoT
from belt import Belt

import serial
import serial.threaded

if platform.system() != "Darwin":
    # SYNC_SHADOW_FREQ = 0.1
    SYNC_SHADOW_FREQ = 2
    THING_NAME = "{}".format(os.environ["THING_NAME"])
    SERIALPORT_PORT = "{}".format(os.environ["SERIALPORT_PORT"])
    SERIALPORT_SPEED = "{}".format(os.environ["SERIALPORT_SPEED"])
else:
    SYNC_SHADOW_FREQ = 2
    THING_NAME = "HomeBelt"
    SERIALPORT_PORT = "/dev/cu.SLAB_USBtoUART"
    # SERIALPORT_PORT = "/dev/cu.Bluetooth-Incoming-Port"
    SERIALPORT_SPEED = 115200

PREFIX = "mtm"
TOPIC_FOR_SENSORS = "{}/{}/sensors".format(PREFIX, THING_NAME)

BELT = Belt()
GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

class MainThread(Thread):

    def __init__(self):
        super(MainThread, self).__init__()
        self.stop_request = Event()

    def run(self):
        while 42:
            try:
                print("Opening Serial port")
                SERIAL = serial.serial_for_url(SERIALPORT_PORT, int(SERIALPORT_SPEED))

                class LineReaderClass(serial.threaded.LineReader):
                    def __init__(self):
                        super(LineReaderClass, self).__init__()
                        self.SHADOW_DESIRED = {
                            "mode": 2,
                            "speed": 1
                        }
                        self.SHADOW_REPORTED = {
                            "mode": 2,
                            "speed": 1
                        }

                    def connection_made(self, transport):
                        super(LineReaderClass, self).connection_made(transport)
                        print("port opened")

                    def connection_lost(self, exc):
                        print("port closed: {}".format(str(exc)))

                    def handle_line(self, data):
                        # print("MainThread.run: {}".format(data))
                        BELT.parseSerial(data, self.write_line, GGIOT, TOPIC_FOR_SENSORS)

                with serial.threaded.ReaderThread(SERIAL, LineReaderClass) as protocol:
                    while 42:
                        pass
                        # time.sleep(3)
                        # print("6")
                        # protocol.write_line("6")

            except Exception as ex:
                print("ERROR: {}".format(str(ex)))

    def join(self):
        self.stop_request.set()

mainThread = MainThread()
mainThread.start()

BELT.parseIncomingShadow(GGIOT.getThingShadow(), GGIOT)

def lambda_handler(event, context):
    print("lambda_handler: {}".format(json.dumps(event)))
    BELT.parseIncomingShadow(event, GGIOT)
    return




















# class MyProtocol(serial.threaded.Protocol):
#     def __init__(self):
#         super(MyProtocol, self).__init__()

#     def connection_lost(self, err):
#         print("connection_lost: {}".format(err))

#     def connection_made(self, transport):
#         super(MyProtocol, self).connection_made(transport)
#         print(".connection_made")

#     def data_received(self, data):
#         # print(".data_received")
#         pass

# # SERIAL = serial.serial_for_url(SERIALPORT_PORT, int(SERIALPORT_SPEED))


# # class MySerial(serial.threaded.LineReader):

# #     global SHADOW_DESIRED
# #     global SHADOW_REPORTED

# #     def __init__(self):
# #         super(MySerial, self).__init__()

# #     def connection_lost(self, err):
# #         print("BeltSerialRXThread.connection_lost: {}".format(err))

# #     def connection_made(self, transport):
# #         super(MySerial, self).connection_made(transport)
# #         print("BeltSerialRXThread.connection_made")
# #         self.write_line("0")

# #     # def handle_line(self, data):
# #     #     parseIncomingSerialLine(data=data, serialWrite=self.write_line)

# class MainAppThread(Thread):

#     def __init__(self):
#         super(MainAppThread, self).__init__()
#         self.stop_request = Event()
#         print("MainAppThread.init")

#     def join(self):
#         self.stop_request.set()

#     def run(self):
#         while 42:
#             time.sleep(2)
#             try:
#                 with serial.Serial(SERIALPORT_PORT, int(SERIALPORT_SPEED), timeout=0.1) as ser:
#                     time.sleep(1)
#                     ser.write("0")
#                     while 42:
#                         try:
#                             if ser.inWaiting() > 0:
#                                 print("MainAppThread.run: {} bytes to read".format(ser.inWaiting()))
#                                 ser.reset_input_buffer()
#                                 # line = ser.readline().strip()
#                                 # print("MainAppThread.run: Serial read: {}".format(line))
#                             else:
#                                 print("MainAppThread.run: No more to read, sleeping")
#                                 time.sleep(1)
#                                 ser.write("1")

#                         except Exception as ex:
#                             raise ex

#             except Exception as ex:
#                 print("MainAppThread.run: ERROR: {}".format(ex))
#                 GGIOT.exception(str(ex))

#                 # self.serial.open()
#                 # with serial.threaded.Protocol(self.serial, MyProtocol) as protocol:
#                 #     while 42:
#                 #         time.sleep(5)

# # #             # try:
# # #             #     with serial.threaded.ReaderThread(SERIAL, MySerial) as protocol:
# # #             #         try:
# # #             #             # protocol.write_line("0")
# # #             #             while 42:
# # #             #                 time.sleep(2)
# # #             #                 protocol.write_line("1")
# # #             #         except Exception as err:
# # #             #             raise err

# # mainAppThread = MainAppThread()
# # mainAppThread.start()










# # def main_loop():
# #     try:
# #         print "Start"
# #         ser = serial.serial_for_url(SERIALPORT_PORT, int(SERIALPORT_SPEED))
# #         with serial.threaded.ReaderThread(ser, MySerial) as protocol:
# #             while True:
# #                 try:
# #                     time.sleep(1)
# #                 except Exception as err:
# #                     PUB.exception(str(err))
# #                     raise err

# #     except Exception as err:
# #         PUB.exception(str(err))
# #         time.sleep(1)
# #         ser.close()

# #     Timer(0, main_loop).start()


# # main_loop()


# # class BeltSerialRXThread(Thread):

# #     global SERIAL
# #     global SHADOW_DESIRED

# #     def __init__(self):
# #         super(BeltSerialRXThread, self).__init__()
# #         self.stop_request = Event()
# #         self.BELT_SENSORS = {
# #             "chassis": {
# #                 "x": 0,
# #                 "y": 0,
# #                 "z": 0
# #             },
# #             "speed": {
# #                 "rpm": 0
# #             }
# #         }
# #         self.SHADOW_REPORTED_BELT_CONTROL = {
# #             "beltMode": 2,
# #             "beltSpeed": 1
# #         }
# #         print("BeltSerialRXThread.init")

# #     def join(self):
# #         self.stop_request.set()

# #     def run(self):

# #         while 42:

# #             try:
# #                 if SERIAL.is_open == False:
# #                     print("BeltSerialRXThread.run: Serial port closed for some reason. re-opening")
# #                     time.sleep(2)
# #                     SERIAL.open()
# #                 else:

# #                     print("BeltSerialRXThread.run: readline()")
# #                     data = SERIAL.readline().strip()

# #                     print("BeltSerialRXThread.run: " + data)

# #                     beltHasReportedState = False

# #                     if " [BELT_SHADOW] {" in data:
# #                         data = json.loads(data.split(" [BELT_SHADOW] ")[1])
# #                         beltHasReportedState = True

# #                     elif " [BELT_TELEMETRY] {" in data:
# #                         data = json.loads(data.split(" [BELT_TELEMETRY] ")[1])
# #                         beltHasReportedState = True

# #                     if beltHasReportedState:

# #                         if "state" in data:

# #                             if "reported" in data["state"]:

# #                                 needToUpdateShadow = False

# #                                 if "speed" in data["state"]["reported"]:
# #                                     if data["state"]["reported"]["speed"] != 1 and \
# #                                     data["state"]["reported"]["speed"] != 2:
# #                                         print("BeltSerialRXThread.run: Incorrect speed reported")
# #                                         SERIAL.write(BELT.getCharFor(SHADOW_DESIRED["beltSpeed"], SHADOW_DESIRED["beltMode"]))
# #                                         # self.write_line(BELT.getCharFor(
# #                                         #     SHADOW_DESIRED["beltSpeed"], SHADOW_DESIRED["beltMode"]))
# #                                     else:
# #                                         if self.SHADOW_REPORTED_BELT_CONTROL["beltSpeed"] != data["state"]["reported"]["speed"]:
# #                                             needToUpdateShadow = True
# #                                             self.SHADOW_REPORTED_BELT_CONTROL["beltSpeed"] = data["state"]["reported"]["speed"]

# #                                 if "mode" in data["state"]["reported"]:
# #                                     if data["state"]["reported"]["mode"] != 1 and data["state"]["reported"]["mode"] != 2 and data["state"]["reported"]["mode"] != 3:
# #                                         print("BeltSerialRXThread.run: Incorrect mode reported")
# #                                         SERIAL.write(BELT.getCharFor(SHADOW_DESIRED["speed"], SHADOW_DESIRED["beltMode"]))
# #                                         # self.write_line(BELT.getCharFor(SHADOW_DESIRED["speed"], SHADOW_DESIRED["beltMode"]))
# #                                     else:
# #                                         if self.SHADOW_REPORTED_BELT_CONTROL["beltMode"] != data["state"]["reported"]["mode"]:
# #                                             needToUpdateShadow = True
# #                                             self.SHADOW_REPORTED_BELT_CONTROL["beltMode"] = data["state"]["reported"]["mode"]

# #                                 if needToUpdateShadow:
# #                                     GGIOT.updateThingShadow(payload={"state": {"reported": self.SHADOW_REPORTED_BELT_CONTROL}})

# #                         if "chassis" in data:

# #                             if "x" in data["chassis"] and "y" in data["chassis"] and "z" in data["chassis"]:

# #                                 if data["chassis"]["x"] != self.BELT_SENSORS["chassis"]["x"] or \
# #                                 data["chassis"]["y"] != self.BELT_SENSORS["chassis"]["y"] or \
# #                                 data["chassis"]["z"] != self.BELT_SENSORS["chassis"]["z"]:

# #                                     self.BELT_SENSORS["chassis"].update(data["chassis"])

# #                                     GGIOT.publish(TOPIC_FOR_SENSORS, self.BELT_SENSORS)

# #                         print("Current Desired is: {}".format(json.dumps(SHADOW_DESIRED)))
# #                         print("Current Reported is: {}".format(json.dumps(self.SHADOW_REPORTED_BELT_CONTROL)))
# #                         if self.SHADOW_REPORTED_BELT_CONTROL["beltMode"] != SHADOW_DESIRED["beltMode"] or \
# #                                 self.SHADOW_REPORTED_BELT_CONTROL["beltSpeed"] != SHADOW_DESIRED["beltSpeed"]:
# #                             SERIAL.write(BELT.getCharFor(SHADOW_DESIRED["beltSpeed"], SHADOW_DESIRED["beltMode"]))

# #             except Exception as ex:
# #                 print("BeltSerialRXThread.run: ERROR: {}".format(ex))
# #                 GGIOT.exception(str(ex))

# # SERIAL = serial.serial_for_url(SERIALPORT_PORT, int(SERIALPORT_SPEED))
# # SERIAL = serial.Serial()
# # SERIAL.baudrate = int(SERIALPORT_SPEED)
# # SERIAL.port = SERIALPORT_PORT
# # SERIAL.timeout = 0
# # SERIAL.open()
# # SERIAL.write("0")

# # beltSerialRXThread = BeltSerialRXThread()
# # beltSerialRXThread.start()
