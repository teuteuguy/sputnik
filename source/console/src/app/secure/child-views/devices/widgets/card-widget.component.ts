import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <div [ngClass]="options.class" *ngIf="options">
            <app-card>
                <card-title #title>
                    <app-widgets *ngIf="options && options.title" [widgets]="options.title" [root]="root"></app-widgets>
                </card-title>
                <card-text #text>
                    <app-widgets *ngIf="content" [widgets]="content" [root]="root"></app-widgets>
                </card-text>
            </app-card>
        </div>
    `
})
export class CardWidgetComponent implements WidgetComponent {
    @Input() root: any;
    @Input() content: any;
    @Input() options: any;
}
