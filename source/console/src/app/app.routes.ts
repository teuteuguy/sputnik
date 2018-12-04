import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Public Routes
import { HomeComponent } from './public/home/home.component';
import { LoginComponent } from './public/auth/login/login.component';
import { RegisterComponent } from './public/auth/register/registration.component';
import {
    LogoutComponent,
    RegistrationConfirmationComponent
} from './public/auth/confirm/confirm-registration.component';
import { ResendCodeComponent } from './public/auth/resend/resend-code.component';
import { ForgotPassword2Component, ForgotPasswordStep1Component } from './public/auth/forgot/forgot-password.component';
import { NewPasswordComponent } from './public/auth/newpassword/new-password.component';

// Secure Routes
import { SecureHomeCommonComponent } from './secure/common/secure-home-common.component';
import { SecureHomeComponent } from './secure/home/secure-home.component';

import { DeploymentsComponent } from './secure/deployments/deployments.component';
import { DeviceComponent } from './secure/device/device.component';
import { DevicesComponent } from './secure/devices/devices.component';
import { DeviceBlueprintsComponent } from './secure/device-blueprints/device-blueprints.component';
import { DeviceTypesComponent } from './secure/device-types/device-types.component';
import { MapsComponent } from './secure/maps/maps.component';
import { ProfileComponent } from './secure/profile/profile.component';
import { SettingsComponent } from './secure/settings/settings.component';
import { SolutionComponent } from './secure/solution/solution.component';
import { SolutionsComponent } from './secure/solutions/solutions.component';
import { SolutionBlueprintsComponent } from './secure/solution-blueprints/solution-blueprints.component';
import { UsersComponent } from './secure/users/users.component';

// import { UsersComponent } from './secure/admin/users/users.component';
// import { UserComponent } from './secure/admin/users/user.component';
// import { GroupsComponent } from './secure/admin/groups/groups.component';
// import { DeviceComponent } from './secure/devices/device.component';
// import { DashboardComponent } from './secure/dashboard/dashboard.component';
// import { GetStartedComponent } from './secure/landing/getstarted.component';
// import { WidgetsComponent } from './secure/devices/widgets.component';
// import { WidgetComponent } from './secure/devices/widget.component';
// import { FleetComponent } from './secure/automotive/fleet.component';
// import { VehicleComponent } from './secure/automotive/vehicle.component';
// import { CustomizeAutomotiveComponent } from './secure/automotive/customize.component';

const homeRoutes: Routes = [
    {
        path: '',
        redirectTo: '/home/login',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'confirmRegistration/:username', component: RegistrationConfirmationComponent },
            { path: 'resendCode', component: ResendCodeComponent },
            { path: 'forgotPassword/:email', component: ForgotPassword2Component },
            { path: 'forgotPassword', component: ForgotPasswordStep1Component },
            { path: 'newPassword', component: NewPasswordComponent }
        ]
    }
];

const secureHomeRoutes: Routes = [
    {
        path: '',
        redirectTo: '/securehome',
        pathMatch: 'full'
    },
    {
        path: 'securehome',
        component: SecureHomeCommonComponent,
        children: [
            { path: '', component: SecureHomeComponent },
            { path: 'deployments', component: DeploymentsComponent },
            { path: 'devices', component: DevicesComponent },
            { path: 'devices/:thingId', component: DeviceComponent },
            { path: 'device-blueprints', component: DeviceBlueprintsComponent },
            // { path: 'device-blueprints/:deviceBlueprintId', component: DeviceBlueprintComponent },
            { path: 'device-types', component: DeviceTypesComponent },
            // { path: 'device-types/:deviceTypeId', component: DeviceTypesComponent },
            { path: 'logout', component: LogoutComponent },
            { path: 'maps', component: MapsComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'solutions', component: SolutionsComponent },
            { path: 'solutions/:solutionId', component: SolutionComponent },
            { path: 'solution-blueprints', component: SolutionBlueprintsComponent },
            // { path: 'solution-blueprints/:solutionBlueprintId', component: SolutionBlueprintsComponent },
            { path: 'users', component: UsersComponent }
        ]
    }
];

const routes: Routes = [
    ...homeRoutes,
    ...secureHomeRoutes,
    { path: '', component: HomeComponent }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
