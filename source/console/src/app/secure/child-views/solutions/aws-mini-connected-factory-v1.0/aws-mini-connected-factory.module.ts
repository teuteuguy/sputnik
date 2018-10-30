import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { AWSMiniConnectedFactoryV10Component } from './aws-mini-connected-factory.component';

// Modules
import { DeviceChildViewsModule } from '../../devices/device-child-views.module';

@NgModule({
    declarations: [AWSMiniConnectedFactoryV10Component],
    exports: [AWSMiniConnectedFactoryV10Component],
    imports: [CommonModule, DeviceChildViewsModule]
})
export class AWSMiniConnectedFactoryV10Module {}
