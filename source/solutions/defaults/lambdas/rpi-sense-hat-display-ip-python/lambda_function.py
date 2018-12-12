import sys
import socket
from threading import Event, Thread, Timer
import time
import os

import sense_hat # pylint: disable=import-error
sense = sense_hat.SenseHat()

class _IP(object):  # (object) for Python2-compatibility

    @property
    def IP_address(self):
        """Get IP address: Returns either a string containing the IP
        address or the special value None.
        """
        try:
            s = socket.socket(self.socket_family, socket.SOCK_DGRAM)
            s.connect(self.external_IP_and_port)
            answer = s.getsockname()
            s.close()
            return answer[0] if answer else None
        except socket.error:
            return None

    def display_IP_address(self):
        """Print IP address on Sense Hat display"""
        sense.show_message(self.description + ": " + str(self.IP_address))


class IPv4(_IP):
    external_IP_and_port = ('198.41.0.4', 53)  # a.root-servers.net
    socket_family = socket.AF_INET
    description = "IPv4"


class IPv6(_IP):
    external_IP_and_port = ('2001:503:ba3e::2:30', 53)  # a.root-servers.net
    socket_family = socket.AF_INET6
    description = "IPv6"

class MainAppThread(Thread):

    def __init__(self):
        super(MainAppThread, self).__init__()
        self.stop_request = Event()
        print("MainAppThread.init")

    def join(self):
        self.stop_request.set()

    def run(self):
        try:
            sense.clear()
            while 42:
                IPv4().display_IP_address()

        except Exception as err:
            print(err)
            time.sleep(5)


mainAppThread = MainAppThread()
mainAppThread.start()

def lambda_handler(event, context):
    return
