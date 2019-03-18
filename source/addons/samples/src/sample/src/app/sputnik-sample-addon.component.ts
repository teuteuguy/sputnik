import { Component, OnInit } from '@angular/core';

// --------
import { AWSIoTComponent } from 'aws-iot';
import { AWSIoTService } from 'aws-iot';

@Component({
    selector: 'sputnik-sample-addon-component',
    template: `
        <h3>Hi, I am the Sample Addon component.</h3>
    `
})
export class SputnikSampleAddonComponent extends AWSIoTComponent implements OnInit {
    constructor(private awsIoTService: AWSIoTService) {
        super(awsIoTService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: 'test',
                onMessage: data => {
                    // console.log('Data:', data.value);
                    // this.latestData = data.value;
                },
                onError: err => {
                    // console.error('Error:', err);
                }
            }
        ]);
    }
}
