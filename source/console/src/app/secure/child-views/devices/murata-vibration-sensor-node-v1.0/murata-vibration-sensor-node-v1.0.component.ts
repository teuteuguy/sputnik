import { Component, Input, OnInit, NgZone } from '@angular/core';
// import { ChartDataSets, ChartOptions } from 'chart.js';
// import { Color, BaseChartDirective, Label } from 'ng2-charts';
// import * as pluginAnnotations from 'chartjs-plugin-annotation';
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

const BATTERY_MIN = 2.2;
const BATTERY_VLOW = 2.5;
const BATTERY_LOW = 2.7;
const BATTERY_MAX = 3.6;



@Component({
    selector: 'app-murata-vibration-sensor-node-v1-0',
    templateUrl: './murata-vibration-sensor-node-v1.0.component.html'
})
export class MurataVibrationSensorNodeV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    constructor(private iotService: IOTService, private appSyncService: AppSyncService, private ngZone: NgZone) {
        super(iotService);

        this.reported.frequencies = [];
        this.reported.accels = [];

        this.desired.thresholds = {};
    }
    public batteryGauge = {
        min: BATTERY_MIN,
        max: BATTERY_MAX,
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
                { strokeStyle: '#F03E3E', min: BATTERY_MIN, max: BATTERY_VLOW },
                { strokeStyle: '#FFDD00', min: BATTERY_VLOW, max: BATTERY_LOW },
                { strokeStyle: '#30B32D', min: BATTERY_LOW, max: BATTERY_MAX }
            ]
        }
    };

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

    // public lineChartPlugins = [pluginAnnotations];
    // public tempAndBattLineChart = {
    //     options: {
    //         elements: { point: { hitRadius: 2, hoverRadius: 2, radius: 0 } },
    //         tooltips: {
    //             enabled: true
    //         },
    //         responsive: true,
    //         scales: {
    //             // We use this empty structure as a placeholder for dynamic theming.
    //             xAxes: [{}],
    //             yAxes: [
    //                 {
    //                     id: 'y-axis-0',
    //                     position: 'left'
    //                 },
    //                 {
    //                     id: 'y-axis-1',
    //                     position: 'right',
    //                     ticks: {
    //                         min: BATTERY_MIN,
    //                         max: BATTERY_MAX
    //                     }
    //                 }
    //             ]
    //         },
    //         annotation: {
    //             annotations: [{
    //                 type: 'line',
    //                 mode: 'horizontal',
    //                 scaleID: 'y-axis-1',
    //                 value: BATTERY_VLOW,
    //                 borderColor: '#F03E3E',
    //                 borderWidth: 1,
    //                 label: {
    //                     enabled: false,
    //                     content: 'low voltage'
    //                 }
    //             }, {
    //                 type: 'line',
    //                 mode: 'horizontal',
    //                 scaleID: 'y-axis-1',
    //                 value: BATTERY_LOW,
    //                 borderColor: '#FFDD00',
    //                 borderWidth: 1,
    //                 label: {
    //                     enabled: false,
    //                     content: 'low voltage'
    //                 }
    //             }]
    //         }
    //     },
    //     colors: [
    //         {
    //             // grey
    //             backgroundColor: 'rgba(148,159,177,0.2)',
    //             borderColor: 'rgba(148,159,177,1)',
    //             pointBackgroundColor: 'rgba(148,159,177,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //         },
    //         {
    //             // dark grey
    //             backgroundColor: 'rgba(77,83,96,0.2)',
    //             borderColor: 'rgba(77,83,96,1)',
    //             pointBackgroundColor: 'rgba(77,83,96,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(77,83,96,1)'
    //         }
    //     ]
    // };

    // public rmsAndKurtosisLineChart = {
    //     options: {
    //         elements: { point: { hitRadius: 2, hoverRadius: 2, radius: 0 } },
    //         tooltips: {
    //             enabled: true
    //         },
    //         responsive: true,
    //         scales: {
    //             // We use this empty structure as a placeholder for dynamic theming.
    //             xAxes: [{}],
    //             yAxes: [
    //                 {
    //                     id: 'y-axis-0',
    //                     position: 'left'
    //                 },
    //                 {
    //                     id: 'y-axis-1',
    //                     position: 'right'
    //                 }
    //             ]
    //         }
    //     },
    //     colors: [
    //         {
    //             // grey
    //             backgroundColor: 'rgba(148,159,177,0.2)',
    //             borderColor: 'rgba(148,159,177,1)',
    //             pointBackgroundColor: 'rgba(148,159,177,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //         },
    //         {
    //             // dark grey
    //             backgroundColor: 'rgba(77,83,96,0.2)',
    //             borderColor: 'rgba(77,83,96,1)',
    //             pointBackgroundColor: 'rgba(77,83,96,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(77,83,96,1)'
    //         }
    //     ]
    // };

    // public frequenciesLineChart = {
    //     options: {
    //         elements: { point: { hitRadius: 2, hoverRadius: 2, radius: 0 } },
    //         tooltips: {
    //             enabled: true
    //         },
    //         responsive: true,
    //         scales: {
    //             // We use this empty structure as a placeholder for dynamic theming.
    //             xAxes: [{}],
    //             yAxes: [
    //                 {
    //                     id: 'y-axis-0',
    //                     position: 'left'
    //                 }
    //             ]
    //         }
    //     },
    //     colors: [{
    //             // red
    //             backgroundColor: 'rgba(255,0,0,0.2)',
    //             borderColor: 'rgba(255,0,0,1)',
    //             pointBackgroundColor: 'rgba(255,0,0,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(255,0,0,0.8)'
    //         },
    //         {
    //             // green
    //             backgroundColor: 'rgba(0,255,0,0.2)',
    //             borderColor: 'rgba(0,255,0,1)',
    //             pointBackgroundColor: 'rgba(0,255,0,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(0,255,0,0.8)'
    //         },
    //         {
    //             // blue
    //             backgroundColor: 'rgba(0,0,255,0.2)',
    //             borderColor: 'rgba(0,0,255,1)',
    //             pointBackgroundColor: 'rgba(0,0,255,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(0,0,255,0.8)'
    //         },
    //         {
    //             // grey
    //             backgroundColor: 'rgba(148,159,177,0.2)',
    //             borderColor: 'rgba(148,159,177,1)',
    //             pointBackgroundColor: 'rgba(148,159,177,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //         },
    //         {
    //             // dark grey
    //             backgroundColor: 'rgba(77,83,96,0.2)',
    //             borderColor: 'rgba(77,83,96,1)',
    //             pointBackgroundColor: 'rgba(77,83,96,1)',
    //             pointBorderColor: '#fff',
    //             pointHoverBackgroundColor: '#fff',
    //             pointHoverBorderColor: 'rgba(77,83,96,1)'
    //         }
    //     ]
    // };

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
            frequencies: [[],[],[],[],[]],
            accels: [[],[],[],[],[]]
        };

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
        this.freqsBarChart.labels = this.reported.frequencies;
        this.freqsBarChart.data[0].data = this.reported.accels;

        this.batteryGauge.value = this.reported.batteryVoltage;
        this.batteryGauge.percent = (this.reported.batteryVoltage * 100) / this.batteryGauge.max;

        this.appSyncService
            .getData(this.device.thingName, 'graphdata', 24 * 3600)
            .then(data => {

                console.log('Received', data.length, 'data points.');

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
                                for(let i = 0; i < 5; i++) {
                                    this.graphs[key][i].push(val[i]);
                                }
                            }
                        });
                    }

                });

                console.log('Setup', this.graphs.timestamp.length, 'data points');
                console.log('Graphs', this.graphs);
            })
            .catch(err => {
                console.error(err);
            });
    }

    onTemperatureUpdate(low, high) {
        console.log(low, high);

    }
}
