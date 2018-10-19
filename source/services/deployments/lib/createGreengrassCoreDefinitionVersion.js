const AWS = require('aws-sdk');
const gg = new AWS.Greengrass();
const _ = require('underscore');
const uuid = require('uuid');


module.exports = function (spec, device, currentGreengrassGroupVersion) {

    const tag = 'createGreengrassCoreDefinitionVersion:';

    // Simple version: We'll just create it rather than check.
    // TODO: probably check if it needs changing.
    if (!spec.hasOwnProperty('CoreDefinitionVersion')) {
        // return null;
        return new Promise((resolve, reject) => resolve(null));
    } else {
        console.log(tag, 'Checking difference of CoreDefinitionVersion to:');
        let currentDefinitionId = currentGreengrassGroupVersion.Definition.CoreDefinitionVersionArn.split('/')[4];

        // spec.CoreDefinitionVersion.Id = uuid.v4();
        spec.CoreDefinitionVersion.Cores.forEach(c => c.Id = uuid.v4());

        return gg.createCoreDefinitionVersion({
            CoreDefinitionId: currentDefinitionId,
            Cores: [spec.CoreDefinitionVersion.Cores[0]]
        }).promise();
    }

};
