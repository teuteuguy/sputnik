import { Component, Input, OnInit, OnChanges } from '@angular/core';

// Models
import { Device } from '@models/device.model';
import { System } from '@models/system.model';
import { SystemBlueprint } from '@models/system-blueprint.model';

// Services
import { DeviceService } from '@services/device.service';
import { SystemBlueprintService } from '@services/system-blueprint.service';
import { IoTService } from '@services/iot.service';

@Component({
    selector: 'app-reinvent-2018-mcf-v1-0',
    templateUrl: './reinvent-2018-mcf-v1-0.component.html'
})
export class ReInvent2018MCFV10Component implements OnInit, OnChanges {
    @Input()
    system: System = new System();

    public devices: Device[] = [new Device(), new Device()];
    public inferenceDecision: any = {};

    constructor(private deviceService: DeviceService, private iotService: IoTService) {}

    ngOnInit() {
        console.log('ngInit: ', this.system.id);
        // We know that Device 0 is a belt.
        // We know that Device 1 is a camera.
        // We know this from the blueprint.
        Promise.all(
            this.system.deviceIds.map((deviceId, index) => {
                return this.deviceService.getDevice(deviceId);
            })
        )
            .then(results => {
                this.devices = results;
                if (this.devices[1] && this.devices[1].thingName) {
                    this.iotService
                        .getThingShadow({
                            thingName: this.devices[1].thingName
                        })
                        .then(shadow => {
                            console.log(shadow.state.desired.inferenceDecision);
                            this.inferenceDecision = shadow.state.desired.inferenceDecision;
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    ngOnChanges() {
        this.ngOnInit();
    }

    setCategory(category) {
        this.iotService
            .updateThingShadow({
                thingName: this.devices[1].thingName,
                payload: JSON.stringify({
                    state: {
                        desired: {
                            inferenceDecision: {
                                category: category
                            }
                        }
                    }
                })
            })
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.error(err);
            });
    }
}
