import { Component, AfterViewInit, Compiler, Injector, ViewChild, ViewContainerRef } from '@angular/core';

declare const SystemJS: any;

@Component({
    selector: 'app-root-tests',
    templateUrl: './tests.component.html'
})
export class TestsComponent implements AfterViewInit {
    public title = 'Tests';

    @ViewChild('content', { read: ViewContainerRef }) content: ViewContainerRef;

    constructor(private _compiler: Compiler, private _injector: Injector) {}

    ngAfterViewInit() {
        this.loadPlugins();
    }

    private async loadPlugins() {

        console.log('loadPlugins');
        // import external module bundle
        // const module = await SystemJS.import('assets/plugins/plugin-a.bundle.js');
        const module = await SystemJS.import(
            // 'assets/sample.bundle.js'
            // 'https://raw.githubusercontent.com/teuteuguy/sputnik-sample-addon/master/dist/sputnik-sample-addon.bundle.js'
            // 'https://s3.amazonaws.com/tims-solutions-us-east-1/sputnik/v0.9/addons/murata/murata-vibration-sensor-network.bundle.js'
            'assets/murata-vibration-sensor-network.bundle.js'
        );
        // 'https://raw.github.com/username/project/master/script.js';

        console.log('module', module);


        // compile module
        const moduleFactory = await this._compiler.compileModuleAsync<any>(
            module['MurataVibrationSensorNetworkModule']
        );

        // resolve component factory
        const moduleRef = moduleFactory.create(this._injector);

        //get the custom made provider name 'plugins'
        const componentProvider = moduleRef.injector.get('addons');

        //from plugins array load the component on position 0
        const componentFactory = moduleRef.componentFactoryResolver.resolveComponentFactory<any>(
            componentProvider[0][0].component
        );

        // compile component
        var pluginComponent = this.content.createComponent(componentFactory);

        //sending @Input() values
        //pluginComponent.instance.anyInput = "inputValue";

        //accessing the component template view
        //(pluginComponent.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    }
}
