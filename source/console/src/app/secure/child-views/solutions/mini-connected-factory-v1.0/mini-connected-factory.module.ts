import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { MiniConnectedFactoryV10Component } from './mini-connected-factory.component';

// Modules
import { DeviceChildViewsModule } from '../../devices/device-child-views.module';

@NgModule({
    declarations: [MiniConnectedFactoryV10Component],
    exports: [MiniConnectedFactoryV10Component],
    imports: [CommonModule, DeviceChildViewsModule]
})
export class MiniConnectedFactoryV10Module {}
