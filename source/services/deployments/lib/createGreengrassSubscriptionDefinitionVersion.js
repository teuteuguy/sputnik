const AWS = require('aws-sdk');
const gg = new AWS.Greengrass();
const _ = require('underscore');
const uuid = require('uuid');


module.exports = function (spec, device, currentGreengrassGroupVersion) {

    const tag = 'createGreengrassSubscriptionDefinitionVersion:';

    // Simple version: We'll just create it rather than check.
    // TODO: probably check if it needs changing.
    if (!spec.hasOwnProperty('SubscriptionDefinitionVersion')) {
        return new Promise((resolve, reject) => resolve(null));
    } else {
        console.log(tag, 'Checking difference of SubscriptionDefinitionVersion to:');
        let currentDefinitionId = currentGreengrassGroupVersion.Definition.SubscriptionDefinitionVersionArn.split('/')[4];

        spec.SubscriptionDefinitionVersion.Subscriptions.forEach(s => s.Id = uuid.v4());

        return gg.createSubscriptionDefinitionVersion({
            SubscriptionDefinitionId: currentDefinitionId,
            Subscriptions: spec.SubscriptionDefinitionVersion.Subscriptions
        }).promise();
    }

};
