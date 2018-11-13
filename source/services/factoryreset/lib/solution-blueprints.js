const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const addCreatedAtUpdatedAt = require('./add-created-at-updated-at');

const fs = require('fs');
const templateFolder = 'solution-blueprints/';
const TABLE = process.env.TABLE_SOLUTION_BLUEPRINTS;

class SolutionBlueprints {

    constructor() {}

    factoryReset(event, context, callback) {

        let inits = [];

        fs.readdirSync('./' + templateFolder).forEach(file => {
            inits.push(require('../' + templateFolder + file));
        });

        console.log('Loaded:', inits);

        let params = {
            RequestItems: {}
        };
        params.RequestItems[TABLE] = [];
        inits.forEach(i => {
            params.RequestItems[TABLE].push({
                PutRequest: {
                    Item: addCreatedAtUpdatedAt(i)
                }
            });
        });

        documentClient.batchWrite(params).promise().then(data => {
            console.log('Batch write Result', data);
            callback(null, true);
        }).catch(err => {
            callback('Error: ' + JSON.stringify(err), null);
        });

    }
}

module.exports = SolutionBlueprints;
