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

    public freqsBarChart = {
        options: {
            scaleShowVerticalLines: false,
            responsive: true
        },
        labels: ['0', '1', '2', '3', '4'],
        type: 'bar',
        legend: true,
        data: [{
            data: [0, 0, 0, 0, 0], label: 'Top frequencies'
        }]
    };

    ngOnInit() {
        const self = this;

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        self.getLastState(self.device.thingName).then(data => {

            console.log(data, JSON.stringify(data.state.reported, null, 2));
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
        this.freqsBarChart.labels = this.reported.frequencies;
        this.freqsBarChart.data[0].data = this.reported.accels;
    }

}
