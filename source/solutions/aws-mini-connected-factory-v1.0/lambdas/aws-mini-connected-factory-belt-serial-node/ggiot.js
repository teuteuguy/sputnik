const os = require('os');

class GGIoT {

    constructor(thingName = 'default', prefix = 'mtm') {
        this.thingName = thingName;
        this.prefix = prefix;
        this.topicPrefix = this.prefix + '/' + this.thingName + '/';
        this.topicLogger = this.topicPrefix + 'logger';

        switch (os.platform()) {
            case 'darwin':
                this.iotData = {
                    getThingShadow: (params = {
                        thingName: self.thingName
                    }, callback = (err, data) => {
                        console.log('Default callback');
                    }) => {
                        callback(null, {});
                    },
                    publish: (params = {
                        topic: 'default/topic',
                        payload: JSON.stringify({})
                    }, callback = (err, data) => {
                        console.log('Default callback');
                    }) => {
                        // console.log('iotData.publish: ', params.topic, params.payload);
                        callback(null, 'success');
                    },
                    updateThingShadow: (params = {}, callback = (err, data) => {
                        console.log('Default callback');
                    }) => {
                        callback(null, 'success');
                    }
                };
                break;
            default:
                console.log('GGIOT: not running on a mac');
                this.ggSDK = require('./aws-greengrass-core-sdk');
                this.iotData = new this.ggSDK.IotData();
                break;
        }

        console.log('GGIOT: init for: ' + thingName);
    }

    getThingShadow(callback, thingName = this.thingName) {
        this.iotData.getThingShadow({
            thingName: thingName
        }, (err, data) => {
            if (err) {
                callback(err, data);
            } else {
                callback(err, JSON.parse(data.Payload));
            }
        });
    }

    publish(topic, payload, callback) {
        this.iotData.publish({
            topic: topic,
            payload: JSON.stringify(payload)
        }, callback);
    }

    updateThingShadow(payload, callback, thingName = self.thingName) {
        this.iotData.updateThingShadow({
            thingName: thingName,
            payload: JSON.stringify(payload)
        }, callback);
    }

    info(message, callback) {
        this.publish(this.topicLogger, {
            type: 'info',
            payload: message
        }, callback);
    }

    exception(ex, callback) {
        this.publish(this.topicLogger, {
            type: 'exception',
            payload: ex
        }, callback);
    }
}

module.exports = GGIoT;
