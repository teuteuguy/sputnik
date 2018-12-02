import { Component, Input, OnInit, NgZone } from '@angular/core';

// AWS
import { AmplifyService } from 'aws-amplify-angular';
import * as AWS from 'aws-sdk';
declare var appVariables: any;

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from 'src/app/models/device.model';

// Services
import { AppSyncService } from 'src/app/services/appsync.service';
import { IOTService } from 'src/app/services/iot.service';
import { checkAndUpdatePureExpressionDynamic } from '@angular/core/src/view/pure_expression';

@Component({
    selector: 'app-model-trainer-v1-0',
    templateUrl: './model-trainer.component.html'
})
export class ModelTrainerV10Component extends IoTPubSuberComponent implements OnInit {
    @Input()
    device: Device = new Device();

    private shadowField = 'modelTrainer';

    latestData: any = null;

    public imgUrl = '';
    private s3 = null;
    public list: any = [];

    constructor(
        private iotService: IOTService,
        private amplifyService: AmplifyService,
        private ngZone: NgZone,
        private appSyncService: AppSyncService
    ) {
        super(iotService);
    }

    ngOnInit() {
        this.amplifyService
            .auth()
            .currentCredentials()
            .then(creds => {
                this.s3 = new AWS.S3({
                    accessKeyId: creds.accessKeyId,
                    secretAccessKey: creds.secretAccessKey,
                    sessionToken: creds.sessionToken,
                    region: appVariables.REGION
                });
            })
            .catch(err => {
                console.error(err);
            });

        // const s3Key = 'model-trainer-v1.0/AMCF1_bESA7A-Ywh/rawdata/nolego/1543434194624.jpg';
        // this.amplifyService
        //     .auth()
        //     .currentCredentials()
        //     .then(creds => {
        //         // const config = new AWS.Config(creds.data.Credentials);
        //         const s3 = new AWS.S3({
        //             accessKeyId: creds.accessKeyId,
        //             secretAccessKey: creds.secretAccessKey,
        //             sessionToken: creds.sessionToken,
        //             region: appVariables.REGION
        //         });
        //         const params = { Bucket: appVariables.S3_DATA_BUCKET, Key: s3Key };
        //         console.log(params);
        //         const signedURL = s3.getSignedUrl('getObject', params);
        //         this.imgUrl = signedURL;
        //     // //     console.log(signedURL);
        //     // //     return s3.getObject(params).promise();
        //     // // })
        //     // // .then(result => {
        //     //     console.log(result);
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     });
        this.subscribe([
            {
                topic: '$aws/things/' + this.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    this.updateIncomingShadow(data.value, this.shadowField);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/camera',
                onMessage: data => {
                    this.latestData = data.value;
                    // if (this.latestData.hasOwnProperty('s3Key')) {
                    //     this.imgUrl = t
                    // }
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/logger',
                onMessage: data => {
                    // console.log('Logger:', data.value);
                    if (data.value.hasOwnProperty('type') && data.value.type === 'info') {
                        console.log('INFO:', data.value.payload);
                    }
                    if (data.value.hasOwnProperty('type') && data.value.type === 'exception') {
                        console.error('EXCEPTION:', data.value.payload);
                    }
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);

        this.getLastState(this.device.thingName, this.shadowField);
    }

    desiredStateChange(field) {
        if (field === 's3Upload') {
            this.update({ s3Upload: this.desired.s3Upload === 'On' ? 'Off' : 'On' });
        }
    }

    private update(desired) {
        const payload = {
            state: {
                desired: {}
            }
        };
        payload.state.desired[this.shadowField] = desired;
        // console.log(payload);
        this.iotService
            .updateThingShadow({ thingName: this.device.thingName, payload: JSON.stringify(payload) })
            .then(result => {
                // console.log(result);
                return result;
            })
            .catch(err => {
                console.error(err);
            });
    }

    remove(category) {
        const categories = this.desired.categories.slice();
        categories.splice(categories.indexOf(category), 1);
        this.update({ categories: categories });
    }

    capture(category) {
        const capture = this.desired.capture === 'Off' ? category : 'Off';
        this.update({ capture: capture });
    }

    addCategory(category) {
        if (category !== '' && this.desired.categories.indexOf(category) === -1) {
            const newCategories = this.desired.categories.slice();
            newCategories.push(category);
            // console.log(newCategories);
            this.update({ categories: newCategories });
        }
    }

    // private pagedListCategory(category, page)

    listCategory(category, page, nextToken = null) {
        const params = {
            Bucket: appVariables.S3_DATA_BUCKET,
            Prefix: 'model-trainer-v1.0/' + this.device.thingName + '/rawdata/' + category,
            MaxKeys: 100,
            ContinuationToken: nextToken
        };
        this.appSyncService
            .s3ListObjectsV2(params)
            .then(results => {
                this.list = results.Contents.map(i => i.Key);
                // console.log(results);
            })
            .catch(err => {
                console.error(err);
            });
    }

    getImageUrlForKey(key) {
        const params = { Bucket: appVariables.S3_DATA_BUCKET, Key: key };
        return this.s3.getSignedUrl('getObject', params);
    }

    deleteImage(i, key) {
        this.s3
            .deleteObject({
                Bucket: appVariables.S3_DATA_BUCKET,
                Key: key
            })
            .promise()
            .then(result => {
                this.list.splice(i, 1);
            })
            .catch(err => {
                console.error(err);
            });
    }
}
