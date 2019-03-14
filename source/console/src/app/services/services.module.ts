import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// AWS Specific
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

// Modules
import { S3Module } from './s3/s3.module';

// Services
import { AdminService } from './admin.service';
import { AppSyncService } from './appsync.service';
import { BreadCrumbService } from './bread-crumb.service';
import { DeploymentService } from './deployment.service';
import { DeviceService } from './device.service';
import { DeviceBlueprintService } from './device-blueprint.service';
import { DeviceTypeService } from './device-type.service';
import { FactoryResetService } from './factoryreset.service';
import { IOTService } from './iot.service';
import { SettingService } from './setting.service';
import { SolutionService } from './solution.service';
import { SolutionBlueprintService } from './solution-blueprint.service';
import { StatService } from './stat.service';
import { UserLoginService } from './user-login.service';
import { UserRegistrationService } from './user-registration.service';
// import { AdminService } from './admin.service';
// import { StatsService } from './stats.service';
// import { MQTTService } from './mqtt.service';
// import { DeviceSubViewComponentService } from './device-sub-view-component.service';

@NgModule({
    imports: [AmplifyAngularModule, CommonModule, S3Module],
    providers: [
        AdminService,
        AmplifyService,
        AppSyncService,
        BreadCrumbService,
        DeploymentService,
        DeviceService,
        DeviceBlueprintService,
        DeviceTypeService,
        FactoryResetService,
        IOTService,
        SettingService,
        SolutionService,
        SolutionBlueprintService,
        StatService,
        UserLoginService,
        UserRegistrationService
    ]
})
export class AppServicesModule {}
