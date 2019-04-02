const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const moment = require('moment');
const _ = require('underscore');

// const listGreengrassGroupIdsForThingArn = require('sputnik-custom-resource-helper-utils').listGreengrassGroupIdsForThingArn;
const listPrincipalThingsDetailed = require('./lib/list-principal-things-detailed');
const addDevice = require('sputnik-devices-service').addDevice;

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
                // TODO: this is actually the scenario where CERT is valid, but Thing isn't created yet. Good use case... Fix this !
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

                                console.log('Found device:', _device, 'for thindId', thing.thingId);
                                console.log('Check if the new timestamp is after existing one');

                                let newMomentTimestamp = moment(event.timestamp);
                                if (_device.hasOwnProperty('connectionState') && _device.connectionState.hasOwnProperty('at')) {
                                    let oldMomentTimestamp = moment(_device.connectionState.at);
                                    if (oldMomentTimestamp.isAfter(newMomentTimestamp)) {
                                        console.log('Skip update because MQTT messages are swapped');
                                        console.log('oldMomentTimestamp:', oldMomentTimestamp.utc().format());
                                        console.log('newMomentTimestamp:', newMomentTimestamp.utc().format());
                                        return _device;
                                    }
                                }

                                console.log(event.principalIdentifier, event.eventType);

                                let connectionState = {
                                    certificateId: _cert.certificateDescription.certificateId,
                                    certificateArn: _cert.certificateDescription.certificateArn,
                                    state: event.eventType,
                                    at: newMomentTimestamp.utc().format()
                                };

                                let updateParams = {
                                    TableName: process.env.TABLE_DEVICES,
                                    Key: {
                                        thingId: thing.thingId
                                    },
                                    UpdateExpression: 'set #ua = :ua, #cS = :cS',
                                    ExpressionAttributeNames: {
                                        '#ua': 'updatedAt',
                                        '#cS': 'connectionState'
                                    },
                                    ExpressionAttributeValues: {
                                        ':ua': moment()
                                            .utc()
                                            .format(),
                                        ':cS': connectionState
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
                                        updateParams.UpdateExpression += ', #c = :c';
                                        updateParams.ExpressionAttributeNames['#c'] = 'cert';
                                        updateParams.ExpressionAttributeValues[':c'] = {
                                            certificateId: _cert.certificateDescription.certificateId,
                                            certificateArn: _cert.certificateDescription.certificateArn,
                                            url: '',
                                            at: '2000-01-01T00:00:00Z'
                                        };
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
            console.log('ERROR', err, err.stack); // an error occurred
            callback(null, null);
        });

}

exports.handler = handler;
