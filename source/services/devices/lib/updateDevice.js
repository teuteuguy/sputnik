const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const listGreengrassGroupIdsForThingArn = require('sputnik-custom-resource-helper-utils').listGreengrassGroupIdsForThingArn;

module.exports = function (event, context) {

    const tag = 'updateDevice:';

    console.log(tag, event);

    // Event needs to be:
    // event.thingId
    // event.deviceTypeId
    // event.deviceBlueprintId
    // event.spec
    // event.name

    // If a device goes from UNKNONW to GREENGRASS => Create the GG Group.

    let _device;
    let _deviceType;

    return Promise.all([

        documentClient.get({
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            }
        }).promise().then(device => _device = device.Item),

        documentClient.get({
            TableName: process.env.TABLE_DEVICE_TYPES,
            Key: {
                id: event.deviceTypeId
            }
        }).promise().then(deviceType => _deviceType = deviceType.Item)
        // .catch(err => {
        //     console.log(tag, 'DeviceType', event.deviceTypeId, 'does not exist. Setting to UNKNOWN');
        //     _deviceType = {
        //         id: 'UNKNOWN',
        //         type: 'UNKNOWN'
        //     };
        //     return _deviceType;
        // })

    ]).then(results => {

        if (!_deviceType) {
            console.log(tag, 'DeviceType', event.deviceTypeId, 'does not exist. Setting to UNKNOWN');
            _deviceType = {
                id: 'UNKNOWN',
                type: 'UNKNOWN'
            };
        }

        console.log(_deviceType.type, _deviceType.type === 'GREENGRASS');

        if (_deviceType.type === 'GREENGRASS') {
            console.log(tag, 'Chosen devicetype is GREENGRASS. Lets check if theres a group for this device already, if not create it.');
            return listGreengrassGroupIdsForThingArn(_device.thingArn).then(groupIds => {
                console.log(tag, 'Found groupIds:', groupIds);
                if (groupIds.length === 0) {
                    console.log(tag, 'Need to create group');
                    return gg.createGroup({
                        Name: _device.thingName + '-gg-group'
                    }).promise().then(group => {
                        return group.Id;
                    });
                } else if (groupIds.length === 1) {
                    return groupIds[0];
                } else {
                    throw 'Cant support multiple greengrass groups yet.';
                }
            });
        } else {
            return 'NOT_A_GREENGRASS_DEVICE';
        }

    }).then(groupId => {

        console.log('spec:', event.spec);

        const updateParams = {
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            },
            UpdateExpression: 'set #ua = :ua, #n = :n, #dti = :dti, #dbi = :dbi, #gid = :gid, #s = :s',
            ExpressionAttributeNames: {
                '#ua': 'updatedAt',
                '#dti': 'deviceTypeId',
                '#dbi': 'deviceBlueprintId',
                '#gid': 'greengrassGroupId',
                '#s': 'spec',
                '#n': 'name'
            },
            ExpressionAttributeValues: {
                ':ua': moment()
                    .utc()
                    .format(),
                ':dti': _deviceType.id,
                ':dbi': event.deviceBlueprintId || 'UNKNOWN',
                ':gid': groupId,
                ':s': event.spec,
                ':n': event.name
            }
        };
        return documentClient.update(updateParams).promise();

    }).then(result => {
        return documentClient.get({
            TableName: process.env.TABLE_DEVICES,
            Key: {
                thingId: event.thingId
            }
        }).promise();
    }).then(result => {
        return result.Item;
    });

};
