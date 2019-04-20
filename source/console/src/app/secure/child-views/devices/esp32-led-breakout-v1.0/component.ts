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

@Component({
    selector: 'app-esp32-led-breakout-v1-0',
    templateUrl: './component.html'
})
export class MyComponent extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    constructor(private iotService: IOTService, private appSyncService: AppSyncService, private ngZone: NgZone) {
        super(iotService);
    }

    public graphs: any;
    public led = ['#000000', '#000000', '#000000', '#000000', '#000000'];

    private resetGraphs() {
        this.graphs = {
            labels: [],
            timestamp: [],
            temperature: [],
            pressure: [],
            humidity: [],
            illuminance: []
        };
    }

    ngOnInit() {
        const self = this;

        this.resetGraphs();

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        self.getLastState(self.device.thingName).then(data => {
            this.getWidgetsData();

            self.subscribe([
                {
                    topic: '$aws/things/' + self.device.thingName + '/shadow/update/accepted',
                    onMessage: message => {
                        self.ngZone.run(() => {
                            self.updateIncomingShadow(message.value);
                            // self.updateWidgets();

                            // console.log(message.value);

                            if (
                                message.value.hasOwnProperty('state') &&
                                message.value.state.hasOwnProperty('reported') &&
                                message.value.state.reported.hasOwnProperty('sensors')
                            ) {
                                this.graphs.temperature.push(message.value.state.reported.sensors.temperature);
                                this.graphs.pressure.push(message.value.state.reported.sensors.pressure);
                                this.graphs.humidity.push(message.value.state.reported.sensors.humidity);
                                this.graphs.illuminance.push(message.value.state.reported.sensors.illuminance);
                            }
                        });
                    },
                    onError: defaultErrorCallback
                }
            ]);
        });
    }

    private getWidgetsData() {
        this.appSyncService
            .getData(this.device.thingName, 'graphdata', 24 * 3600)
            .then(data => {
                console.log('Received', data.length, 'data points.');

                this.resetGraphs();

                _.each(data, d => {
                    const index = _.indexOf(this.graphs.timestamp, d.timestamp);

                    if (index == -1) {
                        _.each(d, (val, key) => {
                            if (key === 'sensors') {
                                this.graphs.temperature.push(val.temperature);
                                this.graphs.pressure.push(val.pressure);
                                this.graphs.humidity.push(val.humidity);
                                this.graphs.illuminance.push(val.illuminance);
                            }
                            if (key === 'timestamp') {
                                this.graphs.labels.push(moment(val).fromNow());
                            }
                        });
                    }
                });
            })
            .catch(err => {
                console.error(err);
            });

        this.led = this.desired.leds.map(color => {
            return (
                '#' +
                color.red.toString(16).padStart(2, '0') +
                color.green.toString(16).padStart(2, '0') +
                color.blue.toString(16).padStart(2, '0')
            );
        });

        console.log(this.led, this.reported.leds);
    }

    updateLeds() {
        // console.log('here', this.led);

        const leds = this.led.map(color => {
            return {
                red: parseInt(color.substring(1, 3), 16),
                green: parseInt(color.substring(3, 5), 16),
                blue: parseInt(color.substring(5, 7), 16)
            };
        });

        console.log('here', leds);

        this.iotService
            .updateThingShadow({
                thingName: this.device.thingName,
                payload: JSON.stringify({
                    state: {
                        desired: {
                            leds: leds
                        }
                    }
                })
            })
            .then(result => {
                // console.log(result);
            })
            .catch(err => {
                console.error(err);
            });
    }
}
