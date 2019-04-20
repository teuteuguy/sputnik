import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <div [ngClass]="options.class" *ngIf="options">{{ content }}</div>
    `
})
export class TextWidgetComponent implements WidgetComponent {
    @Input() root: any;
    @Input() content: any;
    @Input() options: any;
}
