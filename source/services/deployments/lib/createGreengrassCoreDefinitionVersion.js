const AWS = require('aws-sdk');
const gg = new AWS.Greengrass();
const _ = require('underscore');
const uuid = require('uuid');


module.exports = function (spec, device, currentGreengrassGroupVersion) {

    const tag = 'createGreengrassCoreDefinitionVersion:';

    // Simple version: We'll just create it rather than check.
    if (!spec.hasOwnProperty('CoreDefinitionVersion')) {
        return Promise.resolve(null);
    } else {

        spec.CoreDefinitionVersion.Cores.forEach(c => c.Id = uuid.v4());

        let promise;

        if (!currentGreengrassGroupDefinition) {
            console.log(tag, 'Core Definition needs to be created');
            promise = gg.createCoreDefinition({
                Name: uuid.v4()
            }).promise();
        } else {
            promise = Promise.resolve({
                Id: currentGreengrassGroupVersion.Definition.CoreDefinitionVersionArn.split('/')[4]
            });
        }

        return promise.then(coreDefinition => {
            return gg.createCoreDefinitionVersion({
                CoreDefinitionId: coreDefinition.Id,
                Cores: [spec.CoreDefinitionVersion.Cores[0]]
            }).promise();
        });

    }

};
