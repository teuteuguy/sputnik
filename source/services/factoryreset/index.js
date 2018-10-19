const DeviceTypes = require('./lib/device-types');
const Settings = require('./lib/settings');
const DeviceBlueprints = require('./lib/device-blueprints');

function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    switch (event.cmd) {
        // case 'ThingGroups':
        //     const tg = new MTMThingGroups();
        //     tg.factoryReset(event, context, callback);
        //     break;
        case 'DeviceTypes':
            const dt = new DeviceTypes();
            dt.factoryReset(event, context, callback);
            break;
        case 'Settings':
            const s = new Settings();
            s.factoryReset(event, context, callback);
            break;
        case 'DeviceBlueprints':
            const b = new DeviceBlueprints();
            b.factoryReset(event, context, callback);
            break;
        default:
            callback('Unknown stat, unable to resolve for arguments: ' + event, null);
            break;
    }
}

exports.handler = handler;
