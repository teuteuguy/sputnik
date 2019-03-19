(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('@sputnik-addon-iot/component'), require('@sputnik-addon-iot/service'), require('@sputnik-addon-iot/module')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common', '@sputnik-addon-iot/component', '@sputnik-addon-iot/service', '@sputnik-addon-iot/module'], factory) :
    (global = global || self, factory(global['murata-vibration-sensor-network'] = {}, global.ng.core, global.ng.common, global.component, global.service, global.module));
}(this, function (exports, core, common, component, service, module) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    let MurataVibrationSensorNetworkComponent = class MurataVibrationSensorNetworkComponent extends component.AddonIoTComponent {
        constructor(awsIoTService) {
            super(awsIoTService);
            this.awsIoTService = awsIoTService;
        }
        ngOnInit() {
            console.log(this.awsIoTService, this.awsIoTService.connectionObservable$);
            this.awsIoTService.connectionObservable$.subscribe(isConnected => {
                console.log('Murata, is connected to AWS IoT', isConnected);
            });
            // private connectionSubject: any = new Subject<boolean>();
            // public connectionObservable$ = this.connectionSubject.asObservable();
            // this.awsIoTService.connectionObservable$.subscribe(isConnected => {
            //     console.log('Murata, is connected to AWS IoT', isConnected);
            // });
            // setTimeout(() => {
            //     this.subscribe([
            //         {
            //             topic: 'mtm/AMCF1_bESA7A-Ywh/camera',
            //             onMessage: data => {
            //                 console.log('Data:', data.value);
            //             },
            //             onError: err => {
            //                 console.error('Error:', err);
            //             }
            //         },
            //         {
            //             topic: 'mtm/AMCF1_bESA7A-Ywh/logger',
            //             onMessage: data => {
            //                 console.log('Logger:', data.value);
            //             },
            //             onError: err => {
            //                 console.error('Error:', err);
            //             }
            //         }
            //     ]);
            // }, 5000);
        }
    };
    MurataVibrationSensorNetworkComponent = __decorate([
        core.Component({
            selector: 'murata-vibration-sensor-network-component',
            template: `
        <h3>Hi, I am the Plugin A component.</h3>
    `
        }),
        __metadata("design:paramtypes", [service.AddonIoTService])
    ], MurataVibrationSensorNetworkComponent);

    exports.MurataVibrationSensorNetworkModule = class MurataVibrationSensorNetworkModule {
    };
    exports.MurataVibrationSensorNetworkModule = __decorate([
        core.NgModule({
            declarations: [MurataVibrationSensorNetworkComponent],
            entryComponents: [MurataVibrationSensorNetworkComponent],
            imports: [common.CommonModule, module.AddonIoTModule],
            providers: [
                service.AddonIoTService,
                {
                    provide: 'addons',
                    useValue: [
                        {
                            name: 'murata-vibration-sensor-network-component',
                            component: MurataVibrationSensorNetworkComponent
                        }
                    ],
                    multi: true
                }
            ]
        })
    ], exports.MurataVibrationSensorNetworkModule);

    Object.defineProperty(exports, '__esModule', { value: true });

}));
