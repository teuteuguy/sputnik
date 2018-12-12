import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { GGMLDemoSqueezenetV10Component } from './gg-ml-demo-squeezenet-v1-0.component';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [GGMLDemoSqueezenetV10Component],
    exports: [GGMLDemoSqueezenetV10Component],
    imports: [PipesModule, CommonModule],
    providers: []
})
export class GGMLDemoSqueezenetV10Module {}
