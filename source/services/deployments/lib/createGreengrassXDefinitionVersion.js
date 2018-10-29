const AWS = require('aws-sdk');
const gg = new AWS.Greengrass();
const _ = require('underscore');
const uuid = require('uuid');


module.exports = function (key, spec, currentGreengrassGroupDefinitionVersion) {

    const tag = 'createGreengrass' + key + 'DefinitionVersion';
    console.log(tag);

    // Simple version: We'll just create it rather than check.
    if (!spec.hasOwnProperty(key + 'DefinitionVersion')) {
        console.log(tag, key + 'DefinitionVersion not found in spec. Returning.');
        return Promise.resolve(null);
    } else {

        let promise;

        spec[key + 'DefinitionVersion'][key + 's'].forEach(o => {
            if (!o.hasOwnProperty('Id')) {
                o.Id = uuid.v4();
            }
        });

        if (!currentGreengrassGroupDefinitionVersion || !currentGreengrassGroupDefinitionVersion.Definition[key + 'DefinitionVersionArn']) {
            console.log(tag, key + 'DefinitionVersion', 'needs creating');
            promise = gg['create' + key + 'Definition']({
                Name: uuid.v4()
            }).promise();
        } else {
            console.log(tag, key + 'DefinitionVersion exists', currentGreengrassGroupDefinitionVersion);
            promise = Promise.resolve({
                Id: currentGreengrassGroupDefinitionVersion.Definition[key + 'DefinitionVersionArn'].split('/')[4]
            });
        }

        return promise.then(definition => {
            console.log('Using definition Id', definition.Id);
            let params = {};
            params[key + 'DefinitionId'] = definition.Id;
            params[key + 's'] = spec[key + 'DefinitionVersion'][key + 's'];
            return gg['create' + key + 'DefinitionVersion'](params).promise();
        });

    }

};
