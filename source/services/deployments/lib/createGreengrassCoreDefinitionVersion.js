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

    // let ggSDK = new AWS.Greengrass(this.greengrassConfig);
    // let spec = ggBlueprint.spec;
    // if (!spec.hasOwnProperty('CoreDefinitionVersion') || !currentGreengrassGroupVersion.Definition.hasOwnProperty('CoreDefinitionVersionArn')) {
    //     if (!spec.hasOwnProperty('CoreDefinitionVersion')) {
    //         // Current GG Group does not have a core attached to it. This is a problem. We must exit here.
    //         throw `FAIL: Spec doesn't have a Core`;
    //     }
    //     if (!currentGreengrassGroupVersion.Definition.hasOwnProperty('CoreDefinitionVersionArn')) {
    //         throw `MASSIVE FAIL: Greengrass Group: ${device.greengrass.groupId} does not have a Core ???`;
    //     }
    // } else {
    //     Logger.log(Logger.levels.INFO, 'Checking difference of CoreDefinitionVersion to:');
    //     let currentCoreDefinitionId = currentGreengrassGroupVersion.Definition.CoreDefinitionVersionArn.split('/')[4];
    //     let currentCoreDefinitionVersionId = currentGreengrassGroupVersion.Definition.CoreDefinitionVersionArn.split('/')[6];

    //     return ggSDK.getCoreDefinitionVersion({
    //         CoreDefinitionId: currentCoreDefinitionId,
    //         CoreDefinitionVersionId: currentCoreDefinitionVersionId
    //     }).promise().then(coreDefinitionVersion => {
    //         if (coreDefinitionVersion.Definition.Cores.length !== 1) {
    //             throw `FAIL: Greengrass Core ARN ${currentGreengrassGroupVersion.Definition.CoreDefinitionVersionArn} doesn't have a core attached to it`;
    //         }

    //         let core = coreDefinitionVersion.Definition.Cores[0];

    //         Logger.log(Logger.levels.INFO, `${coreDefinitionVersion} vs. ${core}`);

    //         if (core.CertificateArn !== spec.CoreDefinitionVersion.CertificateArn ||
    //             core.ThingArn !== spec.CoreDefinitionVersion.ThingArn ||
    //             core.SyncShadow !== spec.CoreDefinitionVersion.SyncShadow) {
    //             Logger.log(Logger.levels.INFO, 'CoreDefinitionVersion is different. Need to create a new one:');
    //             spec.CoreDefinitionVersion.Id = uuid.v4();
    //             return ggSDK.createCoreDefinitionVersion({
    //                 CoreDefinitionId: currentCoreDefinitionId,
    //                 Cores: [spec.CoreDefinitionVersion]
    //             }).promise();
    //         } else {
    //             return null;
    //         }
    //     });
    // }
};
