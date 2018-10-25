const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');


const lib = 'getSolutionStats';

function getSolutionStatsRecursive(lastEvalKey) {

    console.log(lib, lastEvalKey);

    let params = {
        TableName: process.env.TABLE_SOLUTIONS,
        Limit: 75
    };

    if (lastEvalKey) {
        params.ExclusiveStartKey = lastEvalKey;
    }

    params.ProjectionExpression = 'id, thingId, solutionBlueprintId';

    return documentClient.scan(params).promise().then(results => {
        console.log('scan', results.Items.length);
        let _stats = {
            total: results.Items.length
        };
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

        if (results.LastEvaluatedKey) {
            return getSolutionStatsRecursive(result.LastEvaluatedKey).then(data => {
                // _stats.connected += data.connected;
                // _stats.disconnected += data.disconnected;
                _stats.total += data.total;
                return _stats;
            });
        } else {
            return _stats;
        }
    });
}

module.exports = function (event, context, callback) {
    return getSolutionStatsRecursive();
};
