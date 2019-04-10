import { Component, Input, OnInit, NgZone } from '@angular/core';
// import { ChartDataSets, ChartOptions } from 'chart.js';
// import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { NgForm } from '@angular/forms';
import { _ } from 'underscore';
import * as moment from 'moment';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';
import { Data } from '@models/data.model';

// Services
import { IOTService } from '@services/iot.service';
import { AppSyncService } from '@services/appsync.service';

declare var $: any;

export class MurataNodeData {
    timestamp: number;
    accels: [number];
    batteryVoltage: number;
    frequencies: [number];
    kurtosis: number;
    messageId: string;
    nodeId: string;
    rms: number;
    rssi: number;
    surfaceTemperature: number;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

@Component({
    selector: 'app-murata-vibration-sensor-node-v1-0',
    templateUrl: './murata-vibration-sensor-node-v1.0.component.html'
})
export class MurataVibrationSensorNodeV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    public BATTERY_MIN = 2.2;
    public BATTERY_VLOW = 2.5;
    public BATTERY_LOW = 2.7;
    public BATTERY_MAX = 3.6;

    constructor(private iotService: IOTService, private appSyncService: AppSyncService, private ngZone: NgZone) {
        super(iotService);

        this.reported.frequencies = [];
        this.reported.accels = [];

        this.desired.thresholds = {};
    }

    public batteryGauge: any;

    public batterySpecificAnnotations = [];

    public freqsBarChart = {
        options: {
            scaleShowVerticalLines: false,
            responsive: true
        },
        labels: ['0', '1', '2', '3', '4'],
        type: 'bar',
        legend: true,
        data: [
            {
                data: [0, 0, 0, 0, 0],
                label: 'Top frequencies'
            }
        ]
    };

    public graphs: any;

    ngOnInit() {
        const self = this;

        self.graphs = {
            labels: [],
            timestamp: [],
            batteryVoltage: [],
            surfaceTemperature: [],
            rssi: [],
            rms: [],
            kurtosis: [],
            frequencies: [[], [], [], [], []],
            accels: [[], [], [], [], []]
        };

        self.batteryGauge = {
            min: self.BATTERY_MIN,
            max: self.BATTERY_MAX,
            percent: 0,
            value: 0,
            options: {
                angle: 0,
                lineWidth: 0.42,
                radiusScale: 1,
                pointer: { length: 0.64, strokeWidth: 0.04, color: '#000000' },
                limitMax: true,
                limitMin: true,
                colorStart: '#009efb',
                colorStop: '#009efb',
                strokeColor: '#E0E0E0',
                generateGradient: true,
                highDpiSupport: true,
                staticLabels: {
                    // font: "10px sans-serif",  // Specifies font
                    labels: [2.2, 2.5, 3.6], // Print labels at these values
                    color: '#000000', // Optional: Label text color
                    fractionDigits: 1 // Optional: Numerical precision. 0=round off.
                },
                staticZones: [
                    { strokeStyle: '#F03E3E', min: self.BATTERY_MIN, max: self.BATTERY_VLOW },
                    { strokeStyle: '#FFDD00', min: self.BATTERY_VLOW, max: self.BATTERY_LOW },
                    { strokeStyle: '#30B32D', min: self.BATTERY_LOW, max: self.BATTERY_MAX }
                ]
            }
        };

        self.batterySpecificAnnotations.push(
            {
                type: 'box',
                drawTime: 'beforeDatasetsDraw',
                id: 'battery-red-zone-box',
                yScaleID: 'y-axis-0',
                xMin: 0,
                xMax: 0,
                yMax: self.BATTERY_MIN,
                yMin: 0,
                borderColor: 'red',
                borderWidth: 2,
                backgroundColor: 'red'
            },
            {
                type: 'box',
                drawTime: 'beforeDatasetsDraw',
                id: 'battery-yellow-zone-box',
                yScaleID: 'y-axis-0',
                xMin: 0,
                xMax: 0,
                yMax: self.BATTERY_MAX,
                yMin: self.BATTERY_LOW,
                borderColor: '#30B32D',
                borderWidth: 2,
                backgroundColor: '#30B32D'
            },
            {
                type: 'box',
                drawTime: 'beforeDatasetsDraw',
                id: 'battery-green-zone-box',
                yScaleID: 'y-axis-0',
                xMin: 0,
                xMax: 0,
                yMax: self.BATTERY_LOW,
                yMin: self.BATTERY_MIN,
                borderColor: '#FFDD00',
                borderWidth: 2,
                backgroundColor: '#FFDD00'
            }
        );

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        self.getLastState(self.device.thingName).then(data => {
            this.updateWidgets();

            self.subscribe([
                {
                    topic: '$aws/things/' + self.device.thingName + '/shadow/update/accepted',
                    onMessage: message => {
                        self.ngZone.run(() => {
                            self.updateIncomingShadow(message.value);
                            self.updateWidgets();
                        });
                    },
                    onError: defaultErrorCallback
                }
            ]);
        });
    }

    private updateWidgets() {
        console.log(`Updating widgets for ${this.reported.messageId}`);
        // console.log(`Reported state: ${JSON.stringify(this.reported, null, 2)}`);
        this.freqsBarChart.labels = this.reported.frequencies;
        this.freqsBarChart.data[0].data = this.reported.accels;

        this.batteryGauge.value = this.reported.batteryVoltage;
        this.batteryGauge.percent = (this.reported.batteryVoltage * 100) / this.batteryGauge.max;

        this.appSyncService
            .getData(this.device.thingName, 'graphdata', 24 * 3600)
            .then(data => {
                // console.log('Received', data.length, 'data points.', data);

                _.each(data, d => {
                    let index = _.indexOf(this.graphs.timestamp, d.timestamp);

                    if (index == -1) {
                        _.each(d, (val, key) => {
                            if (key !== 'messageId' && key !== 'nodeId' && key !== 'frequencies' && key !== 'accels') {
                                this.graphs[key].push(val);
                            }
                            if (key === 'timestamp') {
                                this.graphs.labels.push(moment(val).fromNow());
                            }
                            if (key === 'frequencies' || key === 'accels') {
                                for (let i = 0; i < 5; i++) {
                                    this.graphs[key][i].push(val[i]);
                                }
                            }
                        });
                    }
                });

                this.batterySpecificAnnotations.forEach(a => {
                    a.xMin = Math.min.apply(Math, this.graphs.timestamp) - 1;
                    a.xMax = Math.max.apply(Math, this.graphs.timestamp) + 1;
                });

            })
            .catch(err => {
                console.error(err);
            });
    }

    private updateThresholds(thresholds) {
        this.iotService
            .updateThingShadow({
                thingName: this.device.thingName,
                payload: JSON.stringify({
                    state: {
                        desired: {
                            thresholds: thresholds
                        }
                    }
                })
            })
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error('Error', err);
            });
    }

    public onRMSUpdate(value) {
        this.updateThresholds({
            rmsHigh: value.high,
            rmsLow: value.low
        });
    }
    public onKurtosisUpdate(value) {
        this.updateThresholds({
            kurtosisHigh: value.high,
            kurtosisLow: value.low
        });
    }
    public onBatteryUpdate(value) {
        this.updateThresholds({
            batteryVoltageLow: value.low
        });
    }
    public onTemperatureUpdate(value) {
        this.updateThresholds({
            surfaceTemperatureHigh: value.high,
            surfaceTemperatureLow: value.low
        });
    }
}
