import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { DemoSqueezenetV10Component } from './demo-squeezenet.component';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [DemoSqueezenetV10Component],
    exports: [DemoSqueezenetV10Component],
    imports: [PipesModule, CommonModule],
    providers: []
})
export class DemoSqueezenetV10Module {}
