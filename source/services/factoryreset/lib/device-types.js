const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const addCreatedAtUpdatedAt = require('./add-created-at-updated-at');

const deviceTypeTemplateFolder = 'device-types/';
const fs = require('fs');

class DeviceTypes {

    constructor() {}

    factoryReset(event, context, callback) {

        let deviceTypeInits = [];

        fs.readdirSync('./' + deviceTypeTemplateFolder).forEach(file => {
                    deviceTypeInits.push(require('../' + deviceTypeTemplateFolder + file)); // '../device-types/deeplens-v1.0.json'
        });

        console.log('Loaded:', deviceTypeInits);

        let params = {
            RequestItems: {}
        };
        params.RequestItems[process.env.TABLE_DEVICE_TYPES] = [];
        deviceTypeInits.forEach(dti => {
            params.RequestItems[process.env.TABLE_DEVICE_TYPES].push({
                PutRequest: {
                    Item: addCreatedAtUpdatedAt(dti)
                }
            });
        });

        documentClient.batchWrite(params).promise().then(data => {
            console.log('Batch write Device Types Result', data);
            callback(null, true);
        }).catch(err => {
            callback('Error: ' + JSON.stringify(err), null);
        });

    }
}

module.exports = DeviceTypes;
