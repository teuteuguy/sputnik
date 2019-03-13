const AWS = require('aws-sdk');
const cfn = new AWS.CloudFormation();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const uuid = require('uuid');

const lib = 'installAddon';

module.exports = function (event, context) {

    console.log(lib, 'Event:', JSON.stringify(event, null, 2));

    const url = 'https://' + process.env.SOURCE_BUCKET + '.s3.amazonaws.com/' + process.env.ADDONS_SOURCE_KEY_PREFIX + '/' + event.key;

    console.log(lib, 'URL:', url);

    return cfn.describeStacks({
        StackName: process.env.CFN_STACK_ID
    }).promise().then(result => {
        console.log(lib, 'Describe Stack:', result);
        console.log(lib, 'Stack Outputs:', result.Stacks[0].Outputs);
        let iamRoleForGreengrassGroups = _.find(result.Stacks[0].Outputs, (output) => {
            return output.OutputKey === 'iamRoleForGreengrassGroups';
        });

        console.log(lib, 'IAMRoleForGreengrassGroups:', iamRoleForGreengrassGroups.OutputValue);

        return true;
    });

};
