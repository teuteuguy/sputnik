'''
Module camera provides the VideoStream class which
offers a threaded interface to multiple types of cameras.
'''
from threading import Thread
import os
import platform
import cv2 # pylint: disable=import-error

class VideoStream:
    '''
    Instantiate the VideStream class and call the start() method
    to be able to read from the camera, instantiate only once.
    Use the method read() to get the latest frame.
    '''
    def __init__(self, device, width, height):
        ''' Constructor. Chooses a camera to read from. '''
        print('VideoStream: {}, {}, {}'.format(device, width, height))
        self.device = device
        self.width = width
        self.height = height

        if self.device == 'Darwin':
            print('Opening webcam')
            self.device = 'Webcam'
            self.stream = cv2.VideoCapture(0)
            self.stream.set(3, self.width)
            self.stream.set(4, self.height)
        elif self.device == '/dev/video0':
            print('Opening /dev/video0')
            self.stream = cv2.VideoCapture(self.device)
            print('Stream opened = {}'.format(self.stream.isOpened()))
        elif self.device == '/dev/video1':
            print('Opening /dev/video1')
            self.stream = cv2.VideoCapture(self.device)
            print('Stream opened = {}'.format(self.stream.isOpened()))
        elif self.device == 'awscam':
            print('Opening awscam')
            import awscam  # pylint: disable=import-error
            self.awscam = awscam
        else:
            self.device = 'GStreamer'
            HD_2K = False
            if HD_2K:
                self.width = 2592  # 648
                self.height = 1944  # 486
            else:
                self.width = 1296  # 324
                self.height = 972  # 243

            gst_str = ("nvcamerasrc ! "
                       "video/x-raw(memory:NVMM), width=(int)2592, height=(int)1944,"
                       "format=(string)I420, framerate=(fraction)30/1 ! "
                       "nvvidconv ! video/x-raw, width=(int){}, height=(int){}, "
                       "format=(string)BGRx ! videoconvert ! appsink").format(self.width, self.height)
            self.stream = cv2.VideoCapture(gst_str, cv2.CAP_GSTREAMER)

        self.stopped = False

        self.read()

    def get_height(self):
        return self.height

    def get_width(self):
        return self.width

    def read(self):
        '''read() return the last frame captured'''
        if self.device == 'awscam':
            return self.awscam.getLastFrame()
        else:
            return self.stream.read()
