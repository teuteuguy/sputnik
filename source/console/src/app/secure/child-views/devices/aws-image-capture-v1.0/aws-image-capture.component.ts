import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from 'src/app/models/device.model';

// Services
import { IOTService } from 'src/app/services/iot.service';

@Component({
    selector: 'app-aws-image-capture-v1-0',
    templateUrl: './aws-image-capture.component.html'
})
export class AWSImageCaptureV10Component extends IoTPubSuberComponent implements OnInit {
    @Input()
    device: Device = new Device();

    latestData: any = null;
    // shadow: any = null;
    // simpleCamera: any = null;
    desired: any = null;
    reported: any = null;

    constructor(private iotService: IOTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: '$aws/things/' + this.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    this.updateIncomingShadow(data.value);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/camera',
                onMessage: data => {
                    console.log('Data:', data.value);
                    this.latestData = data.value;
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/logger',
                onMessage: data => {
                    console.log('Logger:', data.value);
                    if (data.value.hasOwnProperty('type') && data.value.type === 'info') {
                        console.log('INFO:', data.value.payload);
                    }
                    if (data.value.hasOwnProperty('type') && data.value.type === 'exception') {
                        console.error('EXCEPTION:', data.value.payload);
                    }
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);

        this.getLastState();
    }

    updateIncomingShadow(incoming) {
        if (
            incoming.hasOwnProperty('state') &&
            incoming.state.hasOwnProperty('reported') &&
            incoming.state.reported.hasOwnProperty('simpleCamera')
        ) {
            this.reported = incoming.state.reported.simpleCamera;
        }
        if (
            incoming.hasOwnProperty('state') &&
            incoming.state.hasOwnProperty('desired') &&
            incoming.state.desired.hasOwnProperty('simpleCamera')
        ) {
            this.desired = incoming.state.desired.simpleCamera;
        }
    }

    getLastState() {
        this.iotService
            .getThingShadow({
                thingName: this.device.thingName
            })
            .then(result => {
                this.updateIncomingShadow(result);
                // this.shadow = result;
                // if (
                //     this.shadow &&
                //     this.shadow.hasOwnProperty('state') &&
                //     this.shadow.state.hasOwnProperty('desired') &&
                //     this.shadow.state.desired.hasOwnProperty('simpleCamera')
                // ) {
                //     this.simpleCamera = this.shadow.state.desired.simpleCamera;
                // }
            })
            .catch(err => {
                console.error(err);
            });
    }

    desiredStateChange(field) {
        let update = false;
        if (field === 'capture') {
            this.desired.capture = this.desired.capture === 'On' ? 'Off' : 'On';
            update = true;
        }
        if (field === 's3Upload') {
            this.desired.s3Upload = this.desired.s3Upload === 'On' ? 'Off' : 'On';
            update = true;
        }
        if (update) {
            this.iotService
                .updateThingShadow({
                    thingName: this.device.thingName,
                    payload: JSON.stringify({
                        state: {
                            desired: {
                                simpleCamera: this.desired
                            }
                        }
                    })
                })
                .then(result => {
                    // this.getLastState();
                    // console.log('updateThingShadow:', result);
                    // this.shadow = result;
                    // if (
                    //     this.shadow &&
                    //     this.shadow.hasOwnProperty('state') &&
                    //     this.shadow.state.hasOwnProperty('desired') &&
                    //     this.shadow.state.desired.hasOwnProperty('simpleCamera')
                    // ) {
                    //     this.simpleCamera = this.shadow.state.desired.simpleCamera;
                    // }
                    return result;
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }
}
