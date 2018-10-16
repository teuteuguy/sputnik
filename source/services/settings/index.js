const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const dynamodb = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();


function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    switch (event.cmd) {
        case 'getThingAutoRegistrationState':
            iot.getTopicRule({
                ruleName: process.env.IOT_THING_GROUP_AUTO_REGISTRATION_TOPIC_RULE
            }).promise().then(data => {
                console.log(data);
                callback(null, !data.rule.ruleDisabled);
            }).catch(err => {
                callback('Error getting the topic rule ' + process.env.IOT_THING_GROUP_AUTO_REGISTRATION_TOPIC_RULE + ' : ' + err, null);
            });
            break;
        case 'setThingAutoRegistrationState':
            console.log('setThingAutoRegistrationState called, with enabled =', event.enabled);
            const params = {
                ruleName: process.env.IOT_THING_GROUP_AUTO_REGISTRATION_TOPIC_RULE
            };
            let promise = null;
            if (event.enabled === false) {
                promise = iot.disableTopicRule(params).promise();
            } else if (event.enabled === true) {
                promise = iot.enableTopicRule(params).promise();
            } else {
                callback('wrong parameters ' + event, null);
                break;
            }
            promise.then(data => {
                event.cmd = 'getThingAutoRegistrationState';
                return handler(event, context, callback);
            }).catch(err => {
                callback('Error enabling/disabling the topic rule ' + process.env.IOT_THING_GROUP_AUTO_REGISTRATION_TOPIC_RULE + ' : ' + err, null);
            });
            break;
        default:
            callback('Unknown cmd, unable to resolve for arguments: ' + event, null);
            break;
    }
}

exports.handler = handler;
