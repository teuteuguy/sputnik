import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Device } from '@models/device.model';

// Devices
import { DefaultModule } from './default/default.module';
import { AFR3DBeltSerialV10Module } from './3d-belt-serial-v1.0/3d-belt-serial-v1-0.module';
import { GGMLLegoHatsV10Module } from './gg-ml-lego-hats-v1.0/gg-ml-lego-hats.module';
import { GGMLBoxesV10Module } from './gg-ml-boxes-v1.0/gg-ml-boxes.module';
import { ImageCaptureV10Module } from './image-capture-v1.0/image-capture.module';
import { GGMLDemoSqueezenetV10Module } from './gg-ml-demo-squeezenet-v1.0/gg-ml-demo-squeezenet-v1-0.module';
import { ModelTrainerV10Module } from './model-trainer-v1.0/model-trainer.module';
import { RPI3SenseHatDemoV10Module } from './rpi3-sense-hat-demo-v1.0/rpi3-sense-hat-demo-v1-0.module';
import { ESP32LEDBreakoutModule } from './esp32-led-breakout-v1.0/module';

import { MurataVibrationSensorGatewayV10Module } from './murata-vibration-sensor-gateway-v1.0/murata-vibration-sensor-gateway-v1-0.module';
import { MurataVibrationSensorNodeV10Module } from './murata-vibration-sensor-node-v1.0/murata-vibration-sensor-node-v1.0.module';

@Component({
    selector: 'app-device-child-view',
    templateUrl: './device-child-views.component.html'
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
        DefaultModule,
        AFR3DBeltSerialV10Module,
        ESP32LEDBreakoutModule,
        GGMLLegoHatsV10Module,
        GGMLBoxesV10Module,
        ImageCaptureV10Module,
        GGMLDemoSqueezenetV10Module,
        ModelTrainerV10Module,
        RPI3SenseHatDemoV10Module,
        MurataVibrationSensorGatewayV10Module,
        MurataVibrationSensorNodeV10Module
    ]
})
export class DeviceChildViewsModule {}
