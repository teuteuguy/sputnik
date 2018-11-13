import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AWSAFR3DBeltMiniConnectedFactoryV10Component } from './aws-afr-3d-belt-mini-connected-factory.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [AWSAFR3DBeltMiniConnectedFactoryV10Component],
    exports: [AWSAFR3DBeltMiniConnectedFactoryV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class AWSAFR3DBeltMiniConnectedFactoryV10Module {}
