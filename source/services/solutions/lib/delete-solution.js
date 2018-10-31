const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const MTMThingGroups = require('mythings-mgmt-custom-resource-helper-thing-groups');
const DevicesLibs = require('mythings-mgmt-devices-service');

const lib = 'deleteSolution';

module.exports = function (event, context) {

    return documentClient
        .get({
            TableName: process.env.TABLE_SOLUTIONS,
            Key: {
                id: event.id
            }
        })
        .promise().then(solution => {
            event.solution = solution.Item;
            // To delete:
            // - Delete Solution
            // - Delete Device
            // - Delete thingGroup
            const mtmThingGroups = new MTMThingGroups();
            return mtmThingGroups.deleteThingGroup(event.solution.name);

        }).then(result => {

            console.log('Deleted ThingGroup:', event.solution.thingGroupName);

            return Promise.all(event.solution.thingIds.map(id => {
                return DevicesLibs.deleteDevice({
                    thingId: id
                }).then(result => result).catch(err => {
                    if (err.error === 404) {
                        return null;
                    } else {
                        throw err;
                    }
                });
            }));

        }).then(result => {

            console.log('Deleted Devices:', event.solution.thingIds);

            return documentClient.delete({
                TableName: process.env.TABLE_SOLUTIONS,
                Key: {
                    id: event.id
                }
            }).promise();

        }).then(result => {
            console.log('Deleted Solution:', event.id);
            return event.solution;
        });


            // TODO: implement this
        //     if (solution.Item) {
        //         console.log('Solution:', solution);
        //         const iotParams = {
        //             thingName: solution.Item.thingName
        //         };
        //         const ddbParams = {
        //             TableName: process.env.TABLE_DEVICES,
        //             Key: {
        //                 thingId: event.thingId
        //             }
        //         };
        //         return Promise.all([
        //             solution.Item,
        //             documentClient.delete(ddbParams).promise(),
        //             iot.deleteThing(iotParams).promise()
        //         ]);
        //     } else {
        //         throw 'Device ' + event.thingId + ' does not exist.';
        //     }
        // })
        // .then(results => {
        //     const oldDevice = results[0];
        //     console.log(oldDevice);
        //     callback(null, oldDevice);

};
