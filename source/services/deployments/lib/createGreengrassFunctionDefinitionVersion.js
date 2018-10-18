const AWS = require('aws-sdk');
const gg = new AWS.Greengrass();
const _ = require('underscore');
const uuid = require('uuid');


module.exports = function (spec, device, currentGreengrassGroupVersion) {

    const tag = 'createGreengrassFunctionDefinitionVersion:';

    // Simple version: We'll just create it rather than check.
    // TODO: probably check if it needs changing.
    if (!spec.hasOwnProperty('FunctionDefinitionVersion')) {
        return new Promise((resolve, reject) => resolve(null));
    } else {
        console.log(tag, 'Checking difference of FunctionDefinitionVersion to:');
        let currentFunctionDefinitionId = currentGreengrassGroupVersion.Definition.FunctionDefinitionVersionArn.split('/')[4];

        spec.FunctionDefinitionVersion.Functions.forEach(f => f.Id = uuid.v4());

        return gg.createFunctionDefinitionVersion({
            FunctionDefinitionId: currentFunctionDefinitionId,
            Functions: spec.FunctionDefinitionVersion.Functions
        }).promise();
    }

};
