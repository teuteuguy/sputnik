const DeviceTypes = require('./lib/device-types');
const Settings = require('./lib/settings');
const DeviceBlueprints = require('./lib/device-blueprints');
const SolutionBlueprints = require('./lib/solution-blueprints');

function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    switch (event.cmd) {
        // case 'ThingGroups':
        //     const tg = new MTMThingGroups();
        //     tg.factoryReset(event, context, callback);
        //     break;
        case 'DeviceTypes':
            const deviceTypes = new DeviceTypes();
            deviceTypes.factoryReset(event, context, callback);
            break;
        case 'Settings':
            const settings = new Settings();
            settings.factoryReset(event, context, callback);
            break;
        case 'DeviceBlueprints':
            const deviceBlueprints = new DeviceBlueprints();
            deviceBlueprints.factoryReset(event, context, callback);
            break;
        case 'SolutionBlueprints':
            const solutionBlueprints = new SolutionBlueprints();
            solutionBlueprints.factoryReset(event, context, callback);
            break;
        default:
            callback('Unknown cmd, unable to resolve for arguments: ' + JSON.stringify(event), null);
            break;
    }
}

exports.handler = handler;
