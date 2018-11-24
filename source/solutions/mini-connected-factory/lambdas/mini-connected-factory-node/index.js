const helpers = require('helpers');

const THING_NAME_CAMERA = process.env.THING_NAME_CAMERA;
const THING_NAME_BELT = process.env.THING_NAME_BELT;
const PREFIX = 'mtm';
const TOPIC_SENSORS = PREFIX + '/' + THING_NAME_BELT + '/sensors';
const TOPIC_TRIGGER = 'make/inference';

const GGIOT = require('./ggiot');
const ggIoT = new GGIOT(THING_NAME_BELT);

console.log("");
console.log("Start of Lambda function");
console.log("THING_NAME_BELT: " + THING_NAME_BELT);
console.log("TOPIC_SENSORS: " + TOPIC_SENSORS);
console.log("");
console.log("");

function getBeltState() {
    return new Promise(function (resolve, reject) {
        ggIoT.getThingShadow(function (err, data) {
            if (err) return reject(err);
            resolve(data);
        });
    }).then(data => {
        if (data && data.hasOwnProperty('state') && data.state.hasOwnProperty('reported')) {
            return data.state.reported;
        } else {
            throw 'Cant read shadow';
        }
    });
}

function isStopped(reported) {
    return reported.mode === 2;
}

function isRunning(reported) {
    return reported.mode !== 2;
}

function sensor1(event) {
    return event.proximity['1'] === 1;
}
function sensor2(event) {
    return event.proximity['2'] === 1;
}

function turnBeltOff() {
    return new Promise(function (resolve, reject) {
        ggIoT.updateThingShadow({
            state: {
                desired: {
                    mode: 2,
                    speed: 1
                }
            }
        }, function (err, data) {
            if (err) return reject(err);
            resolve(data);
        });
    });
}
function turnBeltOn() {
    return new Promise(function (resolve, reject) {
        ggIoT.updateThingShadow({
            state: {
                desired: {
                    mode: 3,
                    speed: 1
                }
            }
        }, function (err, data) {
            if (err) {
                console.log('Error in the turnBeltOn:', JSON.stringify(err));
                reject(err);
            } else {
                resolve(data);
            }

        });
    });
}
function triggerPicture() {
    return new Promise(function (resolve, reject) {
        ggIoT.publish(TOPIC_TRIGGER, {}, (err, data) => {
            if (err) {
                console.error('triggerPicture: there was a problem: ' + JSON.stringify(err));
            }
            console.log('triggerPicture: result:' + data);
            return data;
        });
    });
}

exports.handler = (event, context, callback) => {
    console.log('handler: event:' + JSON.stringify(event));
    const topic = helpers.topic(context);
    console.log('handler: topic: ' + helpers.topic(context));
    console.log('handler: checking against: ' + TOPIC_SENSORS);

    if (topic === TOPIC_SENSORS) {
        console.log('handler: Handling sensor data.');
        if (event.hasOwnProperty('proximity')) {

            if (event.proximity['1'] === 1 || event.proximity['2'] === 1) {

                getBeltState().then(reported => {

                    if (sensor2(event) && isRunning(reported)) {
                        console.log('handler: Need to stop the belt.');
                        return turnBeltOff().then(data => {
                            return triggerPicture();
                        });
                    }

                    if (sensor1(event) && !isRunning(reported)) {
                        console.log('handler: Need to start the belt.');
                        return turnBeltOn().then(data => {
                            return {};
                        });
                    }

                    return null;

                }).then(result => {

                    console.log('handler: done');
                    callback(null, 'finished');

                }).catch(err => {
                    console.error('handler: error: ' + JSON.stringify(err));
                    callback(null, 'finished');
                })

            }

        }
    } else {
        callback(null, 'finished');
    }
};


// process.on('SIGTERM', function () {
//     console.log('Caught SIGTERM in the app. Closing serialport first');
//     process.exit(0);
// });
