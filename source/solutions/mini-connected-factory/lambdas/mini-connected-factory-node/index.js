const helpers = require('helpers');

exports.handler = (event, context, callback) => {
    console.log('handler: ' + JSON.stringify(event));
    console.log('topic:' + helpers.topic(context));

    callback(null, 'finished');
};


process.on('SIGTERM', function () {
    console.log('Caught SIGTERM in the app. Closing serialport first');
    process.exit(0);
});
