import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '@common-secure/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IOTService } from '@services/iot.service';

@Component({
    selector: 'app-image-capture-v1-0',
    templateUrl: './image-capture.component.html'
})
export class ImageCaptureV10Component extends IoTPubSuberComponent implements OnInit {
    @Input()
    device: Device = new Device();

    private shadowField = 'simpleCamera';

    latestData: any = null;

    constructor(private iotService: IOTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: '$aws/things/' + this.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    this.updateIncomingShadow(data.value, this.shadowField);
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

        this.getLastState(this.device.thingName, this.shadowField);
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
