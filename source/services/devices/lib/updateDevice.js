const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'updateDevice';

module.exports = function (event, context) {

    // Note: in order to be consistent with the rest of the Appsync API, event.spec is a stringified json object!

    // Event needs to be:
    // event.deviceTypeId
    // event.deviceBlueprintId
    // event.spec
    // event.thingName
    // event.generateCert

};
