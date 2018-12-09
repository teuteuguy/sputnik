import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Device } from '@models/device.model';

// Pipes
// import { PipesModule } from '../../../pipes/pipes.module';
// import { DeviceBlueprintNameFromIdPipe } from '../../../pipes/device-blueprint-name-from-id.pipe';

// Devices
import { AFR3DBeltMiniConnectedFactoryV10Module } from './afr-3d-belt-mini-connected-factory-v1.0/afr-3d-belt-mini-connected-factory.module';
import { GGMLLegoHatsV10Module } from './gg-ml-lego-hats-v1.0/gg-ml-lego-hats.module';
import { GGMLBoxesV10Module } from './gg-ml-boxes-v1.0/gg-ml-boxes.module';
import { ImageCaptureV10Module } from './image-capture-v1.0/image-capture.module';
import { DemoSqueezenetV10Module } from './demo-squeezenet-v1.0/demo-squeezenet.module';
import { ModelTrainerV10Module } from './model-trainer-v1.0/model-trainer.module';

@Component({
    selector: 'app-device-child-view',
    template: `
        <app-afr-3d-belt-mini-connected-factory-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId === 'afr-3d-belt-v1.0'"
            [device]="device"
        >
        </app-afr-3d-belt-mini-connected-factory-v1-0>
        <app-gg-ml-lego-hats-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId === 'gg-ml-lego-hats-v1.0'"
            [device]="device"
        >
        </app-gg-ml-lego-hats-v1-0>
        <app-gg-ml-boxes-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId === 'gg-ml-boxes-v1.0'"
            [device]="device"
        >
        </app-gg-ml-boxes-v1-0>
        <app-image-capture-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId === 'image-capture-v1.0'"
            [device]="device"
        >
        </app-image-capture-v1-0>
        <app-demo-squeezenet-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId === 'demo-squeezenet-v1.0'"
            [device]="device"
        >
        </app-demo-squeezenet-v1-0>
        <app-model-trainer-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId == 'model-trainer-v1.0'" [device]="device"
        >
        </app-model-trainer-v1-0>
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
        // PipesModule,
        AFR3DBeltMiniConnectedFactoryV10Module,
        GGMLLegoHatsV10Module,
        GGMLBoxesV10Module,
        ImageCaptureV10Module,
        DemoSqueezenetV10Module,
        ModelTrainerV10Module
    ]
})
export class DeviceChildViewsModule {}
