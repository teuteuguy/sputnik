import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { AWSDeeplensDemoSqueezenetV10Component } from './aws-deeplens-demo-squeezenet.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [AWSDeeplensDemoSqueezenetV10Component],
    exports: [AWSDeeplensDemoSqueezenetV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class AWSDeeplensDemoSqueezenetV10Module {}
