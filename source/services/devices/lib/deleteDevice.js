const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'deleteDevice';

module.exports = function (event, context, callback) {
    if (event.cmd !== lib) {
        return callback('Wrong cmd for lib. Should be ' + lib + ', got event: ' + event, null);
    }

    documentClient
        .get({
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            }
        })
        .promise().then(device => {
            if (device.Item) {
                console.log('Device:', device);
                const iotParams = {
                    thingName: device.Item.thingName
                };
                const ddbParams = {
                    TableName: process.env.TABLE_DEVICES,
                    Key: {
                        thingId: event.thingId
                    }
                };
                return Promise.all([
                    device.Item,
                    documentClient.delete(ddbParams).promise(),
                    iot.deleteThing(iotParams).promise()
                ]);
            } else {
                throw 'Device ' + event.thingId + ' does not exist.';
            }
        })
        .then(results => {
            const oldDevice = results[0];
            console.log(oldDevice);
            callback(null, oldDevice);
        })
        .catch(err => {
            callback(err, null);
        });

    // getDeviceStatsRecursive().then(stats => {
    //     callback(null, stats);
    // }).catch(err => {
    //     callback(err, null);
    // });
};
