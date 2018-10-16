const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const addCreatedAtUpdatedAt = require('../lib/addCreatedAtUpdatedAt');

const settingsInits = [
    require('../settings/app-config.json'),
    require('../settings/services.json')
];

class Settings {

    constructor() {}

    factoryReset(event, context, callback) {
        let params = {
            RequestItems: {}
        };
        params.RequestItems[process.env.TABLE_SETTINGS] = [];
        settingsInits.forEach(s => {
            params.RequestItems[process.env.TABLE_SETTINGS].push({
                PutRequest: {
                    Item: addCreatedAtUpdatedAt(s)
                }
            });
        });

        documentClient.batchWrite(params).promise().then(data => {
            console.log('Batch write Settings Result', data);
            callback(null, true);
        }).catch(err => {
            callback('Error: ' + JSON.stringify(err), null);
        });

    }
}

module.exports = Settings;
