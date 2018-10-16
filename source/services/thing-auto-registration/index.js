const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const moment = require('moment');

const iot = new AWS.Iot();
const _ = require('underscore');

const listPrincipalThingsDetailed = require('./lib/listPrincipalThingsDetailed');

// TODO: Move the actual rule action to SQS so as to separate the calls and buffer via SQS.
// TODO: The principal will refer to a cert. But this does not actually refer to the thing.
//          We can assume the thing via it's attachement to the cert, but we need to combine it with the client id.

function describeThingsForPrincipal(principal) {
    return iot.describeCertificate({
        certificateId: principal
    }).promise().then(cert => {

        // Get the things attached to the cert
        return iot.listPrincipalThings({
            principal: cert.certificateDescription.certificateArn,
            maxResults: 10
        }).promise();

    }).then(things => {
        things = things.things;

        return Promise.all(
            things.map(thing => {
                return iot.describeThing({
                    thingName: thing
                }).promise();
            })
        );

    }).then(things => {
        console.log('describeThingsForPrincipal: Found and Described: ' + things.length + ' things for the principal: ' + principal);
        things.forEach(t => console.log('    - thingName: ' + t.thingName + ' (' + t.thingId + ')'));
        return things;
    });
}

// {
//     "clientId": "iotconsole-1539277498927-0",
//     "timestamp": 1539277500864,
//     "eventType": "connected",
//     "sessionIdentifier": "9c1ce4ca-c79c-4561-89f6-dc57a574ebf3",
//     "principalIdentifier": "c997d377eec157293d10e4f0a75445eba59533ad9a2b802ffc217f55179c599b"
// }
function handler(event, context, callback) {

    console.log('Event:', JSON.stringify(event, null, 2));

    // Get the certificate for the principal
    let _things;
    let _cert;
    iot.describeCertificate({
        certificateId: principal
    }).promise().then(cert => {
        _cert = cert;
        return listPrincipalThingsDetailed(cert.certificateDescription.certificateArn);
    }).catch(err => {
        console.log(err, err.stack); // an error occurred
        callback(null, null);
    });



    describeThingsForPrincipal(event.principalIdentifier).then(things => {
        _things = things;
        return documentClient.get({
            TableName: process.env.TABLE_SETTINGS,
            Key: {
                id: 'services'
            }
        }).promise();
    }).then(setting => {

        return Promise.all(_things.map(thing => {
            if (setting.Item.setting.autoRegistration === true) {
                // Check if the thing already exists in our DB
                console.log('Getting device:', thing.thingId);
                return documentClient.get({
                    TableName: process.env.TABLE_DEVICES,
                    Key: {
                        thingId: thing.thingId
                    }
                }).promise().then(result => {
                    console.log('Got device:', result);

                    if (result.Item) {
                        console.log('Device already in DB');
                        return documentClient.update({
                            TableName: process.env.TABLE_DEVICES,
                            Key: {
                                thingId: thing.thingId
                            },
                            UpdateExpression: 'set #ua = :ua, #cs = :cs',
                            ExpressionAttributeNames: {
                                '#ua': 'updatedAt',
                                '#cs': 'connectionState'
                            },
                            ExpressionAttributeValues: {
                                ':ua': moment().utc().format(),
                                ':cs': {
                                    state: event.eventType,
                                    at: moment().utc().format()
                                }
                            }
                        }).promise();
                    } else {
                        console.log('Device not in DB');
                        return documentClient.put({
                            TableName: process.env.TABLE_DEVICES,
                            Item: {
                                thingId: thing.thingId,
                                thingName: thing.thingName,
                                thingArn: thing.thingArn,
                                name: thing.thingName,
                                deviceTypeId: 'UNKNOWN',
                                blueprintId: 'UNKNOWN',
                                connectionState: {
                                    state: event.eventType,
                                    at: moment().utc().format()
                                },
                                createdAt: moment().utc().format(),
                                updatedAt: moment().utc().format()
                            }
                        }).promise();
                    }
                });
            } else {
                console.log('Auto registration is OFF');
                return false;
            }
        }));
    }).then(results => {
        console.log('Done with', results);
        callback(null, null);
    }).catch(err => {
        console.log(err, err.stack); // an error occurred
        callback(null, null);
    });


    // // let _things = null;
    // // let _foundThings = null;
    // // console.log('Prep:');
    // return Promise.all([
    //     describeThingsForPrincipal(event.principalIdentifier).then(things => _things = things)
    // ]).then(results => {

    //     console.log('Checking if the things are already being tracked by My Things Management?');

    //     return mtmThingGroups.addThingToThingGroup()

    //     return Promise.all(_things.map(thing => {
    //         return iot.listThingGroupsForThing({
    //             thingName: thing.thingName
    //         }).promise().then(thingGroupsForThing => {
    //             const thingGroups = thingGroupsForThing.thingGroups.map(thingGroup => thingGroup.groupName);
    //             console.log(thing.thingName, 'is in:', ...thingGroups);
    //             if (_.findIndex(thingGroups, (group) => (group === GROUP_NAMES.MTM_NON_MANAGED || group === GROUP_NAMES.MTM_NON_MANAGED)) === -1) {
    //                 console.log(thing.thingName, 'is NOT yet managed');
    //                 return Promise.all([iot.describeThingGroup({
    //                     thingGroupName: GROUP_NAMES.MTM_NON_MANAGED
    //                 }).promise(), iot.addThingToThingGroup({
    //                     thingName: thing.thingName,
    //                     thingGroupName: GROUP_NAMES.MTM_NON_MANAGED
    //                 }).promise()]).then(results => {
    //                     const nbDevices = parseInt(results[0].thingGroupProperties.attributePayload.attributes.nbDevices);
    //                     return iot.updateThingGroup({
    //                         thingGroupName: GROUP_NAMES.MTM_NON_MANAGED,
    //                         thingGroupProperties: {
    //                             attributePayload: {
    //                                 attributes: {
    //                                     'nbDevices': '' + (nbDevices + 1)
    //                                 }
    //                             }
    //                         }
    //                     }).promise();
    //                 });
    //             } else {
    //                 console.log(thing.thingName, 'is already managed');
    //                 return;
    //             }
    //         });
    //     }));

    // }).then(results => {
    //     console.log('Done with', results);
    //     callback(null, null);
    // }).catch(err => {
    //     console.log(err, err.stack); // an error occurred
    //     callback(null, null);
    // });
}

exports.handler = handler;
