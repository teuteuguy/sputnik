const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'deleteSolution';

module.exports = function (event, context) {

    return documentClient.delete({
        TableName: process.env.TABLE_SOLUTIONS,
        Key: {
            id: event.id
        }
    }).promise();

};
