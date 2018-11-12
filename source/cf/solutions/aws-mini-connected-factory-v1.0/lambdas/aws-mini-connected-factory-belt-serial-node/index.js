const os = require('os');

const SYNC_SHADOW_FREQ = 1000;
const THING_NAME = process.env.THING_NAME || 'default';
const SERIALPORT_PORT = process.env.SERIALPORT_PORT || (os.platform() === 'darwin' ? '/dev/cu.SLAB_USBtoUART' : '/dev/null');
const SERIALPORT_SPEED = process.env.SERIALPORT_SPEED || 115200;

const PREFIX = 'mtm';
const TOPIC_FOR_SENSORS = PREFIX + '/' + THING_NAME + '/sensors';

const Belt = require('./belt');
const belt = new Belt(SERIALPORT_PORT, parseInt(SERIALPORT_SPEED), SYNC_SHADOW_FREQ);

const GGIOT = require('./ggiot');
const ggIoT = new GGIOT(THING_NAME, PREFIX);

// belt.on('data', (data) => {
//     console.log('raw:', data);
// });

belt.on('shadow', (data) => {
    let action = null;
    if (data.hasOwnProperty('type')) {
        switch (data.type) {
            case 'reported':
                action = ggIoT.updateThingShadow({
                    'state': {
                        'reported': data
                    }
                });
                break;
            case 'desired':
                action = ggIoT.info('Shadow desired updated to: ' + JSON.stringify(data));
                break;
            case 'info':
                // console.log('shadow:', data);
                break;
            default:
                break;
        }
    }
    if (action) {
        action.then().catch(err => {
            console.error('ERROR in belt.on.shadow:', err);
        });
    }
});
belt.on('sensors', (data) => {
    ggIoT.publish(TOPIC_FOR_SENSORS, data).then().catch(err => {
        console.error('ERROR publishing in belt.on.sensors:', data, err);
    });
});

belt.on('error', (error) => {
    ggIoT.exception(error).then();
});

belt.parseIncomingShadow(ggIoT.getThingShadow());

exports.handler = (event) => {
    console.log('handler:', JSON.stringify(event, null, 2));
    belt.parseIncomingShadow(event);
    return;
};
