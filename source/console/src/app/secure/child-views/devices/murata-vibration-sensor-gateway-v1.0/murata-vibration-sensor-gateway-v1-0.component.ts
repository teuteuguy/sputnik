import { Component, Input, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';

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

    constructor(private iotService: IOTService, private ngZone: NgZone) {
        super(iotService);
    }

    ngOnInit() {

        const self = this;

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        // self.subscribe([
        //     {
        //         topic: '$aws/things/' + self.device.thingName + '/shadow/update/accepted',
        //         onMessage: data => {
        //             self.ngZone.run(() => {
        //                 self.updateIncomingShadow(data.value);
        //             });
        //         },
        //         onError: defaultErrorCallback
        //     }
        // ]);

        self.getLastState(self.device.thingName).then(data => {
            console.log('getLastState:', data, self.desired);
        });

        $('#scanModal').on('hide.bs.modal', (e) => {
            console.log('Hide');
            self.stopScanning();
        });
    }

    showScanModal() {
        $('#scanModal').modal('show');
        this.startScanning();
    }
    closeScanModal(form: NgForm) {
        form.reset();
        $('#scanModal').modal('hide');
    }

    private startScanning() {
        this.iotService
            .updateThingShadow({
                thingName: this.device.thingName,
                payload: JSON.stringify({
                    state: {
                        desired: {
                            mode: 'scan'
                        }
                    }
                })
            })
            .then(result => {
                this.getLastState(this.device.thingName).then(data => {
                    console.log('getLastState:', data, this.desired);
                });
                return result;
            })
            .catch(err => {
                console.error(err);
            });

    }

    private stopScanning() {
        this.iotService
            .updateThingShadow({
                thingName: this.device.thingName,
                payload: JSON.stringify({
                    state: {
                        desired: {
                            mode: 'listen'
                        }
                    }
                })
            })
            .then(result => {
                this.getLastState(this.device.thingName).then(data => {
                    console.log('getLastState:', data);
                });
                return result;
            })
            .catch(err => {
                console.error(err);
            });
    }
}
