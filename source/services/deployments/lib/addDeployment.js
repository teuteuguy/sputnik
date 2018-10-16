const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'addDeployment';

module.exports = function (event, context, callback) {
    if (event.cmd !== lib) {
        return callback('Wrong cmd for lib. Should be ' + lib + ', got event: ' + event, null);
    }

    let _device;
    let _deviceType;
    let _blueprint;
    let _thing;

    let _substitutions = {
        THING_NAME: null,
        CORE_ARN: null,
        CORE_CERTIFICATE_ARN: null,
        AWS_REGION: null,
        AWS_ACCOUNT: null,
        MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY: null
    };

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
        return Promise.all([
            documentClient.get({
                TableName: process.env.TABLE_DEVICE_TYPES,
                Key: {
                    id: _device.deviceTypeId
                }
            }).promise(),
            documentClient.get({
                TableName: process.env.TABLE_BLUEPRINTS,
                Key: {
                    id: _device.blueprintId
                }
            }).promise(),
            // iot.describeThing({
            //     thingName: _device.thingName
            // }).promise()
        ]);
    }).then(results => {
        _deviceType = results[0].Item;
        _blueprint = results[1].Item;
        // _thing = results[2];

        console.log('Device Type:', _deviceType);
        console.log('Blueprint:', _blueprint);
        console.log('Thing:', _thing);
        if (_deviceType === undefined || _blueprint === undefined) {
            throw 'Device Type of Blueprint do not exist in DB';
        }

        _substitutions.AWS_ACCOUNT = process.env.AWS_ACCOUNT;
        _substitutions.AWS_REGION = process.env.AWS_REGION;
        _substitutions.THING_NAME = _device.thingName;
        _substitutions.CORE_ARN = _device.thingArn;
        // _substitutions.CORE_CERTIFICATE_ARN = _device.greengrass.certificateArn;
        // _substitutions.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY = process.env.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY;

        console.log('First we will replace the following info in out templates:');
        console.log(`THING_NAME: ${_substitutions.THING_NAME}`);
        console.log(`AWS_REGION: ${process.env.AWS_REGION}`);
        console.log(`AWS_ACCOUNT: ${process.env.AWS_ACCOUNT}`);
        console.log(`CORE_ARN: ${_substitutions.CORE_ARN}`);
        console.log(`CORE_CERTIFICATE_ARN: ${_substitutions.CORE_CERTIFICATE_ARN}`);
        // console.log(`MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY: ${process.env.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY}`);

        // console.log(`Spec in: ${JSON.stringify(_ggBlueprint.spec, null, 2)}`);


        callback(null, null);
    }).catch(err => {
        callback(err, null);
    });
};
