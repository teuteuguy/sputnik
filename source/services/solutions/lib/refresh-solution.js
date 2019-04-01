const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');
const shortid = require('shortid');

// const MTMThingGroups = require('sputnik-custom-resource-helper-thing-groups');
// const DevicesLibs = require('sputnik-devices-service');

const lib = 'refreshSolution';


// "spec": {
//     "devices": [{
//             "ref": "device_0",
//             "deviceBlueprintId": "aws-3d-belt-v1.0",
//             "defaultDeviceTypeId": "aws-afr-3d-belt-esp32-v1.0"
//         },
//         {
//             "ref": "device_1",
//             "deviceBlueprintId": "gg-mini-connected-factory-v1.0",
//             "defaultDeviceTypeId": "deeplensv1.0",
//             "spec": {
//             "DeviceDefinitionVersion": {
//                 "Devices": [{
//                     "ThingArn": "!GetAtt[device_0.thingArn]",
//                     "CertificateArn": "!GetAtt[device_0.cert.certificateArn]",
//                     "SyncShadow": true
//                 }]
//             },
//             "afterActions": [
//                 "let fArn = \"arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT]:function:aws-mini-connected-factory-belt-serial-python:MTM\";",
//                 "if ( (index = finalSpec.FunctionDefinitionVersion.Functions.findIndex(f => f.FunctionArn === fArn)) !== -1 ) { finalSpec.FunctionDefinitionVersion.Functions[index].FunctionConfiguration.Environment.Variables.DEVICE_IOT_THING_NAME = '!GetAtt[device_0.thingName]' }"
//             ]
//         }
//     }]
// }

function processDeviceList(deviceListSpec, deviceList) {

    const tag = 'processDeviceList:';

    return deviceListSpec.reduce((previousValue, currentValue, index, array) => {
        return previousValue.then(chainResults => {
            console.log(tag, 'CurrentValue:', index, JSON.stringify(currentValue));
            console.log(tag, 'chainResults:', index, JSON.stringify(chainResults));

            let occurencesOfGetAtt = JSON.stringify(currentValue).split('!GetAtt[');

            if (occurencesOfGetAtt.length !== 1) {
                // Found at least 1 occurence of !GetAtt in our spec.
                console.log(tag, 'GetAtt:', JSON.stringify(occurencesOfGetAtt, null, 4));
                occurencesOfGetAtt.forEach((occurence, i) => {
                    if (i !== 0) {
                        console.log(tag, `GetAtt: occurencesOfGetAtt[${i}]:`, occurencesOfGetAtt[i]);
                        let split = occurence.split(']');
                        const attributes = split[0].split('.');
                        const value = attributes.reduce((pv, cv, j) => {
                            if (j === 0) {
                                const indexOfDevice = _.findIndex(chainResults, item => {
                                    return item.ref === cv;
                                });
                                if (indexOfDevice === -1) {
                                    throw 'Invalid spec';
                                } else {
                                    return chainResults[indexOfDevice].device;
                                }
                            } else {
                                if (pv) {
                                    return pv[cv];
                                }
                            }
                        }, '');
                        console.log(tag, 'GetAtt: value:', value);
                        split.shift();
                        occurencesOfGetAtt[i] = '' + value + split.join(']');
                        console.log(tag, 'GetAtt: occurencesOfGetAtt[i]:', i, occurencesOfGetAtt[i]);
                    }
                });
            }

            console.log(tag, 'GetAtt:', occurencesOfGetAtt.join(''));
            currentValue = JSON.parse(occurencesOfGetAtt.join(''));

            currentValue.device = deviceList[index];

            console.log(tag, 'Updating device', currentValue.spec);

            if (currentValue.device) {
                return documentClient.update({
                    TableName: process.env.TABLE_DEVICES,
                    Key: {
                        thingId: currentValue.device.thingId
                    },
                    UpdateExpression: 'set #ua = :ua, #spec = :spec',
                    ExpressionAttributeNames: {
                        '#ua': 'updatedAt',
                        '#spec': 'spec'
                    },
                    ExpressionAttributeValues: {
                        ':ua': moment()
                            .utc()
                            .format(),
                        ':spec': currentValue.spec || {}
                    }
                }).promise().then(result => {
                    currentValue.device.spec = currentValue.spec;
                    return [...chainResults, currentValue];
                });
            } else {
                return [...chainResults, currentValue];
            }

        });
    }, Promise.resolve([]).then(arrayOfResults => arrayOfResults));
}

module.exports = function (event, context) {

    // Event:
    // {
    //     "cmd": "refreshSolution",
    //     "solutionId": "id"
    // }

    // First get the solution
    let _solution;
    return documentClient.get({
        TableName: process.env.TABLE_SOLUTIONS,
        Key: {
            id: event.id
        }
    }).promise().then(solution => {
        _solution = solution.Item;

        if (!_solution) {
            throw 'Solution does not exist.';
        } else {
            console.log('Found solution');
            return documentClient.get({
                TableName: process.env.TABLE_SOLUTION_BLUEPRINTS,
                Key: {
                    id: _solution.solutionBlueprintId
                }
            }).promise();
        }
    }).then(solutionBlueprint => {
        _solutionBlueprint = solutionBlueprint.Item;

        if (!_solutionBlueprint) {
            throw 'SolutionBlueprint ' + _solution.solutionBlueprintId + ' does not exist.';
        } else {

            if (_solution.deviceIds.length !== _solutionBlueprint.spec.devices.length) {
                // throw 'Solution has inconsistent deviceIds and devices length in spec';
                return [];
            } else {

                return Promise.all(_solution.deviceIds.map(thingId => {
                    return documentClient.get({
                        TableName: process.env.TABLE_DEVICES,
                        Key: {
                            thingId: thingId
                        }
                    }).promise().then(device => {
                        device = device.Item;
                        if (!device) {
                            throw 'Device for thingId ' + thingId + ' does not exist anymore!';
                        }
                        return device;
                    });
                }));
            }

        }

    }).then(devices => {

        console.log(lib, 'end:', devices);
        return processDeviceList(_solutionBlueprint.spec.devices, devices);

    });












    // // First check a group with that name does not already exist. If so, exit.
    // return iot.describeThingGroup({
    //     thingGroupName: event.thingGroupName
    // }).promise().then(group => {
    //     // Group already exists.
    //     console.log('thingGroup already exists, exiting call');
    //     callback('ERROR: thingGroup already exists', null);
    // }).catch(err => {
    //     // Group does not exist, lets create it.

    //     return documentClient.get({
    //         TableName: process.env.TABLE_SOLUTION_BLUEPRINTS,
    //         Key: {
    //             id: event.solutionBlueprintId
    //         }
    //     }).promise().then(solutionBlueprint => {

    //         solutionBlueprint = solutionBlueprint.Item;

    //         console.log('solutionBlueprint:', JSON.stringify(solutionBlueprint, null, 2));
    //         if (!solutionBlueprint.spec || !solutionBlueprint.spec.devices) {
    //             throw 'solutionBlueprintId: ' + event.solutionBlueprintId + ' does not have a spec and devices';
    //         }

    //         // TODO: for now We'll generate the devices.
    //         // Later we can look at deviceIds to check if no devices have been provided and if so, NOT create them, but associate them.
    //         // Same for the certs. For now we'll generate them.

    //         return processDeviceList(solutionBlueprint.prefix, solutionBlueprint.spec.devices);

    //     }).then(devices => {

    //         console.log('ProcessDeviceList Result:', JSON.stringify(devices));

    //         event.deviceIds = devices.map(d => {
    //             return d.device.thingId;
    //         });

    //         // Second let's create the group.
    //         // Third based on the spec, we need to read the spec and create the different resources!
    //         // Fourth let's create the solution in the DB to reference the Group as well as the Blueprint.

    //         const mtmGroups = new MTMThingGroups();

    //         return mtmGroups.createThingGroup(event.name, event.description);

    //     }).then(group => {

    //         const newSolution = {
    //             id: group.thingGroupId,
    //             thingGroupName: group.thingGroupName,
    //             name: event.name,
    //             description: event.description,
    //             deviceIds: event.deviceIds || [],
    //             solutionBlueprintId: event.solutionBlueprintId,
    //             createdAt: moment()
    //                 .utc()
    //                 .format(),
    //             updatedAt: moment()
    //                 .utc()
    //                 .format()
    //         };

    //         return Promise.all([newSolution, documentClient
    //             .put({
    //                 TableName: process.env.TABLE_SOLUTIONS,
    //                 Item: newSolution,
    //                 ReturnValues: 'ALL_OLD'
    //             })
    //             .promise()
    //         ]);

    //     }).then(results => {
    //         console.log('Created solution', results[0]);
    //         return results[0];
    //     });

    // });


    // // TODO: deal with creating a greengrass group if required.
    // // TODO: deal with certificates!

    // iot.createThing({
    //     thingName: event.thingName
    // })
    //     .promise()
    //     .then(thing => {
    //         return Promise.all([
    //             thing,
    //             documentClient
    //                 .get({
    //                     TableName: process.env.TABLE_DEVICES,
    //                     Key: {
    //                         thingId: thing.thingId
    //                     }
    //                 })
    //                 .promise()
    //         ]);
    //     })
    //     .then(results => {
    //         const thing = results[0];
    //         const result = results[1];

    //         if (result.Item) {
    //             // Thing already in our DB
    //             throw 'Thing is already in the DB';
    //         } else {
    //             const params = {
    //                 thingId: thing.thingId,
    //                 thingName: event.thingName,
    //                 thingArn: thing.thingArn,
    //                 name: event.thingName,
    //                 deviceTypeId: 'UNKNOWN',
    //                 deviceBlueprintId: 'UNKNOWN',
    //                 connectionState: {
    //                     // TODO: probably generate the certs here at one point.
    //                     certificateId: 'NOTSET',
    //                     certificateArn: 'NOTSET',
    //                     state: 'created',
    //                     at: moment()
    //                         .utc()
    //                         .format()
    //                 },
    //                 greengrassGroupId: 'NOT_A_GREENGRASS_DEVICE',
    //                 lastDeploymentId: 'UNKNOWN',
    //                 createdAt: moment()
    //                     .utc()
    //                     .format(),
    //                 updatedAt: moment()
    //                     .utc()
    //                     .format()
    //             };
    //             return Promise.all([params, documentClient
    //                 .put({
    //                     TableName: process.env.TABLE_DEVICES,
    //                     Item: params,
    //                     ReturnValues: 'ALL_OLD'
    //                 })
    //                 .promise()
    //             ]);
    //         }
    //     })
    //     .then(results => {
    //         const newThing = results[0];
    //         console.log(newThing);
    //         callback(null, newThing);
    //     })
    //     .catch(err => {
    //         callback(err, null);
    //     });

    // getDeviceStatsRecursive().then(stats => {
    //     callback(null, stats);
    // }).catch(err => {
    //     callback(err, null);
    // });
};
