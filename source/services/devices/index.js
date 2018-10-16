const getDeviceStats = require('./lib/getDeviceStats');
const addDevice = require('./lib/addDevice');
const deleteDevice = require('./lib/deleteDevice');


function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    switch (event.cmd) {
        case 'getDeviceStats':
            getDeviceStats(event, context, callback);
            break;
        case 'addDevice':
            addDevice(event, context, callback);
            break;
        case 'deleteDevice':
            deleteDevice(event, context, callback);
            break;
        default:
            callback('Unknown cmd, unable to resolve for arguments: ' + event, null);
            break;
    }
}

exports.handler = handler;
