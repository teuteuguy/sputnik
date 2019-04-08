import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import * as ChartPluginAnnotation from 'chartjs-plugin-annotation';
import * as ChartPluginDraggable from 'chartjs-plugin-draggable';

import { Device } from '@models/device.model';

declare var $: any;

@Component({
    selector: 'app-murata-line-graph',
    template: `
        <div class="card card-outline-info">
            <div class="card-body">
                <h5 class="card-title">{{ title }}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{ value | number: '.2' }}{{ unit }}</h6>
                <div class="card-text">
                    <canvas
                        baseChart
                        [datasets]="[
                            {
                                data: data,
                                label: title,
                                yAxisID: 'y-axis-0',
                                fill: false,
                                borderColor: 'rgb(0, 0, 255)',
                                backgroundColor: 'rgb(0, 0, 255)',
                                borderWidth: 1
                            }
                        ]"
                        [options]="options"
                        [plugins]="chartPlugins"
                        [legend]="true"
                        [labels]="labels"
                        [chartType]="'line'"
                    ></canvas>
                </div>
            </div>
        </div>
    `
})
export class MurataLineGraphComponent implements OnInit {
    @Input() device: Device = new Device();
    @Input() value: number;
    @Input() high: number;
    @Input() low: number;
    @Input() title: string;
    @Input() unit = '';
    @Input() labels: number;
    @Input() data: [number];
    @Input() yMin: any;
    @Input() yMax: any;
    @Input() annotations: [any];

    @Output() thresholdChanged: EventEmitter<any> = new EventEmitter();

    constructor() {}

    public chartPlugins = [ChartPluginAnnotation, ChartPluginDraggable];
    public options: any;

    private setYAxeMinMax(chart) {
        let ticks = {};
        if (this.low) {
            ticks['min'] = this.value - Math.abs(this.low - this.value) * 2;
        }
        if (this.high) {
            ticks['max'] = Math.abs(this.high - this.value) * 2 + this.value;
        }

        if (this.yMin) {
            ticks['min'] = parseFloat(this.yMin);
        }
        if (this.yMax) {
            ticks['max'] = parseFloat(this.yMax);
        }

        if (chart) {
            chart.options.scales.yAxes[0].ticks = ticks;
            chart.update();
        } else {
            this.options.scales.yAxes[0].ticks = ticks;
        }
    }

    ngOnInit() {
        this.options = {
            elements: { point: { hitRadius: 2, hoverRadius: 2, radius: 0 } },
            tooltips: {
                enabled: true
            },
            responsive: true,
            scales: {
                // We use this empty structure as a placeholder for dynamic theming.
                xAxes: [
                    {
                        id: 'x-axis-0',
                        position: 'bottom'
                    }
                ],
                yAxes: [
                    {
                        id: 'y-axis-0',
                        position: 'left',
                        ticks: {}
                    }
                ]
            },
            annotation: {
                events: ['click'],
                annotations: []
            }
        };

        if (this.low) {
            this.options.annotation.annotations.push({
                id: 'lowLine',
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: this.low,
                borderColor: 'rgb(255, 0, 0)',
                borderWidth: 1,
                label: {
                    enabled: true,
                    backgroundColor: '#FF0000',
                    content: `Low ${this.title}`
                },
                draggable: true,
                onDragEnd: e => {
                    // console.log(e.subject.config.value);
                    this.low = e.subject.config.value;
                    this.updateThresholds();
                    this.setYAxeMinMax(e.subject.chart);
                }
            });
        }
        if (this.high) {
            this.options.annotation.annotations.push({
                id: 'highLine',
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: this.high,
                borderColor: 'rgb(255, 0, 0)',
                borderWidth: 1,
                label: {
                    backgroundColor: '#FF0000',
                    enabled: true,
                    content: `High ${this.title}`
                },
                draggable: true,
                onDragEnd: e => {
                    // console.log(e.subject.config.value);
                    this.high = e.subject.config.value;
                    this.updateThresholds();
                    this.setYAxeMinMax(e.subject.chart);
                }
            });
        }

        if (this.annotations) {
            this.options.annotation.annotations.push(...this.annotations);
        }

        this.setYAxeMinMax(null);

        // console.log(this.high, this.low, this.value, this.options.scales.yAxes[0].ticks);
    }

    protected updateThresholds() {
        this.thresholdChanged.emit({
            high: this.high,
            low: this.low
        });
    }
}
