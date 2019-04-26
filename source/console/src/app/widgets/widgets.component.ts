import {
    Component,
    Input,
    OnInit,
    AfterViewInit,
    ComponentFactoryResolver,
    ViewChildren,
    QueryList,
    ViewContainerRef
} from '@angular/core';

// Components
import { CardWidgetComponent } from './card-widget.component';
import { TextWidgetComponent } from './text-widget.component';
import { ColorPickerWidgetComponent } from './color-picker-widget.component';

// Directives
// import { WidgetDirective } from './widget.directive';

const widgetComponentTypes = {
    'text': TextWidgetComponent,
    'card': CardWidgetComponent,
    'color-picker': ColorPickerWidgetComponent
};

@Component({
    selector: 'app-widgets',
    template: `
        <!-- Row -->
        <div class="row">
            <div *ngFor="let widget of widgets" [ngClass]="widget.class">
                <ng-container #container></ng-container>
                <!-- <ng-container appWidget></ng-container> -->
            </div>
        </div>
        <!-- Row -->
    `
})
export class WidgetsComponent implements OnInit, AfterViewInit {
    @Input() widgets: any[];
    @Input() parent: any;
    // @ViewChildren(WidgetDirective) widgetDirectives: QueryList<WidgetDirective>;
    @ViewChildren('container', { read: ViewContainerRef }) private widgetContainers: QueryList<ViewContainerRef>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit() {

        this.parent.getValueByString = function(str) {
            let obj = this;
            str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
            str = str.replace(/^\./, ''); // strip a leading dot
            const ar = str.split('.');
            for (let i = 0, n = ar.length; i < n; ++i) {
                const key = ar[i];
                if (key in obj) {
                    obj = obj[key];
                } else {
                    return;
                }
            }
            return obj;
        };

        this.parent.setValueByString = function(str, value) {
            let obj = this;
            str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
            str = str.replace(/^\./, ''); // strip a leading dot
            const ar = str.split('.');
            str = ar[0];

            for (let i = 1, n = ar.length; i < n; ++i) {
                if (str in obj) {
                    obj = obj[str];
                } else {
                    return;
                }

                str = ar[i];
            }

            obj[str] = value;
        };
    }
    ngAfterViewInit() {
        // console.log('AfterViewInit', this.widgets);
        // Promise.resolve(null).then(() => this.loadComponents());
        this.loadComponents();
    }

    private getComponentForWidgetType(widgetType) {
        return widgetComponentTypes[widgetType];
    }

    loadComponents() {
        console.log('loadComponents: Loading', this.widgetContainers.length, 'components');
        this.widgetContainers.forEach((widgetContainer: ViewContainerRef, index) => {
            const viewComponent = this.getComponentForWidgetType(this.widgets[index].type);
            console.log('loadComponents:', this.widgets[index].type);
            if (viewComponent) {
                const componentFactory = this.componentFactoryResolver.resolveComponentFactory(viewComponent);
                const viewContainerRef = widgetContainer;
                viewContainerRef.clear();
                const componentRef = viewContainerRef.createComponent(componentFactory);
                (<typeof viewComponent>componentRef.instance).parent = this.parent;
                (<typeof viewComponent>componentRef.instance).data = this.widgets[index].data || {};
                componentRef.changeDetectorRef.detectChanges();
            }
        });
        // this.widgetDirectives.forEach((widgetDirective: WidgetDirective, index) => {
        //     const viewComponent = this.getComponentForWidgetType(this.widgets[index].type);
        //     if (viewComponent) {
        //         const componentFactory = this.componentFactoryResolver.resolveComponentFactory(viewComponent);
        //         const viewContainerRef = widgetDirective.viewContainerRef;
        //         viewContainerRef.clear();
        //         const componentRef = viewContainerRef.createComponent(componentFactory);
        //         console.log(componentRef);
        //         (<typeof viewComponent>componentRef.instance).parent = this.parent;
        //         (<typeof viewComponent>componentRef.instance).data = this.widgets[index].data || {};
        //         componentRef.changeDetectorRef.detectChanges();
        //     }
        // });
    }
}
