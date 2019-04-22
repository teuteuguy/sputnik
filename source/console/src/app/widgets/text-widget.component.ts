import { Component, Input } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <div>{{ data }}</div>
    `
})
export class TextWidgetComponent implements WidgetComponent {
    @Input() root: any;
    @Input() data: any;
}
