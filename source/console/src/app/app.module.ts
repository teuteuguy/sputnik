import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIModule } from 'ng-block-ui';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

import { AppRoutingModule } from './app.routes';

// AWS Specific
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

// Components
import { AppComponent } from './app.component';
// Components - Public
import { HomeComponent } from './public/home/home.component';
import { LoginComponent } from './public/auth/login/login.component';
import {
    LogoutComponent,
    RegistrationConfirmationComponent
} from './public/auth/confirm/confirm-registration.component';
import { ResendCodeComponent } from './public/auth/resend/resend-code.component';
import { ForgotPasswordStep1Component, ForgotPassword2Component } from './public/auth/forgot/forgot-password.component';
import { RegisterComponent } from './public/auth/register/registration.component';
import { NewPasswordComponent } from './public/auth/newpassword/new-password.component';
// Components - Secure
import { SecureHomeCommonComponent } from './secure/common/secure-home-common.component';
import { SecureHomeComponent } from './secure/home/secure-home.component'
import { ProfileComponent } from './secure/profile/profile.component';
import { SettingsComponent } from './secure/settings/settings.component';
import { PrettifierComponent } from './secure/common/prettifier.component';
import { DeviceTypesComponent } from './secure/device-types/device-types.component';
import { DeviceTypeComponent } from './secure/device-type/device-type.component';
import { DevicesComponent } from './secure/devices/devices.component';
import { DeviceComponent } from './secure/device/device.component';
import { DeviceBlueprintsComponent } from './secure/device-blueprints/device-blueprints.component';
import { DeviceBlueprintComponent } from './secure/device-blueprint/device-blueprint.component';
import { DeploymentsComponent } from './secure/deployments/deployments.component';
import { SolutionsComponent } from './secure/solutions/solutions.component';
import { GenericTableComponent } from './secure/common/generic-table.component';

// import { UsersComponent } from './secure/admin/users/users.component';
// import { UserComponent } from './secure/admin/users/user.component';
// import { GroupsComponent } from './secure/admin/groups/groups.component';
// import { DeviceTypeComponent } from './secure/devices/device-type.component';
// import { MyDevicesComponent } from './secure/devices/mydevices.component';

// Sub Components
// import { FactoryResetDeeplensV10Component } from './secure/devices/types/factory-reset-deeplens-v1.0.component';
// import { MyDeeplensWebCameraV10Component } from './secure/devices/types/my-deeplens-web-camera-v1.0.component';
// import { MiniConnectedFactoryV10Component } from './secure/devices/types/mini-connected-factory-v1.0.component';

// Directives

// Pipes
import { MomentPipe } from './pipes/moment.pipe';
import { StringifyPipe } from './pipes/stringify.pipe';

// Services
import { LoggerService, ConsoleLoggerService } from './services/logger.service';
import { BreadCrumbService } from './services/bread-crumb.service';
import { AppSyncService } from './services/appsync.service';
import { UserLoginService } from './services/user-login.service';
import { UserRegistrationService } from './services/user-registration.service';
import { SettingService } from './services/setting.service';
import { FactoryResetService } from './services/factoryreset.service';
import { DeviceService } from './services/device.service';
import { DeviceTypeService } from './services/device-type.service';
import { StatService } from './services/stat.service';
import { DeviceBlueprintService } from './services/device-blueprint.service';
import { DeploymentService } from './services/deployment.service';
import { SolutionService } from './services/solution.service';
// import { AdminService } from './services/admin.service';
// import { StatsService } from './services/stats.service';
// import { MQTTService } from './services/mqtt.service';
// import { DeviceSubViewComponentService } from './services/device-sub-view-component.service';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        LogoutComponent,
        RegistrationConfirmationComponent,
        ResendCodeComponent,
        ForgotPasswordStep1Component,
        ForgotPassword2Component,
        RegisterComponent,
        NewPasswordComponent,
        HomeComponent,
        SecureHomeCommonComponent,
        SecureHomeComponent,
        SettingsComponent,
        ProfileComponent,
        PrettifierComponent,
        DeviceTypesComponent,
        DeviceTypeComponent,
        DevicesComponent,
        DeviceComponent,
        DeviceBlueprintsComponent,
        DeviceBlueprintComponent,
        DeploymentsComponent,
        SolutionsComponent,

        GenericTableComponent,

        // Directives

        // Pipes
        MomentPipe,
        StringifyPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        HttpClientModule,
        ReactiveFormsModule,

        AppRoutingModule,

        AmplifyAngularModule,
        BlockUIModule.forRoot(),
        SweetAlert2Module
            .forRoot
            //   {
            //   buttonsStyling: false,
            //   customClass: 'modal-content',
            //   confirmButtonClass: 'btn btn-primary',
            //   cancelButtonClass: 'btn'
            // }
            ()
    ],
    providers: [
        AmplifyService,

        BreadCrumbService,

        UserRegistrationService,
        UserLoginService,

        AppSyncService,

        SettingService,
        FactoryResetService,
        StatService,
        DeviceService,
        DeviceTypeService,
        DeviceBlueprintService,
        DeploymentService,
        SolutionService,

        { provide: LoggerService, useClass: ConsoleLoggerService }
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        // FactoryResetDeeplensV10Component,
        // MyDeeplensWebCameraV10Component,
        // MiniConnectedFactoryV10Component
    ]
})
export class AppModule {}
