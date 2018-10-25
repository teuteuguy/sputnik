const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'deleteDevice';

module.exports = function (event, context) {

    return documentClient
        .get({
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            }
        })
        .promise().then(device => {
            event.device = device.Item;
            if (event.device) {

                console.log('Device to delete:', event.device);

                if (event.device.cert) {
                    // Device was provisioned with a cert attached to it.
                    // Lets first delete the cert first.
                    return iot.listPrincipalPolicies({
                        principal: event.device.cert.certificateArn
                    }).promise().then(policies => {
                        return Promise.all(policies.policies.map(p => {
                            return iot.detachPrincipalPolicy({
                                principal: event.device.cert.certificateArn,
                                policyName: p.policyName
                            }).promise();
                        }));
                    }).then(results => {
                        // Detached all policies from the principal!
                        // Detach all things from the principal
                        return iot.listPrincipalThings({
                            principal: event.device.cert.certificateArn
                        }).promise();

                    }).then(things => {
                        return Promise.all(things.things.map(t => {
                            return iot.detachThingPrincipal({
                                thingName: t,
                                principal: event.device.cert.certificateArn
                            }).promise();
                        }));
                    }).then(results => {
                        return iot.updateCertificate({
                            certificateId: event.device.cert.certificateId,
                            newStatus: 'INACTIVE'
                        }).promise();
                    }).then(result => {
                        return iot.deleteCertificate({
                            certificateId: event.device.cert.certificateId
                        }).promise();
                    });

                } else {
                    return iot.listThingPrincipals({
                        thingName: event.device.thingName
                    }).promise().then(principals => {
                        return Promise.all(principals.principals.map(p => {
                            return iot.detachThingPrincipal({
                                thingName: event.device.thingName,
                                principal: p
                            }).promise();
                        }));
                    });
                }
            } else {
                throw 'Device ' + event.thingId + ' does not exist.';
            }

        }).then(() => {
            // At this point, thing is ready to be deleted

            return iot.deleteThing({
                thingName: event.device.thingName
            }).promise();

        }).then(thing => {

            // Delete device:

            return documentClient.delete({
                TableName: process.env.TABLE_DEVICES,
                Key: {
                    thingId: event.thingId
                }
            }).promise();

        })
        .then(results => {
            console.log('deleteDevice: thing and device deleted:');
            return event.device;
        });
};
