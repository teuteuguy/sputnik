import { Component, Input } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <app-card>
            <card-header #header *ngIf="data.header">
                <app-widgets [widgets]="data.header" [root]="root"></app-widgets>
            </card-header>
            <card-title #title *ngIf="data.title">
                <app-widgets [widgets]="data.title" [root]="root"></app-widgets>
            </card-title>
            <card-subtitle #subtitle *ngIf="data.subtitle">
                <app-widgets [widgets]="data.subtitle" [root]="root"></app-widgets>
            </card-subtitle>
            <card-text #text *ngIf="data.text">
                <app-widgets [widgets]="data.text" [root]="root"></app-widgets>
            </card-text>
            <card-footer #footer *ngIf="data.footer">
                <app-widgets [widgets]="data.footer" [root]="root"></app-widgets>
            </card-footer>
        </app-card>
    `
})
export class CardWidgetComponent implements WidgetComponent {
    @Input() root: any;
    @Input() data: any;
}
