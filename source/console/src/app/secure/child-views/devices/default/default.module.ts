import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DefaultComponent } from './default.component';

// import { WidgetsModule } from '../../../../widgets/widgets.module';
import { WidgetsModule } from '@app/widgets/widgets.module';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [DefaultComponent],
    exports: [DefaultComponent],
    imports: [
        PipesModule,
        CommonModule,
        FormsModule,
        WidgetsModule
    ],
    providers: [],
    schemas: []
})
export class DefaultModule {}
