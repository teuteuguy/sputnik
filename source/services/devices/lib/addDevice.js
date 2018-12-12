const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');
const UsageMetrics = require('usage-metrics');

const lib = 'addDevice';

module.exports = function (event, context) {

    const usageMetrics = new UsageMetrics();

    const tag = `addDevice(${event.thingName}):`;

    console.log(tag, 'start');

    // Event needs to be:
    // event.deviceTypeId
    // event.deviceBlueprintId
    // event.spec
    // event.thingName
    // event.generateCert

    // TODO: deal with creating a greengrass group if required.

    return iot.describeThing({
            thingName: event.thingName
        }).promise().then(thing => {
            return thing;
        })
        .catch(err => {
            return iot.createThing({
                thingName: event.thingName
            }).promise();
        })
        .then(thing => {

            console.log(tag, 'thing:', thing);

            // Create thing returns
            // {
            //     "thingArn": "arn:aws:iot:us-east-1:accountnumber:thing/toto",
            //     "thingName": "toto",
            //     "thingId": "ef17a1237-eb50-4d64-a359-df4894ba90a0"
            // }

            event.thing = thing;

            // Check if thing already exists
            return documentClient
                .get({
                    TableName: process.env.TABLE_DEVICES,
                    Key: {
                        thingId: event.thing.thingId
                    }
                })
                .promise();
        })
        .then(result => {

            if (!event.spec) {
                event.spec = {};
            }

            if (result.Item) {
                console.log(tag, 'thing is already in the DB. Exiting');
                // Thing already in our DB
                throw 'Thing is already in the DB';
            } else {

                return usageMetrics.checkAndSend({
                    Data: {
                        NewDevice: moment().utc().format()
                    }
                }).then(res => {

                    // Lets prepare. Lets check what type of device we are trying to provision :)

                    if (event.deviceTypeId !== null && event.deviceTypeId !== undefined && event.deviceTypeId !== 'UNKNOWN') {
                        return documentClient.get({
                            TableName: process.env.TABLE_DEVICE_TYPES,
                            Key: {
                                id: event.deviceTypeId
                            }
                        }).promise().then(deviceType => {
                            if (!deviceType.Item) {
                                event.deviceTypeId = 'UNKNOWN';
                                return 'NOT_A_GREENGRASS_DEVICE';
                            } else {
                                if (deviceType.Item.type !== 'GREENGRASS') {
                                    return 'NOT_A_GREENGRASS_DEVICE';
                                } else {
                                    // Device is a Greengrass device => create the greengrass group!
                                    return gg.createGroup({
                                        Name: event.thingName + '-gg-group'
                                    }).promise().then(group => {
                                        return group.Id;
                                    });
                                }
                            }
                        });
                    } else {
                        return 'NOT_A_GREENGRASS_DEVICE';
                    }

                });
            }
        }).then(greengrassGroupId => {

            console.log(tag, 'greengrassGroupId:', greengrassGroupId);

            let params = {
                thingId: event.thing.thingId,
                thingName: event.thing.thingName,
                thingArn: event.thing.thingArn,
                name: event.thing.thingName,
                deviceTypeId: event.deviceTypeId || 'UNKNOWN',
                deviceBlueprintId: event.deviceBlueprintId || 'UNKNOWN',
                greengrassGroupId: greengrassGroupId,
                spec: event.spec,
                lastDeploymentId: 'UNKNOWN',
                createdAt: moment()
                    .utc()
                    .format(),
                updatedAt: moment()
                    .utc()
                    .format(),
                connectionState: {
                    certificateId: 'NOTSET',
                    certificateArn: 'NOTSET',
                    state: 'created',
                    at: moment()
                        .utc()
                        .format()
                }
            };

            if (event.generateCert !== false) {

                return iot.createKeysAndCertificate({
                    setAsActive: true
                }).promise().then(cert => {
                    params.connectionState = {
                        certificateId: cert.certificateId,
                        certificateArn: cert.certificateArn,
                        state: 'created',
                        at: moment().utc().format()
                    };
                    params.cert = cert;

                    return iot.attachThingPrincipal({
                        principal: cert.certificateArn,
                        thingName: event.thingName
                    }).promise();

                }).then(() => {

                    return params;

                });

            } else {

                return params;

            }

        }).then(params => {
            return Promise.all([params, documentClient
                .put({
                    TableName: process.env.TABLE_DEVICES,
                    Item: params,
                    ReturnValues: 'ALL_OLD'
                })
                .promise()
            ]);
        })
        .then(results => {
            console.log('addDevice: results:', JSON.stringify(results, null, 4));
            return results[0];
        });
};
