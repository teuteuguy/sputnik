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
    selector: 'app-default-system',
    template: `
        <app-device-child-view *ngFor="let device of devices" [device]="device"></app-device-child-view>
    `
})
export class DefaultSystemComponent implements OnInit, OnChanges {
    @Input() system: System = new System();
    public devices: Device[] = [new Device(), new Device()];

    constructor(private deviceService: DeviceService, private iotService: IoTService) {}

    ngOnInit() {
        // TODO
    }

    ngOnChanges() {
        this.ngOnInit();
    }
}
