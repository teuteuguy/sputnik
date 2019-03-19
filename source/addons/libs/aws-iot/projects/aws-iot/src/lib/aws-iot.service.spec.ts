import { TestBed } from '@angular/core/testing';

import { AwsIotService } from './aws-iot.service';

describe('AwsIotService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AwsIotService = TestBed.get(AwsIotService);
    expect(service).toBeTruthy();
  });
});
