const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const moment = require('moment');
const _ = require('underscore');

// const listGreengrassGroupIdsForThingArn = require('mythings-mgmt-custom-resource-helper-utils').listGreengrassGroupIdsForThingArn;
const listPrincipalThingsDetailed = require('./lib/list-principal-things-detailed');
const addDevice = require('mythings-mgmt-devices-service').addDevice;

// TODO: Move the actual rule action to SQS so as to separate the calls and buffer via SQS.
// TODO: The principal will refer to a cert. But this does not actually refer to the thing.
//          We can assume the thing via it's attachement to the cert, but we need to combine it with the client id.
// TODO: Try to re-use the addDevice service ?
// TODO: remove the auto-registration part cause not convinced this is a good idea actually given provisioning via solutions

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
    let _settings;
    let _device;

    console.log('First describe the certificate for the incoming principal.');
    iot.describeCertificate({
            certificateId: event.principalIdentifier
        }).promise().then(cert => _cert = cert)
        .then(cert => {
            console.log('Found certificate:', _cert);
            console.log('Second, find all the things attached to the given cert.');

            return listPrincipalThingsDetailed(_cert.certificateDescription.certificateArn).then(results => _things = results);
        }).then(things => {
            if (_things === false) {
                return false;
            } else {

                console.log('Found', _things.length, 'things.');

                console.log('Third, lets update each device in our database to capture the certificate status.');

                return Promise.all(
                    _things.map(thing => {

                        // Check if the thing already exists in our DB
                        console.log('Is device', thing.thingId, 'in our DB?');

                        return documentClient
                            .get({
                                TableName: process.env.TABLE_DEVICES,
                                Key: {
                                    thingId: thing.thingId
                                }
                            })
                            .promise().then(device => {
                                _device = device.Item;

                                //     console.log('Check if the device is a Greengrass device?');
                                //     return listGreengrassGroupIdsForThingArn(thing.thingArn);
                                // }).then(groupIds => {

                                console.log('Found device:', _device, 'for thindId', thing.thingId);

                                let updateParams = {
                                    TableName: process.env.TABLE_DEVICES,
                                    Key: {
                                        thingId: thing.thingId
                                    },
                                    UpdateExpression: 'set #ua = :ua, #c = :c',
                                    ExpressionAttributeNames: {
                                        '#ua': 'updatedAt',
                                        '#c': 'connectionState'
                                    },
                                    ExpressionAttributeValues: {
                                        ':ua': moment()
                                            .utc()
                                            .format(),
                                        ':c': {
                                            certificateId: _cert.certificateDescription.certificateId,
                                            certificateArn: _cert.certificateDescription.certificateArn,
                                            state: event.eventType,
                                            at: moment().utc().format()
                                        }
                                    }
                                };

                                if (_device) {
                                    console.log('Lets update it.');
                                    return documentClient.update(updateParams).promise();
                                } else {
                                    console.log('Lets create it');

                                    return addDevice({
                                        deviceTypeId: 'UNKNOWN',
                                        deviceBlueprintId: 'UNKNOWN',
                                        spec: {},
                                        thingName: thing.thingName,
                                        generateCert: false
                                    }).then(device => {
                                        return documentClient.update(updateParams).promise();
                                    });
                                }

                            }).then(device => {
                                console.log('Device created or updated:', device);
                                return device;
                            });
                    }));
            }
        }).then(results => {
            callback(null, null);
        })
        .catch(err => {
            console.log(err, err.stack); // an error occurred
            callback(null, null);
        });



    // Promise.all([
    //     documentClient.get({
    //         TableName: process.env.TABLE_SETTINGS,
    //         Key: {
    //             id: 'services'
    //         }
    //     })
    //     .promise().then(result => _settings = result.Item),
    //     iot.describeCertificate({
    //         certificateId: event.principalIdentifier
    //     }).promise().then(result => _cert = result)
    // ]).then(results => {

    //     if (_settings.setting.autoRegistration === false) {
    //         console.log('Auto registration is turned off. Exiting.');
    //         return false;
    //     } else {
    //         console.log('Found certificate:', _cert);
    //         console.log('Second, find all the things attached to the given cert.');

    //         return listPrincipalThingsDetailed(_cert.certificateDescription.certificateArn).then(results => _things = results);
    //     }
    // }).then(things => {
    //     if (_things === false) {
    //         return false;
    //     } else {

    //         console.log('Found', _things.length, 'things.');
    //         console.log('Third, lets update each device in our database to capture the certificate status.');

    //         return Promise.all(
    //             _things.map(thing => {

    //                 // Check if the thing already exists in our DB
    //                 console.log('Is device', thing.thingId, 'in our DB?');

    //                 let _device;

    //                 return documentClient
    //                     .get({
    //                         TableName: process.env.TABLE_DEVICES,
    //                         Key: {
    //                             thingId: thing.thingId
    //                         }
    //                     })
    //                     .promise().then(device => {
    //                         _device = device;

    //                         console.log('Check if the device is a Greengrass device?');
    //                         return listGreengrassGroupIdsForThingArn(thing.thingArn);
    //                     }).then(groupIds => {

    //                         console.log('Found device:', _device, 'for thindId', thing.thingId);
    //                         console.log('Found groupIds:', groupIds, 'for thingArn', thing.thingArn);

    //                         if (_device.Item) {
    //                             console.log('Lets update it.');
    //                             let updateParams = {
    //                                 TableName: process.env.TABLE_DEVICES,
    //                                 Key: {
    //                                     thingId: thing.thingId
    //                                 },
    //                                 UpdateExpression: 'set #ua = :ua, #c = :c',
    //                                 ExpressionAttributeNames: {
    //                                     '#ua': 'updatedAt',
    //                                     '#c': 'connectionState'
    //                                 },
    //                                 ExpressionAttributeValues: {
    //                                     ':ua': moment()
    //                                         .utc()
    //                                         .format(),
    //                                     ':c': {
    //                                         certificateId: _cert.certificateDescription.certificateId,
    //                                         certificateArn: _cert.certificateDescription.certificateArn,
    //                                         state: event.eventType,
    //                                         at: moment().utc().format()
    //                                     }
    //                                 }
    //                             };
    //                             if (groupIds.length !== 0) {
    //                                 console.log('Thing', thing.thingName, 'is a greengrass device.');
    //                                 // updateParams.UpdateExpression += ', greengrassGroupId = ' + groupIds[0];
    //                                 updateParams.UpdateExpression += ', #ggId = :ggId';
    //                                 updateParams.ExpressionAttributeNames['#ggId'] = 'greengrassGroupId';
    //                                 updateParams.ExpressionAttributeValues[':ggId'] = groupIds[0];
    //                             } else {
    //                                 console.log('Thing', thing.thingName, 'is NOT a greengrass device.');
    //                                 // updateParams.UpdateExpression += ", greengrassGroupId = 'NOT_A_GREENGRASS_DEVICE'";
    //                                 updateParams.UpdateExpression += ', #ggId = :ggId';
    //                                 updateParams.ExpressionAttributeNames['#ggId'] = 'greengrassGroupId';
    //                                 updateParams.ExpressionAttributeValues[':ggId'] = 'NOT_A_GREENGRASS_DEVICE';
    //                             }
    //                             return documentClient.update(updateParams).promise();
    //                         } else {
    //                             console.log('Lets create it');
    //                             let createParams = {
    //                                 TableName: process.env.TABLE_DEVICES,
    //                                 Item: {
    //                                     thingId: thing.thingId,
    //                                     thingName: thing.thingName,
    //                                     thingArn: thing.thingArn,
    //                                     name: thing.thingName,
    //                                     type: 'UNKNOWN',
    //                                     deviceTypeId: 'UNKNOWN',
    //                                     deviceBlueprintId: 'UNKNOWN',
    //                                     connectionState: {
    //                                         certificateId: _cert.certificateDescription.certificateId,
    //                                         certificateArn: _cert.certificateDescription.certificateArn,
    //                                         state: event.eventType,
    //                                         at: moment().utc().format()
    //                                     },
    //                                     lastDeploymentId: 'UNKNOWN',
    //                                     createdAt: moment()
    //                                         .utc()
    //                                         .format(),
    //                                     updatedAt: moment()
    //                                         .utc()
    //                                         .format()
    //                                 }
    //                             };
    //                             if (groupIds.length !== 0) {
    //                                 console.log('Thing', thing.thingName, 'is a greengrass device.');
    //                                 createParams.greengrassGroupId = groupIds[0];
    //                             } else {
    //                                 console.log('Thing', thing.thingName, 'is NOT a greengrass device.');
    //                                 createParams.greengrassGroupId = 'NOT_A_GREENGRASS_DEVICE';
    //                             }

    //                             return documentClient.put(createParams).promise();
    //                         }

    //                     }).then(device => {
    //                         console.log('Device created or updated:', device);
    //                         return device;
    //                     });
    //             }));
    //     }
    // }).then(results => {
    //     callback(null, null);
    // }).catch(err => {
    //     console.log(err, err.stack); // an error occurred
    //     callback(null, null);
    // });
}

exports.handler = handler;
