import os
import cv2
import time
from threading import Timer

import awscam
from file_output import FileOutput
from publish import Publisher
from inference import Infer

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter('AWS_IOT_THING_NAME', 'Unknown')
IOT_TOPIC_INFERENCE = 'mtm/{}/inference'.format(THING_NAME)
IOT_TOPIC_ADMIN = 'mtm/{}/admin'.format(THING_NAME)
IOT_TOPIC_SHADOW_UPDATE = '$aws/things/{}/shadow/update'.format(THING_NAME)
BELT_NAME = get_parameter('BELT_IOT_THING_NAME', 'Unknown')
BELT_IOT_TOPIC_SHADOW_UPDATE = '$aws/things/{}/shadow/update'.format(BELT_NAME)
ML_MODEL_PATH = get_parameter('ML_MODEL_PATH', '')
BELT_MODE_FORWARD = 1
BELT_MODE_STOP = 2
# BELT_MODE_FORWARD = "f"
# BELT_MODE_STOP = "s"

BELT_DEFAULT_SPEED = 1
RESUME_COMMAND_FILE_PATH = '/tmp/resume'


try:
    PUB = Publisher(IOT_TOPIC_ADMIN, IOT_TOPIC_INFERENCE, THING_NAME)

    PUB.info("Loading new Thread")
    PUB.info('OpenCV '+cv2.__version__)

    def lambda_handler(event, context):
        return

    PUB.info('Getting last camera frame')
    ret, frame = awscam.getLastFrame()
    ret, frame = awscam.getLastFrame()

    PUB.info('Initilizing ouput file')
    OUTPUT = FileOutput('/tmp/results.mjpeg', frame, PUB)
    OUTPUT.start()

    PUB.info('Loading model at ' + ML_MODEL_PATH)
    model = Infer(ML_MODEL_PATH)

    PUB.info('Initilizing belt')
    PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, {"state": {"desired": {"mode": BELT_MODE_FORWARD, "speed": BELT_DEFAULT_SPEED}}})

    PUB.info('Starting main loop')

except Exception as err:
    PUB.exception(str(err))
    time.sleep(1)

def main_loop():
    try:
        last_update = time.time()
        results = []
        fps = 0
        while 42 :
            # in case the belt is stuck in a position with an unsafe lego figure in view,
            # create the file RESUME_COMMAND_FILE_PATH to force resume the belt
            if os.path.exists(RESUME_COMMAND_FILE_PATH):
                PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_FORWARD, "speed": BELT_DEFAULT_SPEED } } })

            ret, frame = awscam.getLastFrame()

            inference_size_x = 224
            inference_size_y = 224

            w = inference_size_x * 2
            h = inference_size_y * 2
            x = 1920 / 2 - w / 2
            y = 1080 / 2 - h / 2

            frame = frame[y:y+h, x:x+w]

            PUB.info('Frame loaded')
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (inference_size_x, inference_size_y)) # resize

            PUB.info('Frame resized')
            try:
                category, probability = model.do(frame)
                results.append(category)
                font = cv2.FONT_HERSHEY_DUPLEX
                title = str(fps) + " - " + category + " - " + str(probability)
                if probability > 0.6:
                    prob_no_hat = probability
                    if category == 'hat':
                        prob_no_hat = 1.0 - probability
                    elif category == 'nohat':
                        probability =  1.0 - probability
                    cv2.rectangle(frame, (0, 0), (int(frame.shape[1] * 0.2 * prob_no_hat), 80),
                                (0, 0, 255), -1)
                    cv2.rectangle(frame, (0, 90), (int(frame.shape[1] * 0.2 * probability), 170), (0, 255, 0), -1)
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    cv2.putText(frame, 'Not Safe', (10, 70), font, 1, (225, 225, 225), 8)
                    cv2.putText(frame, 'Safe', (10, 160), font, 1, (225, 225, 225), 8)

                    if prob_no_hat > 0.8: # definitely not safe
                        PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_STOP, "speed": BELT_DEFAULT_SPEED } } })
                    elif probability > 0.8: # definitely safe
                        PUB.publish(BELT_IOT_TOPIC_SHADOW_UPDATE, { "state": { "desired": { "mode": BELT_MODE_FORWARD, "speed": BELT_DEFAULT_SPEED } } })
            except Exception as err:
                PUB.exception(str(err))
                raise err

            now = time.time()
            if now - last_update >= 1:
                last_update = time.time()
                PUB.events(results)
                fps = len(results)
                results = []

            OUTPUT.update(frame)

    except Exception as err:
        PUB.exception(str(err))
        time.sleep(1)

    Timer(0, main_loop).start()

# OUTPUT.stop()
# VS.stop()

main_loop()
