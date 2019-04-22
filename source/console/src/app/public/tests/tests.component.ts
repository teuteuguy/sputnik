import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-tests',
    template: `
        <app-widgets [widgets]="widgets" [root]="root" style="color: black;"></app-widgets>
    `
})
export class TestsComponent implements OnInit {
    public title = 'Tests';
    public root: any;
    public widgets: any;

    ngOnInit() {
        this.root = this;
        this.widgets = [
            {
                data: {
                    text: [
                        {
                            data: 'LEDs',
                            type: 'text',
                            class: 'col-12'
                        },
                        {
                            data: {
                                value: 'desired.led[0]'
                            },
                            type: 'color-picker',
                            class: 'col-12'
                        }
                    ],
                    title: [
                        {
                            data: 'Peripherals 1',
                            type: 'text',
                            class: 'col-12'
                        }
                    ]
                },
                type: 'card',
                class: 'col-lg-4 col-sm-12'
            },
            {
                data: {
                    text: [
                        {
                            data: 'Hello',
                            type: 'text',
                            class: 'col-12'
                        }
                    ],
                    title: [
                        {
                            data: 'Peripherals 2',
                            type: 'text',
                            class: 'col-12'
                        }
                    ]
                },
                type: 'card',
                class: 'col-lg-8 col-sm-12'
            }
        ];
    }
}
