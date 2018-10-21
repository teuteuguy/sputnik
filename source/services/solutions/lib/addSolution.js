const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'addDevice';

module.exports = function(event, context, callback) {
    if (event.cmd !== lib) {
        return callback('Wrong cmd for lib. Should be ' + lib + ', got event: ' + event, null);
    }

    // // TODO: deal with creating a greengrass group if required.
    // // TODO: deal with certificates!

    // iot.createThing({
    //     thingName: event.thingName
    // })
    //     .promise()
    //     .then(thing => {
    //         return Promise.all([
    //             thing,
    //             documentClient
    //                 .get({
    //                     TableName: process.env.TABLE_DEVICES,
    //                     Key: {
    //                         thingId: thing.thingId
    //                     }
    //                 })
    //                 .promise()
    //         ]);
    //     })
    //     .then(results => {
    //         const thing = results[0];
    //         const result = results[1];

    //         if (result.Item) {
    //             // Thing already in our DB
    //             throw 'Thing is already in the DB';
    //         } else {
    //             const params = {
    //                 thingId: thing.thingId,
    //                 thingName: event.thingName,
    //                 thingArn: thing.thingArn,
    //                 name: event.thingName,
    //                 deviceTypeId: 'UNKNOWN',
    //                 deviceBlueprintId: 'UNKNOWN',
    //                 connectionState: {
    //                     // TODO: probably generate the certs here at one point.
    //                     certificateId: 'NOTSET',
    //                     certificateArn: 'NOTSET',
    //                     state: 'created',
    //                     at: moment()
    //                         .utc()
    //                         .format()
    //                 },
    //                 greengrassGroupId: 'NOT_A_GREENGRASS_DEVICE',
    //                 lastDeploymentId: 'UNKNOWN',
    //                 createdAt: moment()
    //                     .utc()
    //                     .format(),
    //                 updatedAt: moment()
    //                     .utc()
    //                     .format()
    //             };
    //             return Promise.all([params, documentClient
    //                 .put({
    //                     TableName: process.env.TABLE_DEVICES,
    //                     Item: params,
    //                     ReturnValues: 'ALL_OLD'
    //                 })
    //                 .promise()
    //             ]);
    //         }
    //     })
    //     .then(results => {
    //         const newThing = results[0];
    //         console.log(newThing);
    //         callback(null, newThing);
    //     })
    //     .catch(err => {
    //         callback(err, null);
    //     });

    // getDeviceStatsRecursive().then(stats => {
    //     callback(null, stats);
    // }).catch(err => {
    //     callback(err, null);
    // });
};
