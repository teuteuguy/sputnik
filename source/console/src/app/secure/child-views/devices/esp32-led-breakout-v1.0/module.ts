import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ColorPickerModule } from 'ngx-color-picker';

import { MyComponent } from './component';

import { CardModule } from '../../../../common/modules/card/card.module';
import { GraphLineModule } from '../../../../common/modules/graph-line/graph-line.module';
import { GaugeModule } from '../../../../common/modules/gauge/gauge.module';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [MyComponent],
    exports: [MyComponent],
    imports: [PipesModule, CommonModule, FormsModule, CardModule, ColorPickerModule, GaugeModule, GraphLineModule],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class ESP32LEDBreakoutModule {}