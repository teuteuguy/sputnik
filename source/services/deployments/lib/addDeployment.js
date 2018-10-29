const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const gg = new AWS.Greengrass();
const moment = require('moment');
const _ = require('underscore');
const uuid = require('uuid');

const createGreengrassCoreDefinitionVersion = require('./createGreengrassCoreDefinitionVersion');
const createGreengrassFunctionDefinitionVersion = require('./createGreengrassFunctionDefinitionVersion');
const createGreengrassLoggerDefinitionVersion = require('./createGreengrassLoggerDefinitionVersion');
const createGreengrassResourceDefinitionVersion = require('./createGreengrassResourceDefinitionVersion');
const createGreengrassSubscriptionDefinitionVersion = require('./createGreengrassSubscriptionDefinitionVersion');

const mergeGreengrassSpecs = require('./mergeGreengrassSpecs');

const lib = 'addDeployment';


module.exports = function (event, context, callback) {
    if (event.cmd !== lib) {
        return callback('Wrong cmd for lib. Should be ' + lib + ', got event: ' + event, null);
    }

    let _device;
    let _deviceType;
    let _deviceBlueprint;
    let _newSpec;
    let _newGreengrassGroupVersion = {};
    let _groupVersion;
    let _deployment;

    let _substitutions = {
        THING_NAME: null,
        CORE: null,
        CORE_ARN: null,
        CORE_CERTIFICATE_ARN: null,
        AWS_REGION: null,
        AWS_ACCOUNT: null,
        MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY: null
    };

    // First lets get the device.
    documentClient.get({
        TableName: process.env.TABLE_DEVICES,
        Key: {
            thingId: event.thingId
        }
    }).promise().then(device => {
        _device = device.Item;
        console.log('Device:', _device);
        if (_device === undefined) {
            throw 'Device does not exist in DB';
        }

        const deviceTypeParams = {
            TableName: process.env.TABLE_DEVICE_TYPES,
            Key: {
                id: _device.deviceTypeId
            }
        };
        const deviceBlueprintParams = {
            TableName: process.env.TABLE_DEVICE_BLUEPRINTS,
            Key: {
                id: _device.deviceBlueprintId
            }
        };

        return Promise.all([
            documentClient.get(deviceTypeParams).promise().then(result => _deviceType = result.Item),
            documentClient.get(deviceBlueprintParams).promise().then(result => _deviceBlueprint = result.Item),
            // iot.describeThing({
            //     thingName: _device.thingName
            // }).promise()
        ]);
    }).then(results => {
        // _thing = results[2];

        console.log('Device Type:', _deviceType);
        console.log('Device Blueprint:', _deviceBlueprint);
        // console.log('Thing:', _thing);
        if (_deviceType === undefined || _deviceBlueprint === undefined) {
            throw 'Device Type or Device Blueprint do not exist in DB';
        }

        if (_deviceType.type === 'GREENGRASS' && _deviceBlueprint.type === 'GREENGRASS') {

            return gg.getGroup({
                GroupId: _device.greengrassGroupId
            }).promise().then(group => {
                return gg.getGroupVersion({
                    GroupId: _device.greengrassGroupId,
                    GroupVersionId: group.LatestVersion
                }).promise();
            }).then(groupDefinitionVersion => {
                // Lets check if by any chance this device is a Greengrass device ?
                console.log('Lets check if the device is part of a greengrass group as the greengrass core?');

                _substitutions.AWS_ACCOUNT = process.env.AWS_ACCOUNT;
                _substitutions.AWS_REGION = process.env.AWS_REGION;
                _substitutions.THING_NAME = _device.thingName;
                _substitutions.CORE = _device.thingName;
                _substitutions.CORE_ARN = _device.thingArn;
                _substitutions.CORE_CERTIFICATE_ARN = _device.connectionState.certificateArn;
                // _substitutions.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY = process.env.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY;

                console.log('First we will replace the following info in out templates:');
                console.log(`THING_NAME: ${_substitutions.THING_NAME}`);
                console.log(`AWS_REGION: ${process.env.AWS_REGION}`);
                console.log(`AWS_ACCOUNT: ${process.env.AWS_ACCOUNT}`);
                console.log(`CORE: ${_substitutions.CORE}`);
                console.log(`CORE_ARN: ${_substitutions.CORE_ARN}`);
                console.log(`CORE_CERTIFICATE_ARN: ${_substitutions.CORE_CERTIFICATE_ARN}`);
                // console.log(`MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY: ${process.env.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY}`);

                console.log(`DeviceType Spec in: ${JSON.stringify(_deviceType.spec, null, 4)}`);
                console.log(`DeviceBlueprint Spec in: ${JSON.stringify(_deviceBlueprint.spec, null, 4)}`);

                _newSpec = mergeGreengrassSpecs(_deviceBlueprint.spec, _deviceType.spec);
                console.log(`New Spec in: ${JSON.stringify(_newSpec, null, 4)}`);

                // Construct the spec:
                let strSpec = JSON.stringify(_newSpec);
                for (var key in _substitutions) {
                    // skip loop if the property is from prototype
                    if (!_substitutions.hasOwnProperty(key)) continue;

                    var value = _substitutions[key];
                    for (var prop in value) {
                        // skip loop if the property is from prototype
                        if (!value.hasOwnProperty(prop)) continue;

                        // your code
                        let regExp = new RegExp('[' + key + ']', 'gi');
                        strSpec = strSpec.split('[' + key + ']').join(value);
                    }
                }

                _deviceBlueprint.deviceTypeMappings.forEach(mapping => {
                    if (mapping.value[_deviceType.id]) {
                        let regExp = new RegExp('[' + mapping.substitute + ']', 'gi');
                        strSpec = strSpec.split('[' + mapping.substitute + ']').join(mapping.value[_deviceType.id]);
                    }
                });

                _newSpec = JSON.parse(strSpec);
                console.log(`Spec out: ${JSON.stringify(_newSpec, null, 4)}`);

                _newGreengrassGroupVersion = {};
                _newGreengrassGroupVersion.GroupId = _device.greengrassGroupId;

                return Promise.all([
                    createGreengrassCoreDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(c => _newGreengrassGroupVersion.CoreDefinitionVersionArn = c.Arn),
                    createGreengrassFunctionDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(f => _newGreengrassGroupVersion.FunctionDefinitionVersionArn = f.Arn),
                    createGreengrassLoggerDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(l => _newGreengrassGroupVersion.LoggerDefinitionVersionArn = l.Arn),
                    createGreengrassResourceDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(r => _newGreengrassGroupVersion.ResourceDefinitionVersionArn = r.Arn),
                    createGreengrassSubscriptionDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(s => _newGreengrassGroupVersion.SubscriptionDefinitionVersionArn = s.Arn)
                ]);

            }).then(results => {

                console.log('newGreengrassGroupVersion', JSON.stringify(_newGreengrassGroupVersion, null, 2));

                return gg.createGroupVersion(_newGreengrassGroupVersion).promise();

            }).then(groupVersion => {
                _groupVersion = groupVersion;
                console.log(`Created group version: ${JSON.stringify(_groupVersion, null, 2)}`);
                console.log(`Deploy it:`);
                return gg.createDeployment({
                    GroupId: _groupVersion.Id,
                    DeploymentId: uuid.v4(),
                    DeploymentType: 'NewDeployment',
                    GroupVersionId: _groupVersion.Version
                }).promise();

            }).then(deployment => {
                _deployment = deployment;
                console.log(`Deployed: ${_deployment.DeploymentId}`);

                const newDeployment = {
                    TableName: process.env.TABLE_DEPLOYMENTS,
                    Item: {
                        thingId: _device.thingId,
                        deploymentId: _deployment.DeploymentId,
                        spec: _newSpec,
                        greengrassGroup: {
                            Id: _groupVersion.Id,
                            VersionId: _groupVersion.Version
                        },
                        createdAt: moment()
                            .utc()
                            .format(),
                        updatedAt: moment()
                            .utc()
                            .format()
                    }
                };
                return documentClient.put(newDeployment).promise();
            }).then(deployment => {

                const updateParams = {
                    TableName: process.env.TABLE_DEVICES,
                    Key: {
                        thingId: _device.thingId
                    },
                    UpdateExpression: 'set #ua = :ua, #l = :l',
                    ExpressionAttributeNames: {
                        '#ua': 'updatedAt',
                        '#l': 'lastDeploymentId'
                    },
                    ExpressionAttributeValues: {
                        ':ua': moment()
                            .utc()
                            .format(),
                        ':l': _deployment.DeploymentId
                    }
                };
                return documentClient.update(updateParams).promise();
            }).then(device => {

                console.log(`AND WE ARE DONE !`);
                return;

            }).then(() => {
                callback(null, null);
            });

        } else {
            console.log('Device is NOT a greengrass device, or at least not detected as one. OR the deviceBlueprint/deviceType combination is not for a Greengrass device');
            callback(null, null);
        }

    }).catch(err => {
        callback(err, null);
    });
};
