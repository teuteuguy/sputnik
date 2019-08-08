import { Component, Input, OnInit } from '@angular/core';

import { Widget } from './widget.interface';

@Component({
    template: `
        <app-graph-line
            class="col-lg-6 col-md-12"
            [title]="data.title"
            [value]="realtimeData"
            type="realtime"
        ></app-graph-line>
    `
})
export class GraphRealtimeWidgetComponent implements OnInit, Widget {
    @Input() parent: any;
    @Input() data: any;

    public realtimeData;

    ngOnInit() {
        this.parent.widgetSubscriptionObservables[this.data.subscription].subscribe((message: any) => {
            if (message.hasOwnProperty(this.data.value)) {
                this.realtimeData = message[this.data.value];
            }
        });
    }
}
