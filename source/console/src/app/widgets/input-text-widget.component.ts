import { Component, Input, OnInit } from '@angular/core';

import { WidgetComponent } from './widget.component';

@Component({
    template: `
        <div class="input-group input-group-sm mb-3">
            <input
                type="text"
                class="form-control"
                placeholder="Text to display"
                aria-label="Text to display"
                aria-describedby="basic-addon2"
                [(ngModel)]="inputtext"
            />
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" (click)="submit()">Submit</button>
            </div>
        </div>
    `
})
export class InputTextWidgetComponent extends WidgetComponent {
    get inputtext() {
        if (typeof this.value === 'string') {
            return this.value;
        } else {
            return '';
        }
    }

    private _inputtext = '';
    set inputtext(value) {
        this._inputtext = value;
    }

    public submit(val) {
        if (this._inputtext !== '') {
            this.setValue(this._inputtext);
        }
    }
}
