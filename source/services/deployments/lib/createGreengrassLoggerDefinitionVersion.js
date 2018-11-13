const AWS = require('aws-sdk');
const gg = new AWS.Greengrass();
const _ = require('underscore');
const uuid = require('uuid');


module.exports = function (spec, device, currentGreengrassGroupVersion) {

    const tag = 'createGreengrassLoggerDefinitionVersion:';

    // Simple version: We'll just create it rather than check.
    // TODO: probably check if it needs changing.
    if (!spec.hasOwnProperty('LoggerDefinitionVersion')) {
        return new Promise((resolve, reject) => resolve(null));
    } else {
        console.log(tag, 'Checking difference of LoggerDefinitionVersion to:');
        let currentDefinitionId = currentGreengrassGroupVersion.Definition.LoggerDefinitionVersionArn.split('/')[4];

        spec.LoggerDefinitionVersion.Loggers.forEach(l => l.Id = uuid.v4());

        return gg.createLoggerDefinitionVersion({
            LoggerDefinitionId: currentDefinitionId,
            Loggers: spec.LoggerDefinitionVersion.Loggers
        }).promise();
    }

};
