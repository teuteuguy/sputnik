import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// AWS related
import Amplify, { PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';

declare var appVariables: any;
Amplify.configure({
    Auth: {
        identityPoolId: appVariables.IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
        region: appVariables.REGION, // REQUIRED - Amazon Cognito Region
        userPoolId: appVariables.USER_POOL_ID, // OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: appVariables.USER_POOL_CLIENT_ID // OPTIONAL - Amazon Cognito Web Client ID,
    },
    aws_appsync_graphqlEndpoint: appVariables.APP_SYNC_GRAPHQL_ENDPOINT,
    aws_appsync_region: appVariables.REGION,
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS'
    // API: {
    //     graphql_endpoint: appVariables.APP_SYNC_GRAPHQL_ENDPOINT,
    //     region: appVariables.REGION,
    //     authenticationType: 'AMAZON_COGNITO_USER_POOLS'
    //     // endpoints: [
    //     //     {
    //     //         name: 'MyThingsMGMTAPI',
    //     //         endpoint: appVariables.APIG_ENDPOINT
    //     //     }
    //     // ]
    // }
});

// Amplify.addPluggable(
//     new AWSIoTProvider({
//         aws_pubsub_region: appVariables.REGION,
//         aws_pubsub_endpoint: 'wss://xxxxxxxxxxxxx.iot.<YOUR-AWS-REGION>.amazonaws.com/mqtt'
//     })
// );

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
