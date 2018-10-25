const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'deleteDevice';

module.exports = function (event, context) {

    return documentClient
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
            console.log('deleteDevice: results:', JSON.stringify(results, null, 4));
            return results[0];
        });

};
