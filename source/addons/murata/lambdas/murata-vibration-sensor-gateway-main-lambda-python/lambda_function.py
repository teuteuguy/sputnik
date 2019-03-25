from transitions import Machine
from ggiot import GGIoT
import json
import os
import sys
from threading import Event, Thread, Timer
import time

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter("AWS_IOT_THING_NAME", "UNKNOWN")
SERIAL_PORT = get_parameter("SERIAL_PORT", "UNKNOWN")
PREFIX = "murata"

TX_TOPIC = 'serial/{0}/write{1}'.format(THING_NAME, SERIAL_PORT)
RX_TOPIC = 'serial/{0}/read_response{1}'.format(THING_NAME, SERIAL_PORT)

print("Lambda start:")

GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

def txFunction(message):
    print("TX: {}".format(message))
    GGIOT.publish(topic=TX_TOPIC, payload={
        "data": message,
        "type": "ascii"
    })



class Gateway(object):
    def __init__(self, txFunction):
        self.txFunction = txFunction

    def printState(self):
        print('Gateway entered {} state'.format(self.state))

    def on_enter_idle(self, rxData=None):
        self.printState()

    def on_enter_reset(self, rxData = None):
        self.printState()
        self.txFunction('XKSLEEP\r\n')
        self.resetState = 0

    def on_enter_resetChangeDefault(self, rxData=None):
        self.printState()
        self.txFunction('XKNSETINFO 35 1011 818D\r\n')

    def on_enter_resetSetKey(self, rxData=None):
        self.printState()
        self.txFunction('XKSETKEY 00000000000000000000000000000000\r\n')

    def on_enter_resetSRegS0E(self, rxData=None):
        self.printState()
        self.txFunction('XKSREG S0E 1\r\n')

    def on_enter_resetSRegS2A(self, rxData=None):
        self.printState()
        self.txFunction('XKSREG S2A 0\r\n')

    def on_enter_resetRX1(self, rxData=None):
        self.printState()
        self.txFunction('XK-RX 1\r\n')

    def on_enter_resetNGW(self, rxData=None):
        self.printState()
        self.txFunction('XKNGW 7FFF\r\n')

    # def is_ewake(self, rxData):
    #     if not 'data' in rxData: return False
    #     return rxData['data'] == "EWAKE\r\n"

    # def is_ok(self, rxData):
    #     if not 'data' in rxData: return False
    #     return rxData['data'].endswith('OK\r\n')

    def is_resetDone(self, rxData):
        if not 'data' in rxData:
            return False

        def is_ewake(rxData):
            return rxData['data'] == "EWAKE\r\n"

        def is_ok(rxData):
            return rxData['data'].endswith('OK\r\n')

        if self.resetState == 0:
            if is_ewake(rxData):
                self.resetState += 1
            else:
                self.on_enter_reset(rxData)
        elif self.resetState == 1:
            if is_ok(rxData):
                self.resetState += 1
            else:
                self.on_enter_reset(rxData)
        elif self.resetState == 2:
            return True

        return False


murata = Gateway(txFunction)

states = ['reset', 'resetChangeDefault', 'resetSetKey', 'resetSRegS0E', 'resetSRegS2A', 'resetRX', 'resetNGW', 'idle']

stateMachine = Machine(model=murata, states=states, initial='idle', auto_transitions=False)
stateMachine.add_transition('reset', '*', 'reset')
stateMachine.add_transition('rx', 'idle', 'idle')
# stateMachine.add_transition('rx', 'reset', 'resetChangeDefault', conditions=['is_ewake'])
# stateMachine.add_transition('rx', 'resetChangeDefault', 'resetSetKey', conditions=['is_ok'])
# stateMachine.add_transition('rx', 'resetSetKey', 'resetSRegS0E', conditions=['is_ok'])
# stateMachine.add_transition('rx', 'resetSRegS0E', 'resetSRegS2A', conditions=['is_ok'])
# stateMachine.add_transition('rx', 'resetSRegS2A', 'resetRX', conditions=['is_ok'])
# stateMachine.add_transition('rx', 'resetRX', 'resetNGW', conditions=['is_ok'])
stateMachine.add_transition('rx', 'reset', 'idle', conditions=['is_resetDone'])
# stateMachine.add_transition('rx', '*', 'idle')

murata.reset()
murata.rx({"data": "EWAKE\r\n"})
murata.rx({"data": "bla OK\r\n"})
murata.rx({"data": "bla OK\r\n"})
murata.rx({"data": "bla OK\r\n"})
murata.rx({"data": "bla OK\r\n"})
murata.rx({"data": "bla OK\r\n"})
murata.rx({"data": "bla OK\r\n"})

def lambda_handler(event, context):
    print("Received Event: {}".format(json.dumps(event)))
    topic = context.client_context.custom["subject"]
    print("Received Topic: {}".format(topic))
    murata.rx(event)
    return
