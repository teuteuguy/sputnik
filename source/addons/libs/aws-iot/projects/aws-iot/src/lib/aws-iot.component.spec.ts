import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsIotComponent } from './aws-iot.component';

describe('AwsIotComponent', () => {
  let component: AwsIotComponent;
  let fixture: ComponentFixture<AwsIotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwsIotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwsIotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
