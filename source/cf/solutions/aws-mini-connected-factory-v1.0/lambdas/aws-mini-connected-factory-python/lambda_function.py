import os
import sys
import time
import json

from publish import Publisher

THING_NAME = '{}'.format(os.environ['THING_NAME'])
TOPIC_ADMIN = 'mtm/{}/factory'.format(THING_NAME)


try:
    PUB = Publisher(TOPIC_ADMIN, THING_NAME)

    PUB.info("Restart of Lambda")

    def function_handler(event, context):
        PUB.info(json.dumps(event))
        return

    PUB.info('Starting main loop')

except Exception as err:
    PUB.exception(str(err))
    time.sleep(1)

