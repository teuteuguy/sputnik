import { Component, Input } from '@angular/core';

import { Widget } from './widget.interface';

@Component({
    template: `
        <div *ngIf="data">{{ data.value }}</div>
    `
})
export class TextWidgetComponent implements Widget {
    @Input() parent: any;
    @Input() data: any;
}
