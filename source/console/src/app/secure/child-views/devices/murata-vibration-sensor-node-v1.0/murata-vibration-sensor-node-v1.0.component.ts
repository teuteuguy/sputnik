import { Component, Input, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { _ } from 'underscore';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IOTService } from '@services/iot.service';

declare var $: any;

@Component({
    selector: 'app-murata-vibration-sensor-node-v1-0',
    templateUrl: './murata-vibration-sensor-node-v1.0.component.html'
})
export class MurataVibrationSensorNodeV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    constructor(private iotService: IOTService, private ngZone: NgZone) {
        super(iotService);
    }

    public battery = {
        min: 2.2,
        max: 3.6,
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
                { strokeStyle: '#F03E3E', min: 2.2, max: 2.5 },
                { strokeStyle: '#FFDD00', min: 2.5, max: 2.7 },
                { strokeStyle: '#30B32D', min: 2.7, max: 3.6 }
            ]
            // ,
            // percentColors: [
            //     [0.2, '#a9d70b'],
            //     [0.4, '#f9c802'],
            //     [1.0, '#ff0000']
            // ]
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

    ngOnInit() {
        const self = this;

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

        this.battery.value = this.reported.batteryVoltage;
        this.battery.percent = (this.reported.batteryVoltage * 100) / this.battery.max;
    }
}
