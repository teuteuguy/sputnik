const os = require('os');

class GGIoT {

    constructor(thingName = 'default', prefix = 'mtm') {
        console.log('GGIOT: init for:', thingName);
        this.thingName = thingName;
        this.prefix = prefix;
        this.topicPrefix = this.prefix + '/' + this.thingName + '/';
        this.topicLogger = this.topicPrefix + 'logger';

        switch (os.platform()) {
            case 'darwin':
                this.ggSDK = {
                    getThingShadow: (params = {
                        thingName: self.thingName
                    }, callback = (err, data) => {
                        console.log('Default callback:', err, data);
                    }) => {
                        callback(null, {});
                    },
                    publish: (params = {
                        topic: 'default/topic',
                        payload: JSON.stringify({})
                    }, callback = (err, data) => {
                        console.log('Default callback:', err, data);
                    }) => {
                        // console.log('ggSDK.publish: ', params.topic, params.payload);
                        callback(null, 'success');
                    },
                    updateThingShadow: (params = {}, callback = (err, data) => {
                        console.log('Default callback:', err, data);
                    }) => {
                        callback(null, 'success');
                    }
                };
                break;
            default:
                this.ggSDK = require('./aws-greengrass-core-sdk');
                break;
        }

    }

    getThingShadow(thingName = this.thingName) {
        return new Promise((resolve, reject) => {
            this.ggSDK.getThingShadow({
                thingName: thingName
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    publish(topic, payload) {
        return new Promise((resolve, reject) => {
            this.ggSDK.publish({
                topic: topic,
                payload: JSON.stringify(payload)
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    updateThingShadow(payload, thingName = self.thingName) {
        return new Promise((resolve, reject) => {
            this.ggSDK.updateThingShadow({
                thingName: thingName,
                payload: JSON.stringify(payload)
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    info(message) {
        return this.publish(this.topicLogger, {
            type: 'info',
            payload: message
        });
    }

    exception(ex) {
        return this.publish(this.topicLogger, {
            type: 'exception',
            payload: ex
        });
    }
}

module.exports = GGIoT;
