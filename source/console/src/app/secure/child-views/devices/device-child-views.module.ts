import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Device } from '../../../models/device.model';

// Pipes
// import { AppPipesModule } from '../../../pipes/pipes.module';
// import { DeviceBlueprintNameFromIdPipe } from '../../../pipes/device-blueprint-name-from-id.pipe';

// Devices
import { AFR3DBeltMiniConnectedFactoryV10Module } from './afr-3d-belt-mini-connected-factory-v1.0/afr-3d-belt-mini-connected-factory.module';
import { GGMiniConnectedFactoryV10Module } from './gg-mini-connected-factory-v1.0/gg-mini-connected-factory.module';
import { ImageCaptureV10Module } from './image-capture-v1.0/image-capture.module';
import { DemoSqueezenetV10Module } from './demo-squeezenet-v1.0/demo-squeezenet.module';

@Component({
    selector: 'app-device-child-view',
    template: `
        <app-afr-3d-belt-mini-connected-factory-v1-0
            *ngIf="
                device &&
                device.deviceBlueprintId &&
                (device.deviceBlueprintId === 'afr-3d-belt-mini-connected-factory-v1.0' ||
                    device.deviceBlueprintId === 'afr-3d-belt-mini-connected-factory-v1.1')
            "
            [device]="device"
        >
        </app-afr-3d-belt-mini-connected-factory-v1-0>
        <app-gg-mini-connected-factory-v1-0
            *ngIf="
                device &&
                device.deviceBlueprintId &&
                (device.deviceBlueprintId === 'gg-mini-connected-factory-v1.0' ||
                    device.deviceBlueprintId === 'gg-mini-connected-factory-v1.1')
            "
            [device]="device"
        >
        </app-gg-mini-connected-factory-v1-0>
        <app-image-capture-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId === 'image-capture-v1.0'"
            [device]="device"
        >
        </app-image-capture-v1-0>
        <app-demo-squeezenet-v1-0
            *ngIf="
                device && device.deviceBlueprintId && device.deviceBlueprintId === 'demo-squeezenet-v1.0'
            "
            [device]="device"
        >
        </app-demo-squeezenet-v1-0>
    `
})
export class DeviceChildViewComponent {
    @Input()
    device: Device;
}

@NgModule({
    declarations: [DeviceChildViewComponent],
    exports: [DeviceChildViewComponent],
    imports: [
        CommonModule,
        // AppPipesModule,
        AFR3DBeltMiniConnectedFactoryV10Module,
        GGMiniConnectedFactoryV10Module,
        ImageCaptureV10Module,
        DemoSqueezenetV10Module
    ]
})
export class DeviceChildViewsModule {}
