import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

// Models
import { Device } from 'src/app/models/device.model';

// Services
import { IOTService } from 'src/app/services/iot.service';

import { PubSub } from 'aws-amplify';

@Component({
    selector: 'app-aws-gg-mini-connected-factory-v1',
    templateUrl: './aws-gg-mini-connected-factory.component.html'
})
export class AWSGGMiniConnectedFactoryV10Component implements OnInit, OnDestroy {
    @Input()
    device: Device = new Device();

    private obs: Observable<any>;
    private subscriptions = [];

    constructor(private iotService: IOTService) {}

    ngOnInit() {
        // try {
        //     PubSub.subscribe('mytopic', {}).subscribe(
        //         data => {
        //             console.log('Message received', data);
        //         },
        //         error => console.error('Error', error),
        //         () => console.log('Done')
        //     );
        // } catch (ex) {
        //     console.error(ex);
        // }

        // .subscribe({
        //     next: data => console.log('Message received', data),
        //     error: error => console.error(error),
        //     close: () => console.log('Done'),
        // });

        // this.iotService.subscribe('toto/titi').subscribe(res => console.log(res), err => console.error(err));

        // console.log(this.iotService.subscribe('toto'));
        // const obs: any = PubSub.subscribe('mtm/#', {});

        // obs.subscribe({
        //     next: data => console.log('Message received', data),
        //     error: error => console.error(error),
        //     close: () => console.log('Done')
        // });
        // const sub = this.iotService.subscribe('mtm/#');
        // sub.subscribe({
        //     next: data => {
        //         console.log('Message received', data);
        //     },
        //     error: error => {
        //         console.error(error);
        //     },
        //     close: () => {
        //         console.log('Done');
        //     }
        // });
        // this.subscriptions.push(sub);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
        this.subscriptions = [];
    }
}
