const DeviceTypes = require('./lib/deviceTypes');
const Settings = require('./lib/settings');
const Blueprints = require('./lib/blueprints');

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
        case 'Blueprints':
            const b = new Blueprints();
            b.factoryReset(event, context, callback);
            break;
        default:
            callback('Unknown stat, unable to resolve for arguments: ' + event, null);
            break;
    }
}

exports.handler = handler;
