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
    Instantiate the VideoStream class.
    Use the method read() to get the frame.
    '''
    def __init__(self, camera_type="video0", path_to_camera="/dev/video0", width="1920", height="1080"):
        ''' Constructor. Chooses a camera to read from. '''
        print("VideoStream: {}, {}, {}, {}".format(camera_type, path_to_camera, width, height))
        self.camera_type = camera_type
        self.path_to_camera = path_to_camera
        self.width = width
        self.height = height

        if self.camera_type == "Darwin":

            print("VideoStream: Opening webcam")
            self.path_to_camera = "Webcam"
            self.stream = cv2.VideoCapture(0)
            self.stream.set(3, self.width)
            self.stream.set(4, self.height)

        elif self.camera_type == "video0":

            print("VideoStream: Opening {}".format(self.path_to_camera))
            self.stream = cv2.VideoCapture(self.path_to_camera)
            print("VideoStream: Stream opened = {}".format(self.stream.isOpened()))

        elif self.camera_type == "awscam":

            print("VideoStream: Opening awscam")
            import awscam  # pylint: disable=import-error
            self.stream = awscam
            self.stream.read = self.stream.getLastFrame
            print("VideoStream: awscam opened")

        else:
            self.path_to_camera = "GStreamer"
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

    def get_height(self):
        return self.height

    def get_width(self):
        return self.width

    def read(self):
        '''read() return the last frame captured'''
        return self.stream.read()
