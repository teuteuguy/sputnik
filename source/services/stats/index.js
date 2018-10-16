const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();


function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    switch (event.stat) {
        case 'getTotalDeviceTypes':
            dynamodb.describeTable({
                TableName: process.env.TABLE_DEVICE_TYPES
            }).promise().then(data => {
                // console.log(data);
                callback(null, {
                    stat: event.stat,
                    value: data.Table.ItemCount
                });
            }).catch(err => {
                callback('Error: ' + JSON.stringify(err), null);
            });
            break;
        default:
            callback('Unknown stat, unable to resolve for arguments: ' + event, null);
            break;
    }
}

exports.handler = handler;
