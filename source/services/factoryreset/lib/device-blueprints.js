const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const addCreatedAtUpdatedAt = require('./add-created-at-updated-at');

const deviceBlueprintsInits = [
    require('../device-blueprints/gg-deeplens-v1.0-factory-reset-v1.0.json'),
    require('../device-blueprints/gg-factory-reset-v1.0.json')
];

class DeviceBlueprints {

    constructor() {}

    factoryReset(event, context, callback) {
        let params = {
            RequestItems: {}
        };
        params.RequestItems[process.env.TABLE_DEVICE_BLUEPRINTS] = [];
        deviceBlueprintsInits.forEach(b => {
            params.RequestItems[process.env.TABLE_DEVICE_BLUEPRINTS].push({
                PutRequest: {
                    Item: addCreatedAtUpdatedAt(b)
                }
            });
        });

        documentClient.batchWrite(params).promise().then(data => {
            console.log('Batch write Device Blueprints Result', data);
            callback(null, true);
        }).catch(err => {
            callback('Error: ' + JSON.stringify(err), null);
        });

    }
}

module.exports = DeviceBlueprints;
