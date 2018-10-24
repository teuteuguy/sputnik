const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const addCreatedAtUpdatedAt = require('./add-created-at-updated-at');

const fs = require('fs');
const templateFolder = 'device-types/';
const TABLE = process.env.TABLE_DEVICE_TYPES;

class DeviceTypes {

    constructor() {}

    factoryReset(event, context, callback) {

        let inits = [];

        fs.readdirSync('./' + templateFolder).forEach(file => {
            inits.push(require('../' + templateFolder + file)); // '../device-types/deeplens-v1.0.json'
        });

        console.log('Loaded:', inits);

        let params = {
            RequestItems: {}
        };
        params.RequestItems[TABLE] = [];
        inits.forEach(dti => {
            params.RequestItems[TABLE].push({
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
