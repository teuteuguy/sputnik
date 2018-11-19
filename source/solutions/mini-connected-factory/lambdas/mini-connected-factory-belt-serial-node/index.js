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

belt.on('data', (data) => {
    console.log('raw: ' + data);
});

belt.on('shadow', (data) => {
    if (data.hasOwnProperty('type')) {
        switch (data.type) {
            case 'reported':
                console.log('belt.on.shadow.reported: ' + JSON.stringify(data));
                ggIoT.updateThingShadow({
                    'state': {
                        'reported': data.data
                    }
                }, (err, data) => {
                    if (err) {
                        console.error('ERROR: updateThingShadow: ' + JSON.stringify(err));
                    } else {
                        console.log('belt.on.shadow.reported: updateThingShadow successful: ' + data);
                    }
                }, THING_NAME);
                break;
            case 'desired':
                console.log('belt.on.shadow.desired: ' + JSON.stringify(data));
                ggIoT.info('Shadow desired updated to: ' + JSON.stringify(data), (err, data) => {
                    if (err) {
                        console.error('ERROR: info: ' + JSON.stringify(err));
                    } else {
                        console.log('belt.on.shadow.desired: info successful: ' + JSON.stringify(data));
                    }
                });
                break;
            case 'info':
                console.log('belt.on.shadow.info: ' + JSON.stringify(data));
                break;
            default:
                break;
        }
    }
});

belt.on('sensors', (data) => {
    ggIoT.publish(TOPIC_FOR_SENSORS, data, (err, data) => {
        if (err) {
            console.error('ERROR publishing in belt.on.sensors: ' + JSON.stringify(err));
        } else {
            console.log('belt.on.sensors: publish successful: ' + JSON.stringify(data));
        }
    });
});

belt.on('error', (error) => {
    ggIoT.exception(error, (err, data) => {
        if (err) {
            console.error('ERROR publishing exception in belt.on.error: ' + JSON.stringify(err));
        } else {
            console.log('belt.on.error: publish successful: ' + JSON.stringify(data));
        }
    });
});

ggIoT.getThingShadow((err, data) => {
    if (err) {
        console.error('ERROR: getThingShadow: ' + JSON.stringify(err));
    } else {
        console.log('getThingShadow: ' + JSON.stringify(data));
        belt.parseIncomingShadow(data);
    }
});

exports.handler = (event, context, callback) => {
    console.log('handler: ' + JSON.stringify(event));
    console.log('handler: ' + JSON.stringify(context));

    belt.parseIncomingShadow(event);

    callback(null, 'finished');
};


process.on('SIGTERM', function () {
    console.log('Caught SIGTERM in the app. Closing serialport first');
    belt.close((err) => {
        console.log('Port closed: ' + JSON.stringify(err));
    });
    process.exit(0);
});
