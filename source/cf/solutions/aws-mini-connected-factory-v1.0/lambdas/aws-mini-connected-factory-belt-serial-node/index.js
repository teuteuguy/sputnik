const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const os = require('os');

const port = new SerialPort('/dev/cu.SLAB_USBtoUART', {
    baudRate: 115200
});
const parser = port.pipe(new Readline({
    delimiter: '\n'
}));


console.log(os.platform());

if (os.platform() === 'darwin') {
    // The mac
    const toto = 'titi';
}


const GGIOT_c = require('./ggiot');
GGIOT = new GGIOT_c();


let SHADOW_DESIRED = {
    "mode": 2,
    "speed": 1
};
let SHADOW_REPORTED = {
    "mode": 2,
    "speed": 1
};


function getCharFor(speed, mode) {
    let char = '5';

    if (speed === 1) {
        if (mode === 1) {
            char = '4';
        } else if (mode === 2) {
            char = '5';
        } else if (mode === 3) {
            char = '6';
        }
    } else if (speed === 2) {
        if (mode === 1) {
            char = '3';
        } else if (mode === 2) {
            char = '5';
        } else if (mode === 3) {
            char = '7';
        }
    }

    return char;
}


exports.handler = (event) => {

    console.log('handler:', JSON.stringify(event, null, 2));

    if (event.hasOwnProperty('state') && event.state.hasOwnProperty('desired')) {
        const desired = event.state.desired;

        if (desired.hasOwnProperty('mode') && desired.mode !== SHADOW_DESIRED.mode) {
            SHADOW_DESIRED.mode = desired.mode;
        }
        if (desired.hasOwnProperty('speed') && desired.speed !== SHADOW_DESIRED.speed) {
            SHADOW_DESIRED.speed = desired.speed;
        }

        GGIOT.info('New Shadow Received');
    }

    return;
};


function parseIncomingSerialLine(data, serialWrite) {

    const TELEMETRY_STRING = ' [TelemetryTask] [BELT_TELEMETRY] ';
    const SHADOW_STRING = ' [WatchdogTask] [BELT_SHADOW] ';
    const tag = 'parseIncomingSerialLine:';

    try {
        // console.log(tag, data);

        let beltData = null;


        if (data.includes(TELEMETRY_STRING + '{')) {
            beltData = JSON.parse(data.split(TELEMETRY_STRING)[1]);
        }
        if (data.includes(SHADOW_STRING + '{')) {
            beltData = JSON.parse(data.split(SHADOW_STRING)[1]);
        }

        if (beltData && beltData.hasOwnProperty('state') && beltData.state.hasOwnProperty('reported')) {

            const reported = beltData.state.reported;
            let needToUpdateShadow = false;

            if (reported.hasOwnProperty('speed')) {
                if (reported.speed !== 1 && reported.speed !== 2) {
                    console.log(tag, 'Incorrect speed reported');
                    serialWrite(getCharFor(SHADOW_DESIRED.speed, SHADOW_DESIRED.mode));
                } else {
                    if (SHADOW_REPORTED.speed != reported.speed) {
                        needToUpdateShadow = true;
                        SHADOW_REPORTED.speed = reported.speed;
                    }
                }

                if (reported.hasOwnProperty('mode')) {
                    if (reported.mode !== 1 && reported.mode !== 2 && reported.mode !== 3) {
                        console.log(tag, 'Incorrect mode reported');
                        serialWrite(getCharFor(SHADOW_DESIRED.speed, SHADOW_DESIRED.mode));
                    } else {
                        if (SHADOW_REPORTED.mode != reported.mode) {
                            needToUpdateShadow = true;
                            SHADOW_REPORTED.mode = reported.mode;
                        }
                    }
                }

                if (needToUpdateShadow) {
                    // GGIOT.updateThingShadow(
                    //     payload = {
                    //         'state': {
                    //             'reported': SHADOW_REPORTED
                    //         }
                    //     })
                }


            }
            if (beltData && beltData.hasOwnProperty('chassis')) {
                const chassis = beltData.chassis;
                if (chassis.hasOwnProperty('x') && chassis.hasOwnProperty('y') && chassis.hasOwnProperty('z')) {
                    // GGIOT.publish(TOPIC_FOR_SENSORS, data);
                }

            }
            console.log(tag, 'desired vs. reported:', SHADOW_DESIRED, SHADOW_REPORTED);
            if (SHADOW_REPORTED.mode != SHADOW_DESIRED.mode || SHADOW_REPORTED.speed != SHADOW_DESIRED.speed) {
                serialWrite(getCharFor(SHADOW_DESIRED.speed, SHADOW_DESIRED.mode));
            }
        }

    } catch (ex) {
        console.log('parseIncomingSerialLine: ERROR:', ex);
        // GGIOT.exception(str(ex))
    }
}

parser.on('data', (data) => {
    parseIncomingSerialLine(data, (data) => {
        console.log('writeSerial:', data);
    });
});
