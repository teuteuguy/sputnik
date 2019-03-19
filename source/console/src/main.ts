import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// AWS related
import Amplify from '@aws-amplify/core';

declare var appVariables: any;

Amplify.configure({
    Auth: {
        identityPoolId: appVariables.IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
        region: appVariables.REGION, // REQUIRED - Amazon Cognito Region
        userPoolId: appVariables.USER_POOL_ID, // OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: appVariables.USER_POOL_CLIENT_ID // OPTIONAL - Amazon Cognito Web Client ID,
    },
    API: {
        aws_appsync_graphqlEndpoint: appVariables.APP_SYNC_GRAPHQL_ENDPOINT,
        aws_appsync_region: appVariables.REGION,
        aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS'
    }
});


// Addon Management
declare const SystemJS;

import * as angularCore from '@angular/core';
import * as angularCommon from '@angular/common';
SystemJS.set('@angular/core', SystemJS.newModule(angularCore));
SystemJS.set('@angular/common', SystemJS.newModule(angularCommon));

import * as addonIoTComponent from './app/services/addon.iot/addon-iot.component';
import * as addonIoTModule from './app/services/addon.iot/addon-iot.module';
import * as addonIoTService from './app/services/addon.iot/addon-iot.service';
SystemJS.set('@sputnik-addon-iot/component', SystemJS.newModule(addonIoTComponent));
SystemJS.set('@sputnik-addon-iot/module', SystemJS.newModule(addonIoTModule));
SystemJS.set('@sputnik-addon-iot/service', SystemJS.newModule(addonIoTService));

import * as rxjs from 'rxjs';
SystemJS.set('rxjs', SystemJS.newModule(rxjs));

// import { AddonIoTModule, AddonIoTComponent, AddonIoTService} from './app/services/addon.iot/addon-iot.module';
// import * as AddonIoTComponent from './app/services/addon.iot/addon-iot.module';
// import * as AddonIoTModule from './app/services/addon.iot/addon-iot.module';
// SystemJS.set('@sputnik-addon-iot', SystemJS.newModule(AddonIoTModule));

// import * as awsAmplifyAuth from '@aws-amplify/auth';
// import * as awsAmplifyApi from '@aws-amplify/api';
// import * as awsAmplifyPubSub from '@aws-amplify/pubsub';
// import * as awsAmplifyIoTProvider from '@aws-amplify/pubsub/lib/Providers';
// // import * as awsAmplifyAngularProviders from 'aws-amplify-angular/dist/src/providers/amplify.service';
// // import * as graphqlTag from 'graphql-tag';

// console.log('here', Amplify.hasOwnProperty('default'));

// SystemJS.set('@aws-amplify/core', SystemJS.newModule(Amplify));
// SystemJS.set('@aws-amplify/auth', SystemJS.newModule(awsAmplifyAuth));
// SystemJS.set('@aws-amplify/api', SystemJS.newModule(awsAmplifyApi));
// SystemJS.set('@aws-amplify/pubsub', SystemJS.newModule(awsAmplifyPubSub));
// SystemJS.set('@aws-amplify/pubsub/lib/Providers', SystemJS.newModule(awsAmplifyIoTProvider));

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
