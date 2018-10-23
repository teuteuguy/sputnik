const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const MTMThingGroups = require('mythings-mgmt-custom-resource-helper-thing-groups');

const lib = 'addSolution';

module.exports = function (event, context, callback) {
    if (event.cmd !== lib) {
        return callback('Wrong cmd for lib. Should be ' + lib + ', got event: ' + event, null);
    }

    // First check a group with that name does not already exist. If so, exit.
    // Second let's create the group.
    // Third let's create the solution in the DB to reference the Group as well as the Blueprint.

    iot.describeThingGroup({
        thingGroupName: event.thingGroupName
    }).promise().then(group => {
        // Group already exists.
        console.log('thingGroup already exists, exiting call');
        callback('ERROR: thingGroup already exists', null);
    }).catch(err => {
        // Group does not exist, lets create it.

        const mtmGroups = new MTMThingGroups();

        return mtmGroups.createThingGroup(event.name, event.description).then(group => {

            return documentClient
                .put({
                    TableName: process.env.TABLE_SOLUTIONS,
                    Item: {
                        id: group.thingGroupId,
                        name: event.name,
                        description: event.description,
                        thingIds: event.thingIds || [],
                        solutionBlueprintId: event.solutionBlueprintId,
                        createdAt: moment()
                            .utc()
                            .format(),
                        updatedAt: moment()
                            .utc()
                            .format()
                    },
                    ReturnValues: 'ALL_OLD'
                })
                .promise();

        }).then(result => {
            console.log('Created solution', result);
            callback(null, result);
        }).catch(err => {
            console.log('Error', err);
            callback(err, null);
        })
    });


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
