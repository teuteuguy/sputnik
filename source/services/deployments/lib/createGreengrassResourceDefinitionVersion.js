const AWS = require('aws-sdk');
const gg = new AWS.Greengrass();
const _ = require('underscore');
const uuid = require('uuid');


module.exports = function (spec, device, currentGreengrassGroupVersion) {

    const tag = 'createGreengrassResourceDefinitionVersion:';

    // Simple version: We'll just create it rather than check.
    // TODO: probably check if it needs changing.
    if (!spec.hasOwnProperty('ResourceDefinitionVersion')) {
        return new Promise((resolve, reject) => resolve(null));
    } else {
        console.log(tag, 'Checking difference of ResourceDefinitionVersion to:');
        let currentDefinitionId = currentGreengrassGroupVersion.Definition.ResourceDefinitionVersionArn.split('/')[4];

        spec.ResourceDefinitionVersion.Resources.forEach(r => {
            if (!r.hasOwnProperty('Id')) {
                r.Id = uuid.v4();
            }
        });

        return gg.createResourceDefinitionVersion({
            ResourceDefinitionId: currentDefinitionId,
            Resources: spec.ResourceDefinitionVersion.Resources
        }).promise();
    }

};
