import { Component, Input, OnInit } from '@angular/core';
import { Device } from 'src/app/models/device.model';

@Component({
    selector: 'app-aws-afr-3d-belt-mini-connected-factory-v1',
    templateUrl: './aws-afr-3d-belt-mini-connected-factory.component.html'
})
export class AWSAFR3DBeltMiniConnectedFactoryV10Component implements OnInit {

    @Input() device: Device = new Device();

    constructor() {}

    ngOnInit() {
    }
}
