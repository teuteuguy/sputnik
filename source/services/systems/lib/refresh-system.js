const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');
const shortid = require('shortid');

const lib = 'refreshSystem';

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
                return documentClient
                    .update({
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
                    })
                    .promise()
                    .then(result => {
                        currentValue.device.spec = currentValue.spec;
                        return [...chainResults, currentValue];
                    });
            } else {
                return [...chainResults, currentValue];
            }
        });
    }, Promise.resolve([]).then(arrayOfResults => arrayOfResults));
}

module.exports = function(event, context) {
    // Event:
    // {
    //     "cmd": "refreshSystem",
    //     "systemId": "id"
    // }

    // First get the system
    let _system;
    return documentClient
        .get({
            TableName: process.env.TABLE_SYSTEMS,
            Key: {
                id: event.id
            }
        })
        .promise()
        .then(system => {
            _system = system.Item;

            if (!_system) {
                throw 'System does not exist.';
            } else {
                console.log('Found system');
                return documentClient
                    .get({
                        TableName: process.env.TABLE_SYSTEM_BLUEPRINTS,
                        Key: {
                            id: _system.systemBlueprintId
                        }
                    })
                    .promise();
            }
        })
        .then(systemBlueprint => {
            _systemBlueprint = systemBlueprint.Item;

            if (!_systemBlueprint) {
                throw 'SystemBlueprint ' + _system.systemBlueprintId + ' does not exist.';
            } else {
                if (
                    !_systemBlueprint.spec.hasOwnProperty('Devices') &&
                    _system.deviceIds.length !== _systemBlueprint.spec.Devices.length
                ) {
                    // throw 'System has inconsistent deviceIds and devices length in spec';
                    return [];
                } else {
                    return Promise.all(
                        _system.deviceIds.map(thingId => {
                            return documentClient
                                .get({
                                    TableName: process.env.TABLE_DEVICES,
                                    Key: {
                                        thingId: thingId
                                    }
                                })
                                .promise()
                                .then(device => {
                                    device = device.Item;
                                    if (!device) {
                                        throw 'Device for thingId ' + thingId + ' does not exist anymore!';
                                    }
                                    return device;
                                });
                        })
                    );
                }
            }
        })
        .then(devices => {
            console.log(lib, 'end:', devices);
            return processDeviceList(_systemBlueprint.spec.Devices, devices);
        });
};
