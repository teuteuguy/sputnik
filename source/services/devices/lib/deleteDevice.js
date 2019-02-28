const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'deleteDevice';

const UsageMetrics = require('usage-metrics');

module.exports = function (event, context) {

    const usageMetrics = new UsageMetrics();

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
                    console.log('Device was provisioned with a cert attached to it');
                    console.log('First delete the cert itself');
                    return iot.listPrincipalPolicies({
                        principal: event.device.cert.certificateArn
                    }).promise().then(policies => {
                        console.log('Found these policies on the cert', policies.policies);
                        return Promise.all(policies.policies.map(p => {
                            return iot.detachPrincipalPolicy({
                                principal: event.device.cert.certificateArn,
                                policyName: p.policyName
                            }).promise();
                        }));
                    }).then(results => {
                        console.log('Detached the policies from the cert');
                        // Detached all policies from the principal!
                        // Detach all things from the principal
                        return iot.listPrincipalThings({
                            principal: event.device.cert.certificateArn
                        }).promise();

                    }).then(things => {
                        console.log('Found the following things on the cert', things.things);
                        return Promise.all(things.things.map(t => {
                            return iot.detachThingPrincipal({
                                thingName: t,
                                principal: event.device.cert.certificateArn
                            }).promise();
                        }));
                    }).then(results => {
                        console.log('Detached the things from the cert');
                        return iot.updateCertificate({
                            certificateId: event.device.cert.certificateId,
                            newStatus: 'INACTIVE'
                        }).promise();
                    }).then(result => {
                        console.log('Made the cert inactive');
                        console.log('Deleting the cert');
                        return iot.deleteCertificate({
                            certificateId: event.device.cert.certificateId
                        }).promise();
                    });

                } else {
                    console.log('Device was provisioned without a cert attached to it');
                    return iot.listThingPrincipals({
                        thingName: event.device.thingName
                    }).promise().then(principals => {
                        console.log('Found the following principals attached to our thing', principals.principals);
                        return Promise.all(principals.principals.map(p => {
                            console.log('detaching all the principals');
                            return iot.detachThingPrincipal({
                                thingName: event.device.thingName,
                                principal: p
                            }).promise();
                        }));
                    });
                }
            } else {
                throw {
                    error: 404,
                    message: 'Device ' + event.thingId + ' does not exist.'
                };
            }

        }).then(result => {
            // At this point, thing is ready to be deleted
            console.log('Done with the cert');
            console.log('Device.greengrassGroupId:', event.device.greengrassGroupId);
            if (event.device.greengrassGroupId !== 'NOT_A_GREENGRASS_DEVICE') {
                console.log('Reseting the deployments');
                return gg.resetDeployments({
                    GroupId: event.device.greengrassGroupId,
                    Force: true
                }).promise().then(result => {
                    console.log('Deleting the group');
                    return gg.deleteGroup({
                        GroupId: event.device.greengrassGroupId
                    }).promise();
                });
            } else {
                return;
            }
        }).then(result => {

            return iot.deleteThing({
                thingName: event.device.thingName
            }).promise();

        }).then(thing => {
            console.log('Deleted the thing');
            // Delete device:

            return documentClient.delete({
                TableName: process.env.TABLE_DEVICES,
                Key: {
                    thingId: event.thingId
                }
            }).promise();

        })
        .then(results => {
            console.log('Deleted the device in the db');
            return usageMetrics.sendAnonymousMetricIfCustomerEnabled({
                metric: "deleteDevice",
                value: event.thingId
            }).then(res => {
                return event.device;
            });
        });
};
