import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { GGMLLegoHatsV10Component } from './gg-ml-lego-hats.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [GGMLLegoHatsV10Component],
    exports: [GGMLLegoHatsV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class GGMLLegoHatsV10Module {}
