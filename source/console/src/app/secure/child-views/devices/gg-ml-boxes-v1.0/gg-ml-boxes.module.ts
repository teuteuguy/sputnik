import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { GGMLBoxesV10Component } from './gg-ml-boxes.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [GGMLBoxesV10Component],
    exports: [GGMLBoxesV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class GGMLBoxesV10Module {}
