import os
import time
import cv2  # pylint: disable=import-error

class SaveFrames:

    def __init__(self, path="/tmp/"):
        ''' Constructor. '''
        print("New SaveFrames")
        self.path = path

    def getTimestampFilename(self):
        return "{}.jpg".format(int(round(time.time() * 1000)))

    def saveToFile(self, frame, filename):
        fullPath = self.path + filename
        print("SaveFrames.saveToFile: Saving frame to {}".format(fullPath))

        localWriteReturn = cv2.imwrite(fullPath, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        if not localWriteReturn:
            raise Exception("SaveFrames.saveToFile: Failed to save frame to file")

        return fullPath

