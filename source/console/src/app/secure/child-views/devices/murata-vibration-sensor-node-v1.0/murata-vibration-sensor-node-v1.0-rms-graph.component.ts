import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import * as ChartPluginAnnotation from 'chartjs-plugin-annotation';
import * as ChartPluginDraggable from 'chartjs-plugin-draggable';

import { IOTService } from '@services/iot.service';
import { MurataLineGraphComponent } from './murata-vibration-sensor-node-v1.0-line-graph.component';

declare var $: any;

@Component({
    selector: 'app-murata-temperature-graph',
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
export class MurataRMSGraphComponent extends MurataLineGraphComponent implements OnInit {
    @Input() rmsHigh: number;
    @Input() rmsLow: number;

    constructor(private iotService: IOTService) {
        // super(iotService);
        super();
    }

    ngOnInit() {
        const self = this;

        self.options.scales.yAxes = [
            {
                id: 'y-axis-0',
                position: 'left',
                ticks: {
                    min: Math.sign(Math.min(self.rmsLow, self.value)) * Math.abs(Math.min(self.rmsLow, self.value)) * 1.25,
                    max: Math.max(self.rmsHigh, self.value) * 1.25
                }
            }
        ];

        self.options.annotation.annotations = [
            {
                id: 'lowLine',
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: self.rmsLow,
                borderColor: 'rgb(255, 0, 0)',
                borderWidth: 1,
                label: {
                    enabled: true,
                    backgroundColor: '#FF0000',
                    content: 'Low Temperature'
                },
                draggable: true,
                onDragEnd: e => {
                    // console.log(e.subject.config.value);
                    self.rmsLow = e.subject.config.value;
                    self.updateThresholds({
                        rmsHigh: self.rmsHigh,
                        rmsLow: self.rmsLow
                    });
                }
            },
            {
                id: 'highLine',
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: self.rmsHigh,
                borderColor: 'rgb(255, 0, 0)',
                borderWidth: 1,
                label: {
                    backgroundColor: '#FF0000',
                    enabled: true,
                    content: 'High Temperature'
                },
                draggable: true,
                onDragEnd: e => {
                    // console.log(e.subject.config.value);
                    self.rmsHigh = e.subject.config.value;
                    self.updateThresholds({
                        rmsHigh: self.rmsHigh,
                        rmsLow: self.rmsLow
                    });
                }
            }
        ];
    }
}
