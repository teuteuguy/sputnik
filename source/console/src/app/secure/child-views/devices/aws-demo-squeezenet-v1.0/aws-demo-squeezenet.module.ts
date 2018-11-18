import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { AWSDemoSqueezenetV10Component } from './aws-demo-squeezenet.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [AWSDemoSqueezenetV10Component],
    exports: [AWSDemoSqueezenetV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class AWSDemoSqueezenetV10Module {}
