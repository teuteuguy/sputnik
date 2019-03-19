import { Component, OnInit } from '@angular/core';

import { AddonIoTComponent } from '@sputnik-addon-iot/component';
import { AddonIoTService } from '@sputnik-addon-iot/service';


@Component({
    selector: 'murata-vibration-sensor-network-component',
    template: `
        <h3>Hi, I am the Plugin A component.</h3>
    `
})
export class MurataVibrationSensorNetworkComponent extends AddonIoTComponent implements OnInit {
    constructor(private awsIoTService: AddonIoTService) {
        super(awsIoTService);
    }

    ngOnInit() {

        console.log(this.awsIoTService, this.awsIoTService.connectionObservable$);

        this.awsIoTService.connectionObservable$.subscribe(isConnected => {
            console.log('Murata, is connected to AWS IoT', isConnected);
        });

        // private connectionSubject: any = new Subject<boolean>();
        // public connectionObservable$ = this.connectionSubject.asObservable();
        // this.awsIoTService.connectionObservable$.subscribe(isConnected => {
        //     console.log('Murata, is connected to AWS IoT', isConnected);
        // });
        // setTimeout(() => {
        //     this.subscribe([
        //         {
        //             topic: 'mtm/AMCF1_bESA7A-Ywh/camera',
        //             onMessage: data => {
        //                 console.log('Data:', data.value);
        //             },
        //             onError: err => {
        //                 console.error('Error:', err);
        //             }
        //         },
        //         {
        //             topic: 'mtm/AMCF1_bESA7A-Ywh/logger',
        //             onMessage: data => {
        //                 console.log('Logger:', data.value);
        //             },
        //             onError: err => {
        //                 console.error('Error:', err);
        //             }
        //         }
        //     ]);
        // }, 5000);
    }
}
