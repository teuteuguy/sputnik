import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { AWSGGMiniConnectedFactoryV10Component } from './aws-gg-mini-connected-factory.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [AWSGGMiniConnectedFactoryV10Component],
    exports: [AWSGGMiniConnectedFactoryV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class AWSGGMiniConnectedFactoryV10Module {}
