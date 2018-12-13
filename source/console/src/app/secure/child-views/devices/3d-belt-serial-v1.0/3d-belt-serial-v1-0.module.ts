import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AFR3DBeltSerialV10Component } from './3d-belt-serial-v1-0.component';

import { GaugeModule } from '../../../../common/modules/gauge/gauge.module';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [AFR3DBeltSerialV10Component],
    exports: [AFR3DBeltSerialV10Component],
    imports: [PipesModule, CommonModule, GaugeModule],
    providers: []
})
export class AFR3DBeltSerialV10Module {}
