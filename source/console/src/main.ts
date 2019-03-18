import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Addon Management
declare const SystemJS;

import * as angularCore from '@angular/core';
import * as angularCommon from '@angular/common';

import * as awsAmplify from 'aws-amplify';
import * as awsAmplifyAngular from 'aws-amplify-angular';

SystemJS.set('@angular/core', SystemJS.newModule(angularCore));
SystemJS.set('@angular/common', SystemJS.newModule(angularCommon));
SystemJS.set('aws-amplify', SystemJS.newModule(awsAmplify));
SystemJS.set('aws-amplify-angular', SystemJS.newModule(awsAmplifyAngular));

// AWS related
import Amplify from 'aws-amplify';

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


if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
