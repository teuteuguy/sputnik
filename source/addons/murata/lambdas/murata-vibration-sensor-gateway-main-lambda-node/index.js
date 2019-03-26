const os = require('os');
const util = require('util');
const _ = require('underscore');

const Helper = new(require('./helper'))();

let iotClient;

if (os.platform() === 'darwin') {
    // testing from the MAC
    iotClient = {
        publish: function (param, callback) {
            callback(null, null);
        },
        getThingShadow: function (param, callback) {
            callback(null, {
                Payload: JSON.stringify({
                    state: {
                        desired: {
                            mode: 'idle'
                        }
                    }
                })
            })
        },
        updateThingShadow: function (param, callback) {
            callback(null, null);
        }
    }
} else {
    const ggSdk = require('./aws-greengrass-core-sdk-js');
    iotClient = new ggSdk.IotData();
}
// console.log(os.platform(), JSON.stringify(process.env, null, 2));

// const StateMachine = require('javascript-state-machine');

const THING_NAME = process.env.AWS_IOT_THING_NAME || 'Murata';
const SERIAL_PORT = process.env.SERIAL_PORT || '/dev/ttyUSB0';
const PREFIX = "murata"

const TX_TOPIC = `serial/${THING_NAME}/write${SERIAL_PORT}`;
const RX_TOPIC = `serial/${THING_NAME}/read_response${SERIAL_PORT}`;
const SHADOW_UPDATE_ACCEPTED = `$aws/things/${THING_NAME}/shadow/update/accepted`
const SHADOW_UPDATE_DELTA = `$aws/things/${THING_NAME}/shadow/update/delta`

console.log('Load: Start of the lambda function:');
console.log('Load: txTopic:                  ', TX_TOPIC);
console.log('Load: rxTopic:                  ', RX_TOPIC);
console.log('Load: shadowUpdateAcceptedTopic:', SHADOW_UPDATE_ACCEPTED);
console.log('Load: shadowUpdateDeltaTopic:   ', SHADOW_UPDATE_DELTA);

function txFunction(message) {

    iotClient.publish({
        topic: TX_TOPIC,
        payload: JSON.stringify({
            data: message + '\r\n',
            type: 'ascii'
        })
    }, (err, data) => {
        if (err) console.error(`txFunction(${message}): ERROR ${JSON.stringify(err)}`);
        else console.log(`txFunction(${message})`);
    });

}

function getThingShadow() {
    return new Promise((resolve, reject) => {
        iotClient.getThingShadow({
            thingName: THING_NAME
        }, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function updateThingShadow(payload) {
    return new Promise((resolve, reject) => {
        iotClient.updateThingShadow({
            thingName: THING_NAME,
            payload: JSON.stringify(payload)
        }, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}


class StateMachine {
    constructor() {
        this._resetSubState = 0;
        this._scanSubState = 0;
        this._state = 'idle';
        this._timeout = null;
        this._joiningNode = {
            deviceId: '',
            networkId: ''
        };
    }

    timeout(callback, time) {
        const self = this;
        self._timeout = setTimeout(() => {
            console.log(`stateMachine(${self._state}).timeout !!!`);
            callback();
        }, time);
    }

    cancelTimeout() {
        clearTimeout(this._timeout);
    }

    reset() {
        const self = this;
        console.log(`stateMachine(${self._state}).reset()`);
        updateThingShadow({
            state: {
                reported: {
                    mode: 'reset'
                }
            }
        }).then(data => {

            self._resetSubState = 0;
            self._state = 'reset';

            self.timeout(self.reset, 5000);

            console.log(`stateMachine(${self._state}).reset()`);
            txFunction('XKSLEEP');

        }).catch(err => {
            console.error(`stateMachine(${self._state}).reset(): ERROR. ${JSON.stringify(err)}`);
        });

    }

    scan() {
        const self = this;
        updateThingShadow({
            state: {
                reported: {
                    mode: 'scan'
                }
            }
        }).then(data => {
            console.log(`stateMachine(${self._state}).scan()`);

            self._scanSubState = 0;
            self._state = 'scan';
            self._joiningNode.deviceId = '';
            self._joiningNode.networkId = '';

            txFunction('XKNLISTEN 7FFF');
        }).catch(err => {
            console.error(`stateMachine(${self._state}).scan(): ERROR. ${JSON.stringify(err)}`);
        });

    }

    idle() {
        const self = this;
        updateThingShadow({
            state: {
                reported: {
                    mode: 'idle'
                }
            }
        }).then(data => {
            console.log(`stateMachine(${self._state}).idle()`);

            self._state = 'idle';

            txFunction('XKNGW 7FFF');
        }).catch(err => {
            console.error(`stateMachine(${self._state}).idle(): ERROR. ${JSON.stringify(err)}`);
        });

    }

    rx(message) {
        const self = this;
        console.log(`stateMachine(${self._state}).rx(${message})`);

        switch (self._state) {
            case 'reset':
                switch (self._resetSubState) {
                    case 0:
                        if (message === 'EWAKE') {
                            self.cancelTimeout();
                            self._resetSubState++;
                            txFunction('XKNSETINFO 35 1011 818D');
                        }
                        break;
                    case 1:
                        if (message === '35 1011 818D OK') {
                            self._resetSubState++;
                            txFunction('XKSETKEY 00000000000000000000000000000000');
                        }
                        break;
                    case 2:
                        if (message === '00000000000000000000000000000000 OK') {
                            self._resetSubState++;
                            txFunction('XKSREG S0E 1');
                        }
                        break;
                    case 3:
                        if (message === 'OK') {
                            self._resetSubState++;
                            txFunction('XKSREG S2A 0');
                        }
                        break;
                    case 4:
                        if (message === 'OK') {
                            self._resetSubState++;
                            txFunction('XK-RX 1');
                        }
                        break;
                    case 5:
                        if (message === 'OK') {
                            self._resetSubState++;
                            txFunction('XKNGW 7FFF');
                        }
                        break;
                    case 6:
                        if (message === '7FFF OK') {
                            updateThingShadow({
                                state: {
                                    desired: {
                                        mode: 'idle'
                                    },
                                    reported: {
                                        mode: 'idle'
                                    }
                                }
                            }).then(() => {
                                console.log(`stateMachine(${self._state}).rx(${message}): Done. Moving to 'idle'`);
                                self._state = 'idle';
                            }).catch(err => {
                                console.error(`ERROR: ${err}`);
                            });
                        }
                        break;
                    default:
                        // TODO: timeout and restart the reset statemachine here
                        break;
                }
                break;
            case 'scan':
                switch (self._scanSubState) {
                    case 0:
                        if (message === '7FFF OK') {
                            self._scanSubState++;
                            txFunction('XKNNOTIFY FFFFFFFFFFFF 3');
                        }
                        break;
                    case 1:
                        if (message === 'OK') {
                            // Scanning start
                            self._scanSubState++;
                        }
                        break;
                    case 2:
                        // Scanning...
                        // ENREQ 86BD 0ECD 47 0002101186BD 86BD 7FFF
                        if (message.startsWith('ENREQ')) {
                            const scanResult = message.split(' ');
                            self._joiningNode.deviceId = scanResult[1];
                            self._joiningNode.networkId = scanResult[4];
                            console.log(`stateMachine(${self._state}).rx(${message}): scan result: Device ID: ${self._joiningNode.deviceId}`);
                            console.log(`stateMachine(${self._state}).rx(${message}): scan result: Network ID: ${self._joiningNode.networkId}`);
                            txFunction(`XKNINFO ${self._joiningNode.deviceId} ${self._joiningNode.networkId} ${self._joiningNode.deviceId}`);
                            self._scanSubState++;
                            self.timeout(() => {
                                console.error(`stateMachine(${self._state}).rx(${message}): scan config failed for: Device ID: ${self._joiningNode.networkId}`);
                                // TODO: do something
                                self.reset();
                            }, 10000);
                        }
                        break;
                    case 3:
                        // 1CEF OK\r\nEACK 1 86BD 1CEF\r\nENCONF 1 0002101186BD 86BD 86BD 7FFF\r\n
                        if (message.startsWith('ENCONF')) {
                            consol.log(`stateMachine(${self._state}).rx(${message}): XKNINFO worked`);
                            self.cancelTimeout();
                            txFunction(`XKNOK ${self._joiningNode.deviceId} ${self._joiningNode.networkId}`);
                            self._scanSubState++;
                            self.timeout(() => {
                                console.error(`stateMachine(${self._state}).rx(${message}): scan config failed for: Device ID: ${self._joiningNode.networkId}`);
                                // TODO: do something
                                self.reset();
                            }, 10000);
                        }
                        break;
                    case 4:
                        if (message.startsWith('ENOK')) {
                            consol.log(`stateMachine(${self._state}).rx(${message}): XKNOK worked`);
                            cancelTimeout();
                            self.idle();
                        }
                        break;
                    default:
                        // timeout and restart the reset statemachine here
                        break;
                }
                break;
            case 'idle':
                break;
            default:
                console.error(`stateMachine.rx(): Unknown state ${self._state}`);
                break;
        }
    }
}


let stateMachine = new StateMachine();

let shadow = {};

console.log(`Init: getting shadow to start operations (getting shadow every 5 seconds)`);

function runMode(mode) {
    switch (mode) {
        case 'scan':
            stateMachine.scan();
            break;
        case 'idle':
            stateMachine.idle();
            break;
        case 'reset':
            stateMachine.reset();
            break;
        default:
            console.error(`getThingShadow(${mode}): Failure mode: This mode should not exist. Reseting it to something normal (idle).`);
            updateThingShadow({
                state: {
                    desired: {
                        mode: 'idle'
                    },
                    reported: {
                        mode: 'idle'
                    }
                }
            }).then(data => {
                console.log(`getThingShadow(${mode}): Failure mode: updateThingShadow ok`);
            }).catch(err => {
                console.error(`getThingShadow(${mode}): Failure mode: updateThingShadow failed`);
            });
            break;
    }
}

function getTS() {
    getThingShadow().then((data) => {
        // console.log(`getThingShadow: ${data.Payload}`);
        if (data.Payload) {
            const payload = JSON.parse(data.Payload);
            const state = payload.state;
            const desiredMode = state.hasOwnProperty('desired') && state.desired.hasOwnProperty('mode') && state.desired.mode;
            console.log(`getThingShadow: desired.mode: ${desiredMode}`);
            const reportedMode = state.hasOwnProperty('reported') && state.reported.hasOwnProperty('mode') && state.reported.mode;
            console.log(`getThingShadow: reported.mode: ${reportedMode}`);

            if (desiredMode !== reportedMode) runMode(desiredMode);
        }
    }).catch((err) => {
        console.error(`ERROR in getThingShadow: ${err}`);
    });
}

setInterval(getTS, 5000);
getTS();


exports.handler = function handler(event, context) {
    const topic = Helper.context(context);
    const tag = `handler(${topic})`;

    console.log(`${tag}: topic: ${topic}: ${JSON.stringify(event)}`);

    switch (topic) {
        case RX_TOPIC:
            console.log(`${tag}: rx: ${event.data}`);
            const lines = event.data.split('\r\n');
            lines.forEach((line) => {
                stateMachine.rx(line);
            });
            break;

        case SHADOW_UPDATE_DELTA:
            const deltaMode = event && event.hasOwnProperty('state') && event.state.hasOwnProperty('delta') && event.state.delta.hasOwnProperty('mode') && event.state.delta.mode;
            console.log(`${tag}: shadow: mode: ${deltaMode}`);
            runMode(deltaMode);
            break;
        case SHADOW_UPDATE_ACCEPTED:
            const desiredMode = event && event.hasOwnProperty('state') && event.state.hasOwnProperty('desired') && event.state.desired.hasOwnProperty('mode') && event.state.desired.mode;
            console.log(`${tag}: shadow: mode: ${desiredMode}`);
            runMode(desiredMode);
            break;

        default:
            console.log(`${tag}: Topic not recognized: ${topic}`);
            console.log(`${tag}: EVENT: ${JSON.stringify(event, null, 2)}`);
            break;
    }

};
