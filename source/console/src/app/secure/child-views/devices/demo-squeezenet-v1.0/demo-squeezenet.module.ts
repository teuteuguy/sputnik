import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { DemoSqueezenetV10Component } from './demo-squeezenet.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [DemoSqueezenetV10Component],
    exports: [DemoSqueezenetV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class DemoSqueezenetV10Module {}
