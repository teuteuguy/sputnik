import { Component, Input, OnInit, NgZone } from '@angular/core';
import * as ChartPluginAnnotation from 'chartjs-plugin-annotation';
import * as ChartPluginDraggable from 'chartjs-plugin-draggable';


declare var $: any;

@Component({
    selector: 'app-murata-battery-graph',
    template: `
        <div class="card card-outline-info">
            <div class="card-body">
                <h5 class="card-title">Battery</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{ batteryVoltage }}V</h6>
                <div class="card-text">
                    <canvas
                        baseChart
                        [datasets]="[
                            {
                                data: data,
                                label: 'Battery Voltage',
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
export class MurataBatteryGraphComponent implements OnInit {
    @Input() batteryMin: number;
    @Input() batteryMax: number;
    @Input() batteryLow: number;
    @Input() batteryVLow: number;
    @Input() batteryVoltage: number;
    @Input() labels: number;
    @Input() data: [number];

    constructor() {}

    public chartPlugins = [ChartPluginAnnotation, ChartPluginDraggable];
    public options: any;

    ngOnInit() {
        const self = this;

        self.options = {
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
                        position: 'bottom',
                        ticks: {
                            min: 0,
                            max: 100
                        }
                    }
                ],
                yAxes: [
                    {
                        id: 'y-axis-0',
                        position: 'left',
                        ticks: {
                            min: self.batteryMin,
                            max: self.batteryMax
                        }
                    }
                ]
            },
            annotation: {
                events: ['click'],
                annotations: [
                    {
                        type: 'line',
                        mode: 'horizontal',
                        scaleID: 'y-axis-0',
                        value: self.batteryVLow,
                        borderColor: '#F03E3E',
                        borderWidth: 1,
                        label: {
                            enabled: false,
                            content: 'ZERO'
                        }
                    },
                    {
                        id: 'hline',
                        type: 'line',
                        mode: 'horizontal',
                        scaleID: 'y-axis-0',
                        value: self.batteryLow,
                        borderColor: '#FFDD00',
                        borderWidth: 1,
                        label: {
                            backgroundColor: '#FFDD00',
                            enabled: true,
                            content: 'Low Voltage'
                        },
                        draggable: true,
                        onDragEnd: e => {
                            console.log(e.subject.config.value);
                        }
                    }
                ]
            }
        };
    }
}
