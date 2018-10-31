const libs = require('./libs');

function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    let promise = null;

    switch (event.cmd) {
        case 'getSolutionStats':
            promise = libs.getSolutionStats;
            break;
        case 'addSolution':
            promise = libs.addSolution;
            break;
        case 'deleteSolution':
            promise = libs.deleteSolution;
            break;
        case 'refreshSolution':
            promise = libs.refreshSolution;
            break;
        default:
            callback('Unknown cmd, unable to resolve for arguments: ' + JSON.stringify(event), null);
            break;
    }

    if (promise) {
        promise(event, context).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    }
}

exports.handler = handler;
