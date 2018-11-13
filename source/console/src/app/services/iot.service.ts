import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// AWS
import * as AWS from 'aws-sdk';
import { AmplifyService } from 'aws-amplify-angular';

import Amplify from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';

import attachPrincipalPolicy from '../graphql/mutations/attach-principal-policy';

declare var appVariables: any;

@Injectable()
export class IOTService {
    private iot;

    private connectionSubject: any = new Subject<boolean>();
    public connectionObservable$ = this.connectionSubject.asObservable();
    public isConnected = false;

    constructor(private amplifyService: AmplifyService) {
        this.iot = new AWS.Iot({ region: appVariables.REGION });
    }

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

                return promise.then(result => {
                    // console.log(result);
                    result = result.data.attachPrincipalPolicy;
                    if (result === true) {
                        Amplify.addPluggable(
                            new AWSIoTProvider({
                                aws_pubsub_region: appVariables.REGION,
                                aws_pubsub_endpoint: 'wss://' + appVariables.IOT_ENDPOINT + '/mqtt'
                            })
                        );
                    }
                    return result;
                });
            })
            .then(result => {
                console.log('Connected to AWS IoT', result);
                this.isConnected = true;
                this.connectionSubject.next(this.isConnected);
            })
            .catch(err => {
                console.error('Error while trying to connect to AWS IoT:', err);
                this.isConnected = false;
                this.connectionSubject.next(this.isConnected);
            });
    }

    subscribe(topic: string, onMessage, onError) {
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
        return this.amplifyService
            .pubsub()
            .subscribe(topic)
            .subscribe(
                data => onMessage(data),
                error => onError(error),
                () => {
                    console.log('Subscription to', topic, 'done.');
                }
            );
        // PubSub.subscribe(topic, {}).subscribe(
        //     data => console.log('Message received', data),
        //     error => console.error(error),
        //     () => console.log('Done'),
        // );
    }
}
