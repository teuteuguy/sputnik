import { Component, Input, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { _ } from 'underscore';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IOTService } from '@services/iot.service';

declare var $: any;

@Component({
    selector: 'app-murata-vibration-sensor-gateway-v1-0',
    templateUrl: './murata-vibration-sensor-gateway-v1-0.component.html'
})
export class MurataVibrationSensorGatewayV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    public intervals = [
        {
            value: 'FF0202020200',
            text: '15 secs'
        },
        {
            value: 'FF0303030300',
            text: '30 secs'
        },
        {
            value: 'FF0404040400',
            text: '1 min'
        },
        {
            value: 'FF0505050500',
            text: '5 mins'
        },
        {
            value: 'FF0606060600',
            text: '10 mins'
        },
        {
            value: 'FF0707070700',
            text: '15 mins'
        },
        {
            value: 'FF0808080800',
            text: '30 mins'
        },
        {
            value: 'FF0909090900',
            text: '1 hour'
        },
        {
            value: 'FF0A0A0A0A00',
            text: '2 hours'
        },
        {
            value: 'FF0B0B0B0B00',
            text: '6 hours'
        },
        {
            value: 'FF0C0C0C0C00',
            text: '12 hours'
        },
        {
            value: 'FF0D0D0D0D00',
            text: '24 hours'
        }
    ];

    public autoConfs = [
        {
            value: '01',
            text: 'Enable'
        },
        {
            value: '00',
            text: 'Disable'
        }
    ];
    public rssiTimes = [
        {
            value: '00',
            text: 'none'
        },
        {
            value: '06',
            text: '1 min'
        },
        {
            value: '0C',
            text: '2 mins'
        },
        {
            value: '1E',
            text: '5 mins'
        },
        {
            value: '3C',
            text: '10 mins'
        }
    ];
    public retryIntervals = [
        {
            value: '00',
            text: '15 secs'
        },
        {
            value: '01',
            text: '30 secs'
        },
        {
            value: '02',
            text: '1 min'
        },
        {
            value: '03',
            text: '5 mins'
        },
        {
            value: '04',
            text: '10 mins'
        },
        {
            value: '05',
            text: '15 mins'
        },
        {
            value: '06',
            text: '30 mins'
        },
        {
            value: '07',
            text: '1 hour'
        }
    ];

    public detectRetries = Array(12);

    // 000109 FF0909090900 01 026700 01 000000 00 00 00 00 0001
    public config = {
        interval: 'FF0404040400',
        autoConf: '01',
        fft: '01',
        rssiTime: '00',
        detect: '00',
        detectRetry: '00',
        retryInterval: '00',
        rmsThreshold: '0001'
    };

    constructor(private iotService: IOTService, private ngZone: NgZone) {
        super(iotService);
    }

    ngOnInit() {
        const self = this;

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        self.getLastState(self.device.thingName).then(data => {
            // console.log('getLastState:', data, self.desired);

            self.config = self.createConfigFromString(self.desired.config);

            self.subscribe([
                {
                    topic: '$aws/things/' + self.device.thingName + '/shadow/update/accepted',
                    onMessage: message => {
                        self.ngZone.run(() => {
                            self.updateIncomingShadow(message.value);
                            if (self.desired.config) {
                                self.config = self.createConfigFromString(
                                    self.desired.config
                                );
                            }
                        });
                    },
                    onError: defaultErrorCallback
                },
                {
                    topic: 'murata/' + self.device.thingName + '/sensordata',
                    onMessage: message => {
                        console.log('Data:', message);
                    },
                    onError: defaultErrorCallback
                }
            ]);
        });
    }

    private changeMode(mode) {
        this.iotService
            .updateThingShadow({
                thingName: this.device.thingName,
                payload: JSON.stringify({
                    state: {
                        desired: {
                            mode: mode
                        }
                    }
                })
            })
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error(err);
            });
    }

    init() {
        this.changeMode('init');
    }

    scan() {
        this.iotService.updateThingShadow({
            thingName: this.device.thingName,
            payload: JSON.stringify({
                state: {
                    desired: {
                        config: this.createConfigString()
                    }
                }
            })
        });
        this.changeMode('scan');
    }

    private createConfigString() {
        // FF0909090900 01 026700 01 000000 00 00 00 00 0001
        return (
            this.config.interval +
            this.config.autoConf +
            '026700' +
            this.config.fft +
            '000000' +
            this.config.rssiTime +
            this.config.detect +
            this.config.detectRetry +
            this.config.retryInterval +
            this.config.rmsThreshold
        );
    }
    private createConfigFromString(str) {
        return {
            interval: str.substring(0, 12),
            autoConf: str.substring(12, 14),
            fft: str.substring(20, 22),
            rssiTime: str.substring(28, 30),
            detect: str.substring(30, 32),
            detectRetry: str.substring(32, 34),
            retryInterval: str.substring(34, 36),
            rmsThreshold: str.substring(36, 40)
        };
    }
}
