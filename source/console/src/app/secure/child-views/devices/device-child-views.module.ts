import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Device } from '../../../models/device.model';

// Devices
import { AWSAFR3DBeltMiniConnectedFactoryV10Module } from './aws-afr-3d-belt-mini-connected-factory-v1.0/aws-afr-3d-belt-mini-connected-factory.module';

@Component({
    selector: 'app-device-child-view',
    template: `
        <app-aws-afr-3d-belt-mini-connected-factory-v1 *ngIf="device.deviceBlueprintId === 'aws-afr-3d-belt-mini-connected-factory-v1.0'" [device]="device"></app-aws-afr-3d-belt-mini-connected-factory-v1>
    `
})
export class DeviceChildViewComponent {
    @Input() device: Device;
}

@NgModule({
    declarations: [DeviceChildViewComponent],
    exports: [DeviceChildViewComponent],
    imports: [CommonModule, AWSAFR3DBeltMiniConnectedFactoryV10Module]
})
export class DeviceChildViewsModule {}
