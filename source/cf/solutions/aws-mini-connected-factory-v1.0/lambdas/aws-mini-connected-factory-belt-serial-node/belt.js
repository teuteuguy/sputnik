const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const events = require('events');

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

class Belt extends events.EventEmitter {

    constructor(port = '/dev/null', baud = 115200, pollerFreq = 1000) {
        super();

        console.log('Belt: init');

        this.port = new SerialPort(port, {
            baudRate: baud
        });

        this.parser = this.port.pipe(new Readline({
            delimiter: '\n'
        }));

        this.SHADOW_DESIRED = {
            "mode": 2,
            "speed": 1
        };
        this.SHADOW_REPORTED = {
            "mode": 2,
            "speed": 1
        };

        this.parser.on('data', (data) => {
            this.parseIncomingSerialLine(data, (data) => {
                // console.log('writeSerial:', data);
                this.port.write(data);
            });
        });

        this.shadowPoller = setInterval(() => {
            this.port.write('1');
        }, pollerFreq);
    }

    parseIncomingSerialLine(data, serialWrite) {

        const TELEMETRY_STRING = ' [TelemetryTask] [BELT_TELEMETRY] ';
        const SHADOW_WATCHDOGTASK_STRING = ' [WatchdogTask] [BELT_SHADOW] ';
        const SHADOW_SERIALINPUTTASK_STRING = ' [SerialInputTask] [BELT_SHADOW] ';
        const tag = 'parseIncomingSerialLine:';

        try {
            // console.log(tag, data);
            this.emit('data', data);

            let beltData = null;

            if (data.includes(TELEMETRY_STRING + '{')) {
                beltData = JSON.parse(data.split(TELEMETRY_STRING)[1]);
            }
            if (data.includes(SHADOW_WATCHDOGTASK_STRING + '{')) {
                beltData = JSON.parse(data.split(SHADOW_WATCHDOGTASK_STRING)[1]);
            }
            if (data.includes(SHADOW_SERIALINPUTTASK_STRING + '{')) {
                beltData = JSON.parse(data.split(SHADOW_SERIALINPUTTASK_STRING)[1]);
            }

            if (beltData && beltData.hasOwnProperty('state') && beltData.state.hasOwnProperty('reported')) {

                const reported = beltData.state.reported;

                this.emit('shadow', {
                    type: 'info',
                    data: reported
                });

                let needToUpdateShadow = false;

                if (reported.hasOwnProperty('speed')) {
                    if (reported.speed !== 1 && reported.speed !== 2) {
                        // console.log(tag, 'Incorrect speed reported');
                        serialWrite(getCharFor(this.SHADOW_DESIRED.speed, this.SHADOW_DESIRED.mode));
                    } else {
                        if (this.SHADOW_REPORTED.speed != reported.speed) {
                            needToUpdateShadow = true;
                            this.SHADOW_REPORTED.speed = reported.speed;
                        }
                    }
                }
                if (reported.hasOwnProperty('mode')) {
                    if (reported.mode !== 1 && reported.mode !== 2 && reported.mode !== 3) {
                        // console.log(tag, 'Incorrect mode reported');
                        serialWrite(getCharFor(this.SHADOW_DESIRED.speed, this.SHADOW_DESIRED.mode));
                    } else {
                        if (this.SHADOW_REPORTED.mode != reported.mode) {
                            needToUpdateShadow = true;
                            this.SHADOW_REPORTED.mode = reported.mode;
                        }
                    }
                }
                if (needToUpdateShadow) {
                    this.emit('shadow', {
                        type: 'reported',
                        data: this.SHADOW_REPORTED
                    });
                    // ggIoT.updateThingShadow(
                    //     payload = {
                    //         'state': {
                    //             'reported': this.SHADOW_REPORTED
                    //         }
                    //     })
                }
            }

            if (beltData && beltData.hasOwnProperty('chassis')) {
                const chassis = beltData.chassis;

                this.emit('sensors', chassis);

                // if (chassis.hasOwnProperty('x') && chassis.hasOwnProperty('y') && chassis.hasOwnProperty('z')) {
                //    // ggIoT.publish(TOPIC_FOR_SENSORS, data);
                // }

            }
            // console.log(tag, 'desired vs. reported:', this.SHADOW_DESIRED, this.SHADOW_REPORTED);
            if (this.SHADOW_REPORTED.mode != this.SHADOW_DESIRED.mode || this.SHADOW_REPORTED.speed != this.SHADOW_DESIRED.speed) {
                serialWrite(getCharFor(this.SHADOW_DESIRED.speed, this.SHADOW_DESIRED.mode));
            }

        } catch (ex) {
            this.emit('error', ex);
            // console.log('parseIncomingSerialLine: ERROR:', ex);
            // ggIoT.exception(str(ex))
        }
    }

    parseIncomingShadow(data) {
        if (data.hasOwnProperty('state') && data.state.hasOwnProperty('desired')) {
            const desired = data.state.desired;

            if (desired.hasOwnProperty('mode') && desired.mode !== this.SHADOW_DESIRED.mode) {
                this.SHADOW_DESIRED.mode = desired.mode;
            }
            if (desired.hasOwnProperty('speed') && desired.speed !== this.SHADOW_DESIRED.speed) {
                this.SHADOW_DESIRED.speed = desired.speed;
            }

            this.emit('shadow', {
                type: 'desired',
                data: this.SHADOW_DESIRED
            });
            // ggIoT.info('New Shadow Received');
        }
    }

}

module.exports = Belt;
