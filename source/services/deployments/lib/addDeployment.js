const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const gg = new AWS.Greengrass();
const moment = require('moment');
const _ = require('underscore');
const uuid = require('uuid');

const createGreengrassXDefinitionVersion = require('./createGreengrassXDefinitionVersion');

const createGreengrassCoreDefinitionVersion = require('./createGreengrassCoreDefinitionVersion');
const createGreengrassFunctionDefinitionVersion = require('./createGreengrassFunctionDefinitionVersion');
const createGreengrassLoggerDefinitionVersion = require('./createGreengrassLoggerDefinitionVersion');
const createGreengrassResourceDefinitionVersion = require('./createGreengrassResourceDefinitionVersion');
const createGreengrassSubscriptionDefinitionVersion = require('./createGreengrassSubscriptionDefinitionVersion');

const mergeGreengrassSpecs = require('./mergeGreengrassSpecs');

const lib = 'addDeployment';


module.exports = function (event, context) {

    let _device;
    let _deviceType;
    let _deviceBlueprint;
    let _newSpec = {};
    let _newGreengrassGroupVersion = {};
    let _groupVersion;
    let _deployment;
    let _savedDeployment;

    let _substitutions = {
        THING_NAME: null,
        CORE: null,
        CORE_ARN: null,
        CORE_CERTIFICATE_ARN: null,
        AWS_REGION: null,
        AWS_ACCOUNT: null,
        DATA_BUCKET_S3_URL: null
    };

    // First lets get the device.
    return documentClient.get({
        TableName: process.env.TABLE_DEVICES,
        Key: {
            thingId: event.thingId
        }
    }).promise().then(device => {
        _device = device.Item;

        if (_device === undefined) {
            throw 'Device does not exist in DB';
        }

        return Promise.all([
            documentClient.get({
                TableName: process.env.TABLE_DEVICE_TYPES,
                Key: {
                    id: _device.deviceTypeId
                }
            }).promise().then(result => _deviceType = result.Item),
            documentClient.get({
                TableName: process.env.TABLE_DEVICE_BLUEPRINTS,
                Key: {
                    id: _device.deviceBlueprintId
                }
            }).promise().then(result => _deviceBlueprint = result.Item)
        ]);
    }).then(results => {

        if (_deviceType === undefined || _deviceBlueprint === undefined) {
            throw 'Device Type or Device Blueprint do not exist in DB';
        }

        console.log('Device:', _device);
        console.log('Device Type:', _deviceType);
        console.log('Device Blueprint:', _deviceBlueprint);

        if (_deviceType.type === 'GREENGRASS' && _deviceBlueprint.type === 'GREENGRASS') {

            console.log('Device is a Greengrass device');

            return gg.getGroup({
                GroupId: _device.greengrassGroupId
            }).promise().then(group => {

                if (!group.LatestVersion) {
                    console.log('Group does not have a definition version yet. We will need to create it later down.');
                    return null;
                } else {
                    return gg.getGroupVersion({
                        GroupId: _device.greengrassGroupId,
                        GroupVersionId: group.LatestVersion
                    }).promise();
                }

            }).then(groupDefinitionVersion => {
                // Lets check if by any chance this device is a Greengrass device ?
                // console.log('Lets check if the device is part of a greengrass group as the greengrass core?');

                _substitutions.AWS_ACCOUNT = process.env.AWS_ACCOUNT;
                _substitutions.AWS_REGION = process.env.AWS_REGION;
                _substitutions.THING_NAME = _device.thingName;
                _substitutions.CORE = _device.thingName;
                _substitutions.CORE_ARN = _device.thingArn;
                _substitutions.CORE_CERTIFICATE_ARN = _device.connectionState.certificateArn;
                _substitutions.DATA_BUCKET_S3_URL = `https://${process.env.DATA_BUCKET}.s3.amazonaws.com`;

                // console.log('First we will replace the following info in out templates:');
                // console.log(`THING_NAME: ${_substitutions.THING_NAME}`);
                // console.log(`AWS_REGION: ${process.env.AWS_REGION}`);
                // console.log(`AWS_ACCOUNT: ${process.env.AWS_ACCOUNT}`);
                // console.log(`CORE: ${_substitutions.CORE}`);
                // console.log(`CORE_ARN: ${_substitutions.CORE_ARN}`);
                // console.log(`CORE_CERTIFICATE_ARN: ${_substitutions.CORE_CERTIFICATE_ARN}`);
                // console.log(`MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY: ${process.env.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY}`);

                if (_device.spec) {
                    console.log(`Device Spec: ${JSON.stringify(_device.spec, null, 4)}`);
                    _newSpec = mergeGreengrassSpecs(_newSpec, _device.spec);
                    console.log(`WIP Spec: ${JSON.stringify(_newSpec, null, 4)}`);
                }
                if (_deviceType.spec) {
                    console.log(`Device Type Spec: ${JSON.stringify(_deviceType.spec, null, 4)}`);
                    _newSpec = mergeGreengrassSpecs(_newSpec, _deviceType.spec);
                    console.log(`WIP Spec: ${JSON.stringify(_newSpec, null, 4)}`);
                }
                if (_deviceBlueprint.spec) {
                    console.log(`Device Blueprint Spec: ${JSON.stringify(_deviceBlueprint.spec, null, 4)}`);
                    _newSpec = mergeGreengrassSpecs(_newSpec, _deviceBlueprint.spec);
                    console.log(`WIP Spec: ${JSON.stringify(_newSpec, null, 4)}`);
                }

                console.log('Going to substitute in the spec');
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
                    createGreengrassXDefinitionVersion('Core', _newSpec, groupDefinitionVersion).then(c => {
                        if (c) {
                            _newGreengrassGroupVersion.CoreDefinitionVersionArn = c.Arn;
                        }
                        return c;
                    }),
                    createGreengrassXDefinitionVersion('Function', _newSpec, groupDefinitionVersion).then(f => {
                        if (f) {
                            _newGreengrassGroupVersion.FunctionDefinitionVersionArn = f.Arn;
                        }
                        return f;
                    }),
                    createGreengrassXDefinitionVersion('Logger', _newSpec, groupDefinitionVersion).then(l => {
                        if (l) {
                            _newGreengrassGroupVersion.LoggerDefinitionVersionArn = l.Arn;
                        }
                        return l;
                    }),
                    createGreengrassXDefinitionVersion('Resource', _newSpec, groupDefinitionVersion).then(r => {
                        if (r) {
                            _newGreengrassGroupVersion.ResourceDefinitionVersionArn = r.Arn;
                        }
                        return r;
                    }),
                    createGreengrassXDefinitionVersion('Subscription', _newSpec, groupDefinitionVersion).then(s => {
                        if (s) {
                            _newGreengrassGroupVersion.SubscriptionDefinitionVersionArn = s.Arn;
                        }
                        return s;
                    }),
                    createGreengrassXDefinitionVersion('Device', _newSpec, groupDefinitionVersion).then(d => {
                        if (d) {
                            _newGreengrassGroupVersion.DeviceDefinitionVersionArn = d.Arn;
                        }
                        return d;
                    })
                    // createGreengrassCoreDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(c => _newGreengrassGroupVersion.CoreDefinitionVersionArn = c.Arn),
                    // createGreengrassFunctionDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(f => _newGreengrassGroupVersion.FunctionDefinitionVersionArn = f.Arn),
                    // createGreengrassLoggerDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(l => _newGreengrassGroupVersion.LoggerDefinitionVersionArn = l.Arn),
                    // createGreengrassResourceDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(r => _newGreengrassGroupVersion.ResourceDefinitionVersionArn = r.Arn),
                    // createGreengrassSubscriptionDefinitionVersion(_newSpec, _device, groupDefinitionVersion).then(s => _newGreengrassGroupVersion.SubscriptionDefinitionVersionArn = s.Arn)
                ]);

            }).then(results => {
                console.log('results', JSON.stringify(results));
                console.log('newGreengrassGroupVersion', JSON.stringify(_newGreengrassGroupVersion, null, 2));

                    return gg.createGroupVersion(_newGreengrassGroupVersion).promise();

            }).then(groupVersion => {
                _groupVersion = groupVersion;

                console.log(`Created group version: ${JSON.stringify(_groupVersion, null, 2)}`);

                console.log('Attach IAM role to group just in case');

                return gg.associateRoleToGroup({
                    RoleArn: process.env.IAM_GREENGRASS_GROUP_ARN,
                    GroupId: _device.greengrassGroupId
                }).promise();

            }).then(result => {

                console.log(`Deploy group:`);

                return gg.createDeployment({
                    GroupId: _groupVersion.Id,
                    DeploymentId: uuid.v4(),
                    DeploymentType: 'NewDeployment',
                    GroupVersionId: _groupVersion.Version
                }).promise();

            }).then(deployment => {
                _deployment = deployment;
                console.log(`Deployed: ${_deployment.DeploymentId}`);

                _savedDeployment = {
                    thingId: _device.thingId,
                    deploymentId: _deployment.DeploymentId,
                    spec: _newSpec,
                    type: 'GREENGRASS',
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
                };

                const newDeployment = {
                    TableName: process.env.TABLE_DEPLOYMENTS,
                    Item: _savedDeployment
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
                return _savedDeployment;

            });

        } else {
            console.log('Device is NOT a greengrass device, or at least not detected as one. OR the deviceBlueprint/deviceType combination is not for a Greengrass device');
            return {
                thingId: 'UNKNOWN',
                deploymentId: 'UNKNOWN',
                type: 'NOT_A_GREENGRASS_DEVICE',
                spec: {},
                greengrassGroup: {},
                createdAt: moment()
                    .utc()
                    .format(),
                updatedAt: moment()
                    .utc()
                    .format()
            };
        }
    });
};
