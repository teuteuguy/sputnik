import { Component, Input, OnInit } from '@angular/core';

import { Widget, IoTPubSuberPlusHelpers } from './widget.interface';
// import { WidgetsService } from './widgets.service';

@Component({
    template: `
        <input
            [value]="value"
            [style.background]="value"
            [cpOKButton]="true"
            [cpSaveClickOutside]="false"
            [cpOKButtonClass]="'btn btn-primary btn-xs'"
            [(colorPicker)]="value"
            (colorPickerSelect)="updateValue()"
        />
    `
})
export class ColorPickerWidgetComponent implements Widget, OnInit {
    @Input() parent: IoTPubSuberPlusHelpers;
    @Input() data: any;

    // public value: string;

    get value() {
        if (this.data.type === 'shadow') {
            return this.parent.getValueByString(this.data.value);
            // this.value = this.widgetsService.getObjectValueByString(this.parent, this.data.value);
        } else {
            return this.data.value;
        }
    }

    ngOnInit() {
        // if (this.data.type === 'dynamic') {
        //     console.log(this.data.value, this.parent);
        //     this.value = this.parent.getValueByString(this.data.value);
        //     // this.value = this.widgetsService.getObjectValueByString(this.parent, this.data.value);
        // } else {
        //     this.value = this.data.value;
        // }
    }

    public updateValue() {
        if (this.data.type === 'shadow') {
            this.parent.setValueByString(this.data.value, this.value);
            this.parent.updateDesiredShadow(this.parent.device.thingName, this.parent.desired);
        } else {
            return;
        }
    }
}
