import platform
import greengrasssdk
import json
from inspect import currentframe

class GGIoT:

    # Constructor
    def __init__(self, thing='default', prefix='mtm'):
        self.thing = thing
        self.prefix = prefix
        self.topicPrefix = self.prefix + '/' + self.thing + '/'
        self.topicLogger = self.topicPrefix + 'logger'

        if platform.system() != 'Darwin':
            GGC = greengrasssdk.client('iot-data')

            def prepPublish(topic=self.topicLogger, payload={}):
                GGC.publish(topic=topic, payload=json.dumps(payload))

            def prepUpdateShadow(thing=self.thing, payload={}):
                GGC.update_thing_shadow(thingName=thing, payload=json.dumps(payload))

            def prepGetShadow():
                response = GGC.get_thing_shadow(thingName=self.thing)
                payloadDict = json.loads(response['payload'])
                # stateDict = payloadDict['state']
                return payloadDict

            self.publish = prepPublish
            self.updateThingShadow = prepUpdateShadow
            self.getThingShadow = prepGetShadow

        else:
            print('Platform is Darwin (ie. could be a mac)')

            def debug(topic=self.topicLogger, payload={}):
                print(topic + ': ' + json.dumps(payload))

            def debugUpdateShadow(thing=self.thing, payload={}):
                print("updateThingShadow: " + thing + ": " + json.dumps(payload))

            def debugGetShadow(thing=self.thing, payload={}):
                print("getThingShadow: " + thing + ": {}")
                return {}

            self.publish = debug
            self.updateThingShadow = debugUpdateShadow
            self.getThingShadow = debugGetShadow

    def info(self, data):
        self.publish(topic=self.topicLogger, payload={
            "type":  "info",
            "payload": data
        })

    def exception(self, err):
        self.publish(topic=self.topicLogger, payload={
            "type":  "exception",
            "line": currentframe().f_back.f_lineno,
            "payload": err
        })

    def publish(self, topic, data):
        self.publish(topic=topic, payload=data)

    def updateThingShadow(self, data):
        self.updateThingShadow(thing=self.thing, payload=data)

    def getThingShadow(self):
        return self.getThingShadow()
