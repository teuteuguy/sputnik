const getSolutionStats = require('./lib/getSolutionStats');
const addSolution = require('./lib/addSolution');
const deleteSolution = require('./lib/deleteSolution');


function handler(event, context, callback) {
    console.log('Event:', JSON.stringify(event, null, 2));

    switch (event.cmd) {
        case 'getSolutionStats':
            getSolutionStats(event, context, callback);
            break;
        case 'addSolution':
            addSolution(event, context, callback);
            break;
        case 'deleteSolution':
            deleteSolution(event, context, callback);
            break;
        default:
            callback('Unknown cmd, unable to resolve for arguments: ' + event, null);
            break;
    }
}

exports.handler = handler;
