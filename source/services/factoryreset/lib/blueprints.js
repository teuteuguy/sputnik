const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const addCreatedAtUpdatedAt = require('../lib/addCreatedAtUpdatedAt');

const blueprintsInits = [
    require('../blueprints/gg-deeplens-v1.0-factory-reset-v1.0.json'),
    require('../blueprints/gg-factory-reset-v1.0.json')
];

class Blueprints {

    constructor() {}

    factoryReset(event, context, callback) {
        let params = {
            RequestItems: {}
        };
        params.RequestItems[process.env.TABLE_BLUEPRINTS] = [];
        blueprintsInits.forEach(b => {
            params.RequestItems[process.env.TABLE_BLUEPRINTS].push({
                PutRequest: {
                    Item: addCreatedAtUpdatedAt(b)
                }
            });
        });

        documentClient.batchWrite(params).promise().then(data => {
            console.log('Batch write Blueprints Result', data);
            callback(null, true);
        }).catch(err => {
            callback('Error: ' + JSON.stringify(err), null);
        });

    }
}

module.exports = Blueprints;
