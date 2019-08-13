const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const forge = require('node-forge');

const moment = require('moment');
const _ = require('underscore');

const lib = 'justInTimeOnBoarding';

const addDevice = require('sputnik-devices-service').addDevice;

// {
//     "clientId": "iotconsole-1539277498927-0",
//     "timestamp": 1539277500864,
//     "eventType": "connected",
//     "sessionIdentifier": "9c1ce4ca-c79c-4561-89f6-dc57a574ebf3",
//     "principalIdentifier": "c997d377eec157293d10e4f0a75445eba59533ad9a2b802ffc217f55179c599b"
// }
function handler(event, context, callback) {
    const tag = `${lib}(${event.clientId}):`;
    console.log(tag, 'Event:', JSON.stringify(event, null, 2));

    // Get the certificate for the principal
    let _cert;
    let _thingName;
    let _device;

    console.log(tag, 'First describe the certificate for the incoming principal.');
    iot.describeCertificate({
        certificateId: event.principalIdentifier
    })
        .promise()
        .then(cert => {
            _cert = cert;
            console.log(tag, 'Found certificate:', _cert);
            console.log(tag, 'Lets check if its a Sputnik cert?');

            let forgeCert = forge.pki.certificateFromPem(_cert.certificateDescription.certificatePem);
            if (
                forgeCert.subject &&
                forgeCert.subject.getField('O') &&
                forgeCert.subject.getField('O').value == 'sputnik' &&
                forgeCert.subject.getField('CN') &&
                forgeCert.subject.getField('CN').value
            ) {
                // Cert seems to be a sputnik issued cert.
                console.log(tag, 'Cert seems to be a sputnik cert:', forgeCert.subject);
                return forgeCert.subject.getField('CN').value;
            } else {
                // Cert is not a sputnik issues cert. ThingName and Device could be anything, as this device could be outside of Sputnik management for now.
                // Lets pick it up.
                // Note: we will only manage 1 thing attached to a cert. More than one will require redundancy.
                console.log(tag, 'Cert does not seem to be a sputnik cert:', forgeCert.subject);
                return iot
                    .listPrincipalThings({
                        principal: _cert.certificateDescription.certificateArn,
                        maxResults: 1
                    })
                    .promise()
                    .then(data => {
                        if (data.things.length === 0) {
                            return `sputnik-${shortid.generate()}`;
                        } else {
                            return data.things[0];
                        }
                    });
            }
        })
        .then(thingName => {
            _thingName = thingName;

            console.log(tag, 'ThingName:', _thingName);

            return iot
                .describeThing({
                    thingName: _thingName
                })
                .promise()
                .then(thing => {
                    // Thing exists. Let's fetch the Device
                    console.log(tag, _thingName, 'exists. Fetching Device.');
                    return documentClient
                        .get({
                            TableName: process.env.TABLE_DEVICES,
                            Key: {
                                thingId: thing.thingId
                            }
                        })
                        .promise().then(device => {
                            if (!device.Item) {
                                throw 'Device does not exist. Create it';
                            } else {
                                return device;
                            }
                        });
                })
                .catch(err => {
                    // Thing DOES NOT exist => This is the first connection for this cert.
                    // Let's On-Board it into sputnik (Create Device, Create Thing, attach first policy)
                    console.log(tag, _thingName, 'doesnt exist. Create it with Device');
                    return addDevice({
                        deviceTypeId: 'UNKNOWN',
                        deviceBlueprintId: 'UNKNOWN',
                        thingName: _thingName,
                        name: _thingName
                    }).then(r => {
                        return {
                            Item: r
                        };
                    });
                });
        })
        .then(device => {
            _device = device.Item;

            console.log(tag, 'Device:', _device);

            let newMomentTimestamp = moment(event.timestamp);
            let connectionState = {
                certificateId: _cert.certificateDescription.certificateId,
                certificateArn: _cert.certificateDescription.certificateArn,
                state: event.eventType,
                at: newMomentTimestamp.utc().format()
            };
            let updateParams = {
                TableName: process.env.TABLE_DEVICES,
                Key: {
                    thingId: _device.thingId
                },
                UpdateExpression: 'set #ua = :ua, #certArn = :certArn, #cS = :cS',
                ExpressionAttributeNames: {
                    '#ua': 'updatedAt',
                    '#certArn': 'certificateArn',
                    '#cS': 'connectionState'
                },
                ExpressionAttributeValues: {
                    ':ua': moment()
                        .utc()
                        .format(),
                    ':certArn': _cert.certificateDescription.certificateArn,
                    ':cS': connectionState
                }
            };

            console.log(tag, 'Check if the event timestamp is after existing one');

            if (_device && _device.hasOwnProperty('connectionState') && _device.connectionState.hasOwnProperty('at')) {
                let oldMomentTimestamp = moment(_device.connectionState.at);
                if (oldMomentTimestamp.isAfter(newMomentTimestamp)) {
                    console.log(tag, 'Skip update because MQTT messages are swapped');
                    console.log(tag, 'oldMomentTimestamp:', oldMomentTimestamp.utc().format());
                    console.log(tag, 'newMomentTimestamp:', newMomentTimestamp.utc().format());
                    return _device;
                }
            }

            return documentClient.update(updateParams).promise();
        })
        .then(result => {
            callback(null, null);
        })
        .catch(err => {
            console.log('ERROR', err, err.stack); // an error occurred
            callback(null, null);
        });
}

exports.handler = handler;
