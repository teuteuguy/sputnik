import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { GGMLLegoHatsV10Component } from './gg-ml-lego-hats.component';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [GGMLLegoHatsV10Component],
    exports: [GGMLLegoHatsV10Component],
    imports: [PipesModule, CommonModule],
    providers: []
})
export class GGMLLegoHatsV10Module {}
