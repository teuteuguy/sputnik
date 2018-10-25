const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'addDevice';

module.exports = function (event, context) {

    // Note: in order to be consistent with the rest of the Appsync API, event.spec is a stringified json object!

    // Event needs to be:
    // event.deviceTypeId
    // event.deviceBlueprintId
    // event.spec
    // event.thingName
    // event.generateCert


    // Create thing returns
    // {
    //     "thingArn": "arn:aws:iot:us-east-1:accountnumber:thing/toto",
    //     "thingName": "toto",
    //     "thingId": "ef17a1237-eb50-4d64-a359-df4894ba90a0"
    // }

    // TODO: deal with creating a greengrass group if required.
    // TODO: deal with certificates!

    let _thing;

    return iot.createThing({
            thingName: event.thingName
        })
        .promise()
        .then(thing => {
            _thing = thing;
            // Check if thing already exists
            return documentClient
                .get({
                    TableName: process.env.TABLE_DEVICES,
                    Key: {
                        thingId: thing.thingId
                    }
                })
                .promise();
        })
        .then(result => {


            if (!event.spec) {
                event.spec = {};
            } else {
                event.spec = JSON.parse(event.spec);
            }

            let params = {
                thingId: _thing.thingId,
                thingName: _thing.thingName,
                thingArn: _thing.thingArn,
                name: _thing.thingName,
                deviceTypeId: event.deviceTypeId || 'UNKNOWN',
                deviceBlueprintId: event.deviceBlueprintId || 'UNKNOWN',
                greengrassGroupId: 'NOT_A_GREENGRASS_DEVICE',
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

            if (result.Item) {
                // Thing already in our DB
                throw 'Thing is already in the DB';
            } else {
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
