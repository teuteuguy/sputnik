import platform
import greengrasssdk
import json
from inspect import currentframe

class Publisher:
    def __init__(self, admin, thing):
        self.admin = admin
        self.thing = thing

        if platform.system() != 'Darwin':
            GGC = greengrasssdk.client('iot-data')
            def debug(topic=self.admin, payload={}):
                payload['thing'] = self.thing
                GGC.publish(topic=topic, payload=json.dumps(payload))
            self.publish = debug
            def debugUpdateShadow(thing=self.thing, payload={}):
                GGC.update_thing_shadow(thingName=self.thing, payload=json.dumps(payload))
            self.updateThingShadow = debugUpdateShadow
            def debugGetShadow():
                response = GGC.get_thing_shadow(thingName=self.thing)
                payloadDict = json.loads(response['payload'])
                stateDict = payloadDict['state']
                return stateDict
            self.getThingShadow = debugGetShadow
        else:
            def debug(topic=self.admin, payload={}):
                payload['thing'] = self.thing
                print(topic, json.dumps(payload))
            self.publish = debug
            def debugUpdateShadow(thing=self.thing, payload={}):
                print(thing, json.dumps(payload))
            self.updateThingShadow = debugUpdateShadow
            def debugGetShadow(thing=self.thing, payload={}):
                return {}
            self.getThingShadow = debugGetShadow

    def exception(self, err):
        self.publish(topic=self.admin, payload={
            "type":  "exception",
            "line": currentframe().f_back.f_lineno,
            "payload": err
        })

    def info(self, data):
        self.publish(topic=self.admin, payload={
            "type":  "info",
            "payload": data
        })

    def publish(self, topic, data):
        if len(data) == 0:
            return

        self.publish(topic=topic, payload=data)

    def updateThingShadow(self, data):
        if len(data) == 0:
            return

        self.updateThingShadow(thing=self.thing, payload=data)

    def getThingShadow(self):
        if len(data) == 0:
            return

        return self.getThingShadow()
