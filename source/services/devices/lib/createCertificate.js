const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const UsageMetrics = require('usage-metrics');
const moment = require('moment');

const lib = 'createCertificate';

// Following function creates a certificate for AWS IoT using the AWS CA.
// Function parameters:
// - .csr: CSR in pem format
// - .thingName: thingName
// - .attachToThing: boolean, attach new cert to the Thing

module.exports = function(event, context) {
    const usageMetrics = new UsageMetrics();
    const tag = `${lib}(${event.thingName}):`;

    console.log(tag, 'Start: Request cert creation from CSR:', event.csr);

    let _cert;

    return iot
        .createCertificateFromCsr({
            certificateSigningRequest: event.csr,
            setAsActive: true
        })
        .promise()
        .then(data => {
            _cert = data;
            console.log(tag, 'CertificateId', _cert.certificateId, event.attachToThing);

            if (event.attachToThing) {
                return Promise.all([
                    iot
                        .attachThingPrincipal({
                            principal: _cert.certificateArn,
                            thingName: event.thingName
                        })
                        .promise(),
                    iot
                        .attachPrincipalPolicy({
                            principal: _cert.certificateArn,
                            policyName: process.env.IOT_DEFAULT_CONNECT_POLICY
                        })
                        .promise()
                ]).then(r => {
                    console.log(tag, 'The thing exists, and has been attached. Lets update the device if it exists');
                    return iot
                        .describeThing({
                            thingName: event.thingName
                        })
                        .promise()
                        .then(thing => {
                            return documentClient
                                .get({
                                    TableName: process.env.TABLE_DEVICES,
                                    Key: {
                                        thingId: thing.thingId
                                    }
                                })
                                .promise()
                                .then(device => {
                                    if (device.Item) {
                                        console.log(tag, 'Device exists, updating its certificateArn');
                                        const updateParams = {
                                            TableName:
                                                process.env.TABLE_DEVICES,
                                            Key: {
                                                thingId: thing.thingId
                                            },
                                            UpdateExpression:
                                                'set #ua = :ua, #certArn = :certArn',
                                            ExpressionAttributeNames: {
                                                '#ua': 'updatedAt',
                                                '#certArn': 'certificateArn'
                                            },
                                            ExpressionAttributeValues: {
                                                ':ua': moment()
                                                    .utc()
                                                    .format(),
                                                ':certArn': _cert.certificateArn
                                            }
                                        };

                                        return documentClient.update(updateParams).promise();
                                    } else {
                                        console.log(tag, 'Device does not exist. Do nothing');
                                        return Promise.resolve(null);
                                    }
                                });
                        });
                });
            } else {
                return Promise.resolve(null);
            }
        })
        .then(result => {
            return _cert;
        })
        .catch(err => {
            console.error(tag, err);
            throw err;
        });
};
