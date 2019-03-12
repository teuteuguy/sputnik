const AWS = require('aws-sdk');
const iot = new AWS.Iot();
// const iotdata = new AWS.IotData();
const documentClient = new AWS.DynamoDB.DocumentClient();
const gg = new AWS.Greengrass();
const moment = require('moment');
const _ = require('underscore');
const uuid = require('uuid');

const lib = 'addAddon';

module.exports = function (event, context) {

    return true;

};
