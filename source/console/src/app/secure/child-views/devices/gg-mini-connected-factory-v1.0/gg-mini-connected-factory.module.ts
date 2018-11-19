import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { GGMiniConnectedFactoryV10Component } from './gg-mini-connected-factory.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [GGMiniConnectedFactoryV10Component],
    exports: [GGMiniConnectedFactoryV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class GGMiniConnectedFactoryV10Module {}
