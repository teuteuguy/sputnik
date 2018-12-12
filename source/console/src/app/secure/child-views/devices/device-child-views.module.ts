import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Device } from '@models/device.model';

// Devices
import { AFR3DBeltMiniConnectedFactoryV10Module } from './afr-3d-belt-mini-connected-factory-v1.0/afr-3d-belt-mini-connected-factory.module';
import { GGMLLegoHatsV10Module } from './gg-ml-lego-hats-v1.0/gg-ml-lego-hats.module';
import { GGMLBoxesV10Module } from './gg-ml-boxes-v1.0/gg-ml-boxes.module';
import { ImageCaptureV10Module } from './image-capture-v1.0/image-capture.module';
import { GGMLDemoSqueezenetV10Module } from './gg-ml-demo-squeezenet-v1.0/gg-ml-demo-squeezenet-v1-0.module';
import { ModelTrainerV10Module } from './model-trainer-v1.0/model-trainer.module';
import { RPI3SenseHatDemoV10Module } from './rpi3-sense-hat-demo-v1.0/rpi3-sense-hat-demo-v1-0.module';

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
        <app-gg-ml-demo-squeezenet-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId === 'gg-ml-demo-squeezenet-v1.0'"
            [device]="device"
        >
        </app-gg-ml-demo-squeezenet-v1-0>
        <app-model-trainer-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId == 'model-trainer-v1.0'"
            [device]="device"
        >
        </app-model-trainer-v1-0>
        <app-rpi3-sense-hat-demo-v1-0
            *ngIf="device && device.deviceBlueprintId && device.deviceBlueprintId == 'rpi3-sense-hat-demo-v1.0'"
            [device]="device"
        >
        </app-rpi3-sense-hat-demo-v1-0>
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
        AFR3DBeltMiniConnectedFactoryV10Module,
        GGMLLegoHatsV10Module,
        GGMLBoxesV10Module,
        ImageCaptureV10Module,
        GGMLDemoSqueezenetV10Module,
        ModelTrainerV10Module,
        RPI3SenseHatDemoV10Module
    ]
})
export class DeviceChildViewsModule {}
