import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ColorPickerModule } from 'ngx-color-picker';
import { CardModule } from '../common/modules/card/card.module';
import { GraphLineModule } from '../common/modules/graph-line/graph-line.module';
import { GaugeModule } from '../common/modules/gauge/gauge.module';


// Widgets
// import { WidgetDirective } from './widget.directive';
import { WidgetsComponent } from './widgets.component';
import { CardWidgetComponent } from './card-widget.component';
import { ColorPickerWidgetComponent } from './color-picker-widget.component';
import { TextWidgetComponent } from './text-widget.component';

// import { WidgetsService } from './widgets.service';

// Pipes
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
    declarations: [WidgetsComponent, CardWidgetComponent, ColorPickerWidgetComponent, TextWidgetComponent],
    entryComponents: [CardWidgetComponent, ColorPickerWidgetComponent, TextWidgetComponent],
    exports: [WidgetsComponent],
    imports: [PipesModule, CommonModule, FormsModule, CardModule, ColorPickerModule, GaugeModule, GraphLineModule],
    // providers: [WidgetsService],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class WidgetsModule {}
