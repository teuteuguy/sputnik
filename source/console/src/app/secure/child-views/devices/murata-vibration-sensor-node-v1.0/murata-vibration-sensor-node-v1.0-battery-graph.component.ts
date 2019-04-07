import { Component, Input, OnInit, NgZone } from '@angular/core';
import * as ChartPluginAnnotation from 'chartjs-plugin-annotation';
import * as ChartPluginDraggable from 'chartjs-plugin-draggable';

import { IOTService } from '@services/iot.service';
import { MurataLineGraphComponent } from './murata-vibration-sensor-node-v1.0-line-graph.component';

declare var $: any;

@Component({
    selector: 'app-murata-battery-graph',
    template: `
        <div class="card card-outline-info">
            <div class="card-body">
                <h5 class="card-title">
                    {{ title }}
                    <div class="pull-right" role="group">{{ value | number: '.2' }}{{ unit }}</div>
                </h5>
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
export class MurataBatteryGraphComponent extends MurataLineGraphComponent implements OnInit {
    @Input() batteryMin: number;
    @Input() batteryMax: number;
    @Input() batteryVoltageLow: number;
    @Input() batteryVoltageVeryLow: number;

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
                    min: self.batteryMin,
                    max: self.batteryMax
                }
            }
        ];
        self.options.annotation.annotations = [
            {
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: self.batteryVoltageVeryLow,
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
                value: self.batteryVoltageLow,
                borderColor: '#FFDD00',
                borderWidth: 1,
                label: {
                    backgroundColor: '#FFDD00',
                    enabled: true,
                    content: 'Low Voltage'
                },
                draggable: true,
                onDragEnd: e => {
                    // console.log(e.subject.config.value);
                    self.batteryVoltageLow = e.subject.config.value;
                    self.updateThresholds({
                        batteryVoltageLow: self.batteryVoltageLow
                    });
                }
            }
        ];
    }
}
