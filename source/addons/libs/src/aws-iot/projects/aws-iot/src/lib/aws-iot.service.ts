// Angular
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// AWS
import { AmplifyService } from 'aws-amplify-angular';
import Amplify from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';

// -----
import gql from 'graphql-tag';

const attachPrincipalPolicy = gql`
    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {
        attachPrincipalPolicy(policyName: $policyName, principal: $principal)
    }
`;
const getThingShadow = gql`
    query GetThingShadow($params: AWSJSON!) {
        getThingShadow(params: $params) {
            payload
        }
    }
`;
const updateThingShadow = gql`
    mutation UpdateThingShadow($params: AWSJSON!) {
        updateThingShadow(params: $params) {
            payload
        }
    }
`;

declare var appVariables: any;


@Injectable(
// {
//     providedIn: 'root'
// }
)
export class AWSIoTService {

    private connectionSubject: any = new Subject<boolean>();
    public connectionObservable$ = this.connectionSubject.asObservable();
    public isConnected = false;

    constructor(private amplifyService: AmplifyService) { }

    connect() {
        this.amplifyService
            .auth()
            .currentCredentials()
            .then(credentials => {

                const promise: any = this.amplifyService.api().graphql({
                    query: attachPrincipalPolicy.loc.source.body,
                    variables: {
                        policyName: appVariables.IOT_COGNITO_POLICY,
                        principal: credentials.identityId
                    }
                });

                return promise.then(result => {
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
    }

    getThingShadow(params: any) {
        const promise: any = this.amplifyService.api().graphql({
            query: getThingShadow.loc.source.body,
            variables: {
                params: JSON.stringify(params)
            }
        });
        return promise.then(result => JSON.parse(result.data.getThingShadow.payload));
    }

    updateThingShadow(params: any) {
        const promise: any = this.amplifyService.api().graphql({
            query: updateThingShadow.loc.source.body,
            variables: {
                params: JSON.stringify(params)
            }
        });

        return promise.then(result => JSON.parse(result.data.updateThingShadow.payload));
    }
}
