import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ReInvent2018MCFV10Component } from './reinvent-2018-mcf-v1-0.component';

// Modules
import { DeviceChildViewsModule } from '../../devices/device-child-views.module';

@NgModule({
    declarations: [ReInvent2018MCFV10Component],
    exports: [ReInvent2018MCFV10Component],
    imports: [CommonModule, DeviceChildViewsModule]
})
export class ReInvent2018MCFV10Module {}
