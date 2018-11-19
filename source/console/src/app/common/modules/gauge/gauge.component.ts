import { Component, Input, OnInit } from '@angular/core';
declare var Gauge: any;

@Component({
    selector: 'app-gauge',
    template: '<canvas id="{{id}}-gauge" class="gaugejs"></canvas>'
})
export class GaugeComponent implements OnInit {
    private gauge = null;

    @Input() id = '';
    @Input() value = 0;
    @Input() opts: any;
    @Input() maxValue = 0;
    @Input() minValue = 0;
    @Input() animationSpeed = 0;

    constructor() {}

    ngOnInit() {
        if (!this.opts) {
            this.opts = {
                angle: 0,
                lineWidth: 0.42,
                radiusScale: 1,
                pointer: { length: 0.64, strokeWidth: 0.04, color: '#000000' },
                limitMax: false,
                limitMin: false,
                colorStart: '#009efb',
                colorStop: '#009efb',
                strokeColor: '#E0E0E0',
                generateGradient: true,
                highDpiSupport: true
            };
        }
        const target = document.getElementById(this.id + '-gauge'); // your canvas element
        console.log(target);
        this.gauge = new Gauge(target).setOptions(this.opts); // create sexy gauge!
        this.gauge.maxValue = this.maxValue || 0; // set max gauge value
        this.gauge.setMinValue(this.minValue || 0); // Prefer setter over gauge.minValue = 0
        this.gauge.animationSpeed = this.animationSpeed || 0; // set animation speed (32 is default value)
        this.gauge.set(this.value || 0); // set actual value
    }
}
