const addDeployment = require('./lib/addDeployment');


function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    switch (event.cmd) {
        case 'addDeployment':
            addDeployment(event, context, callback);
            break;
        default:
            callback('Unknown cmd, unable to resolve for arguments: ' + event, null);
            break;
    }
}

exports.handler = handler;
