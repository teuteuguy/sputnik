import { Component, Input, OnInit } from '@angular/core';

// AWS
import { AmplifyService } from 'aws-amplify-angular';
import * as AWS from 'aws-sdk';
declare var appVariables: any;

// Components
import { IoTPubSuberComponent } from '@common-secure/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { AppSyncService } from '@services/appsync.service';
import { IOTService } from '@services/iot.service';
import { LoggerService } from '@services/logger.service';
import { S3Service } from '@services/s3/s3.service';
// import { checkAndUpdatePureExpressionDynamic } from '@angular/core/src/view/pure_expression';

const NAME = 'model-trainer-v1.0';

@Component({
    selector: 'app-model-trainer-v1-0',
    templateUrl: './model-trainer.component.html'
})
export class ModelTrainerV10Component extends IoTPubSuberComponent implements OnInit {
    @Input()
    device: Device = new Device();

    private s3 = null;
    private shadowField = 'modelTrainer';

    public imgUrl = '';
    public latestData: any = null;
    public list: any = [];

    constructor(
        private amplifyService: AmplifyService,
        private appSyncService: AppSyncService,
        private iotService: IOTService,
        private logger: LoggerService,
        private s3Service: S3Service
    ) {
        super(iotService);
    }

    ngOnInit() {
        const _self = this;

        _self.amplifyService
            .auth()
            .currentCredentials()
            .then(creds => {
                _self.s3 = new AWS.S3({
                    accessKeyId: creds.accessKeyId,
                    secretAccessKey: creds.secretAccessKey,
                    sessionToken: creds.sessionToken,
                    region: appVariables.REGION
                });
            })
            .catch(err => {
                _self.logger.error(err);
            });

        _self.subscribe([
            {
                topic: '$aws/things/' + _self.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    _self.updateIncomingShadow(data.value, _self.shadowField);
                },
                onError: err => {
                    _self.logger.error(err);
                }
            },
            {
                topic: 'mtm/' + _self.device.thingName + '/camera',
                onMessage: data => {
                    _self.latestData = data.value;
                },
                onError: err => {
                    _self.logger.error(err);
                }
            },
            {
                topic: 'mtm/' + _self.device.thingName + '/logger',
                onMessage: data => {
                    if (data.value.hasOwnProperty('type') && data.value.type === 'info') {
                        _self.logger.info('INFO:', data.value.payload);
                    }
                    if (data.value.hasOwnProperty('type') && data.value.type === 'exception') {
                        _self.logger.warn('EXCEPTION:', data.value.payload);
                    }
                },
                onError: err => {
                    _self.logger.error(err);
                }
            }
        ]);

        _self.getLastState(_self.device.thingName, _self.shadowField);
    }

    private updateDesiredModelTrainer(desired) {
        const state = {};
        state[this.shadowField] = desired;
        this.updateDesiredShadow(this.device.thingName, state)
            .then(result => {
                this.logger.info('updateDesiredModelTrainer:', result);
            })
            .catch(err => {
                this.logger.error('ERROR: updateDesiredModelTrainer:', err);
            });
    }

    public modifyState(cmd, param = null) {
        if (cmd === 's3Upload') {
            this.updateDesiredModelTrainer({
                s3Upload: this.desired.s3Upload === 'On' ? 'Off' : 'On'
            });
        }
        if (cmd === 'categories.remove' && param) {
            const categories = this.desired.categories.slice();
            categories.slice().splice(categories.indexOf(param), 1);
            this.updateDesiredModelTrainer({
                categories: categories
            });
        }
        if (cmd === 'capture' && param) {
            this.updateDesiredModelTrainer({
                capture: this.desired.capture === 'Off' ? param : 'Off'
            });
        }
        if (cmd === 'categories.add' && param && param !== '' && this.desired.categories.indexOf(param) === -1) {
            const newCategories = this.desired.categories.slice();
            newCategories.push(param);
            this.updateDesiredModelTrainer({
                categories: newCategories
            });
        }
    }

    listImagesForCategory(category, page, nextToken = null) {
        const _self = this;

        _self.iotService
            .getThingShadow({
                thingName: _self.device.thingName
            })
            .then(shadow => {
                if (
                    shadow &&
                    shadow.hasOwnProperty('state') &&
                    shadow.state.hasOwnProperty('desired') &&
                    shadow.state.desired.hasOwnProperty(_self.shadowField) &&
                    shadow.state.desired[_self.shadowField].hasOwnProperty('s3KeyPrefix')
                ) {
                    let prefix = shadow.state.desired[_self.shadowField].s3KeyPrefix;
                    if (!prefix.endsWith('/')) {
                        prefix += '/';
                    }

                    const params = {
                        Bucket: appVariables.S3_DATA_BUCKET,
                        Prefix: prefix + category,
                        MaxKeys: 100,
                        ContinuationToken: nextToken
                    };
                    _self.appSyncService
                        .s3ListObjectsV2(params)
                        .then(results => {
                            _self.list = results.Contents.map(i => i.Key);
                        })
                        .catch(err => {
                            _self.logger.error(err);
                        });
                } else {
                    throw new Error('the shadow has incorrect arguments. Missing: s3KeyPrefix');
                }
            });
    }

    deleteImage(key) {
        const _self = this;

        _self.s3Service
            .deleteKey(key)
            .then(() => {
                _self.list.splice(_self.list.indexOf(key), 1);
            })
            .catch(err => {
                _self.logger.error(err);
            });
    }
}
