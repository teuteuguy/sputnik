import { Component, Input, OnInit, OnChanges} from '@angular/core';

// Models
import { Device } from 'src/app/models/device.model';
import { Solution } from 'src/app/models/solution.model';
import { SolutionBlueprint } from 'src/app/models/solution-blueprint.model';

// Services
import { DeviceService } from 'src/app/services/device.service';
import { SolutionBlueprintService } from 'src/app/services/solution-blueprint.service';


@Component({
    selector: 'app-mini-connected-factory-v1',
    templateUrl: './mini-connected-factory.component.html'
})
export class MiniConnectedFactoryV10Component implements OnInit, OnChanges {
    @Input()
    solution: Solution = new Solution();

    public devices: Device[] = [new Device(), new Device()];

    constructor(private deviceService: DeviceService) {
    }

    ngOnInit() {
        // We know that Device 0 is a belt.
        // We know that Device 1 is a camera.
        // We know this from the blueprint.
        Promise.all(this.solution.deviceIds.map((deviceId, index) => {
                return this.deviceService.getDevice(deviceId);
            }))
            .then(results => (this.devices = results))
            .catch(err => {
                console.error(err);
            });
    }

    ngOnChanges() {
        this.ngOnInit();
    }
}
