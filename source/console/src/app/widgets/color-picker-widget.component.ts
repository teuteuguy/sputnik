import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <input
            [value]="value"
            [style.background]="value"
            [cpOKButton]="true"
            [cpSaveClickOutside]="false"
            [cpOKButtonClass]="'btn btn-primary btn-xs'"
            [(colorPicker)]="value"
            (colorPickerSelect)="update()"
        />
    `
})
export class ColorPickerWidgetComponent implements WidgetComponent, OnInit {
    @Input() root: any;
    @Input() data: any;

    public value: string;

    ngOnInit() {
        // const val = eval('this.root.' + this.data.value);
        // this.value = val;
        console.log('root', this.root);
    }

    public update() {
        console.log('Update');
    }
}
