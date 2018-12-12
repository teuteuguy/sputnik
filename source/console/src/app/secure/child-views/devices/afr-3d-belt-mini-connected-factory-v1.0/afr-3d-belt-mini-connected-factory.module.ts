import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AFR3DBeltMiniConnectedFactoryV10Component } from './afr-3d-belt-mini-connected-factory.component';

import { GaugeModule } from '../../../../common/modules/gauge/gauge.module';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [AFR3DBeltMiniConnectedFactoryV10Component],
    exports: [AFR3DBeltMiniConnectedFactoryV10Component],
    imports: [PipesModule, CommonModule, GaugeModule],
    providers: []
})
export class AFR3DBeltMiniConnectedFactoryV10Module {}
