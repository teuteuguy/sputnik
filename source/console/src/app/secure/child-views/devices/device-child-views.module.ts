import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Device } from '../../../models/device.model';

// Pipes
// import { AppPipesModule } from '../../../pipes/pipes.module';
// import { DeviceBlueprintNameFromIdPipe } from '../../../pipes/device-blueprint-name-from-id.pipe';

// Devices
import { AWSAFR3DBeltMiniConnectedFactoryV10Module } from './aws-afr-3d-belt-mini-connected-factory-v1.0/aws-afr-3d-belt-mini-connected-factory.module';
import { AWSGGMiniConnectedFactoryV10Module } from './aws-gg-mini-connected-factory-v1.0/aws-gg-mini-connected-factory.module';
import { AWSDeeplensImageCaptureV10Module } from './aws-deeplens-image-capture-v1.0/aws-deeplens-image-capture.module';
import { AWSDeeplensDemoSqueezenetV10Module } from './aws-deeplens-demo-squeezenet-v1.0/aws-deeplens-demo-squeezenet.module';

@Component({
    selector: 'app-device-child-view',
    template: `
        <app-aws-afr-3d-belt-mini-connected-factory-v1-0
            *ngIf="
                device &&
                device.deviceBlueprintId &&
                (device.deviceBlueprintId === 'aws-afr-3d-belt-mini-connected-factory-v1.0' ||
                    device.deviceBlueprintId === 'aws-afr-3d-belt-mini-connected-factory-v1.1')
            "
            [device]="device"
        >
        </app-aws-afr-3d-belt-mini-connected-factory-v1-0>
        <app-aws-gg-mini-connected-factory-v1-0
            *ngIf="
                device &&
                device.deviceBlueprintId &&
                (device.deviceBlueprintId === 'aws-gg-mini-connected-factory-v1.0' ||
                    device.deviceBlueprintId === 'aws-gg-mini-connected-factory-v1.1')
            "
            [device]="device"
        >
        </app-aws-gg-mini-connected-factory-v1-0>
        <app-aws-deeplens-image-capture-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId === 'aws-deeplens-image-capture-v1.0'"
            [device]="device"
        >
        </app-aws-deeplens-image-capture-v1-0>
        <app-aws-deeplens-demo-squeezenet-v1-0
            *ngIf="
                device && device.deviceBlueprintId && device.deviceBlueprintId === 'aws-deeplens-demo-squeezenet-v1.0'
            "
            [device]="device"
        >
        </app-aws-deeplens-demo-squeezenet-v1-0>
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
        AWSAFR3DBeltMiniConnectedFactoryV10Module,
        AWSGGMiniConnectedFactoryV10Module,
        AWSDeeplensImageCaptureV10Module,
        AWSDeeplensDemoSqueezenetV10Module
    ]
})
export class DeviceChildViewsModule {}
