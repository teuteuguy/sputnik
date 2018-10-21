const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');


const lib = 'getSolutionStats';

function getSolutionStatsRecursive(lastEvalKey) {
    let params = {
        TableName: process.env.TABLE_SOLUTIONS,
        Limit: 75
    };

    if (lastEvalKey) {
        params.ExclusiveStartKey = lastEvalKey;
    }

    params.ProjectionExpression = 'id, name, thingId, solutionBlueprintId';

    return documentClient.scan(params).promise().then(results => {
        // TODO: immplement this.
        // let _stats = _.countBy(results.Items, (solution) => {
        //     return solution.connectionState.state;
        // });
        // if (!_stats.hasOwnProperty('connected')) {
        //     _stats.connected = 0;
        // }
        // if (!_stats.hasOwnProperty('disconnected')) {
        //     _stats.disconnected = 0;
        // }
        // _stats.total = results.Items.length;

        // if (results.LastEvaluatedKey) {
        //     return getSolutionStatsRecursive(result.LastEvaluatedKey).then(data => {
        //         _stats.connected += data.connected;
        //         _stats.disconnected += data.disconnected;
        //         _stats.total += data.total;
        //         return _stats;
        //     });
        // } else {
        //     return _stats;
        // }
    });
}

module.exports = function (event, context, callback) {
    if (event.cmd !== lib) {
        return callback('Wrong cmd for lib. Should be ' + lib + ', got event: ' + event, null);
    }
    getSolutionStatsRecursive().then(stats => {
        callback(null, stats);
    }).catch(err => {
        callback(err, null);
    });
};
