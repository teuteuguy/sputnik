import { Injectable } from '@angular/core';

// AWS
// import Amplify, { PubSub } from 'aws-amplify';
// import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import { AmplifyService } from 'aws-amplify-angular';
import Amplify, { PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';

import attachPrincipalPolicy from '../graphql/mutations/attach-principal-policy';

declare var appVariables: any;

@Injectable()
export class IOTService {
    constructor(private amplifyService: AmplifyService) {}

    connect() {
        this.amplifyService
            .auth()
            .currentCredentials()
            .then(credentials => {
                // console.log(credentials.identityId);

                const promise: any = this.amplifyService.api().graphql({
                    query: attachPrincipalPolicy.loc.source.body,
                    variables: {
                        policyName: appVariables.IOT_COGNITO_POLICY,
                        principal: credentials.identityId
                    }
                });

                promise
                    .then(result => {
                        result = result.data.attachPrincipalPolicy;
                        if (result === true) {
                            Amplify.addPluggable(
                                new AWSIoTProvider({
                                    aws_pubsub_region: appVariables.REGION,
                                    aws_pubsub_endpoint: 'wss://' + appVariables.IOT_ENDPOINT + '/mqtt'
                                })
                            );
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    });
            })
            .catch(err => {
                console.error(err);
            });
    }

    subscribe(topic: string) {
        // return this.amplifyService.pubsub().subscribe(topic);
            // .subscribe({
            //     next: data => console.log('Message received', data),
            //     error: error => console.error(error),
            //     close: () => console.log('Done')
            // });
        // PubSub.subscribe(topic).subscribe({
        //     next: data => console.log('Message received', data),
        //     error: error => console.error(error),
        //     close: () => console.log('Done')
        // });
    }

}
