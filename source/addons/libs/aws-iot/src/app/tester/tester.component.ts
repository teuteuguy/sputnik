import { Component, OnInit } from '@angular/core';

import { AWSIoTComponent } from 'aws-iot';
import { AWSIoTService } from 'aws-iot';

@Component({
  selector: 'app-tester',
  templateUrl: './tester.component.html',
  styleUrls: ['./tester.component.css']
})
export class TesterComponent extends AWSIoTComponent implements OnInit {
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
