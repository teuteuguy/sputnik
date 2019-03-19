import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { AWSIoTModule, AWSIoTService } from 'aws-iot';
import { TesterComponent } from './tester/tester.component';

@NgModule({
    declarations: [AppComponent, TesterComponent],
    imports: [BrowserModule, AWSIoTModule],
    providers: [AWSIoTService],
    bootstrap: [AppComponent]
})
export class AppModule {}
