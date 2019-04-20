import {
    Component,
    Input,
    AfterViewInit,
    ComponentFactoryResolver,
    ViewChildren,
    QueryList,
    HostBinding
} from '@angular/core';

// Components
// import { WidgetComponent } from './widget.component';
import { CardWidgetComponent } from './card-widget.component';
import { TextWidgetComponent } from './text-widget.component';

// Directives
import { WidgetDirective } from './widget.directive';

const componentTypes = {
    text: TextWidgetComponent,
    card: CardWidgetComponent
};

@Component({
    selector: 'app-widgets',
    template: `
        <ng-template appWidget *ngFor="let widget of widgets"></ng-template>
    `
})
export class WidgetsComponent implements AfterViewInit {

    @HostBinding('style.display') display = 'block';

    @Input() widgets: any[];
    @Input() root: any;
    @ViewChildren(WidgetDirective) widgetDirectives: QueryList<WidgetDirective>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngAfterViewInit() {
        Promise.resolve(null).then(() => this.loadComponents());
    }

    loadComponents() {
        this.widgetDirectives.forEach((widgetDirective: WidgetDirective, i) => {
            console.log('here', this.widgets[i].type, this.widgets[i].content, widgetDirective);
            const viewComponent = componentTypes[this.widgets[i].type];
            if (viewComponent) {
                const componentFactory = this.componentFactoryResolver.resolveComponentFactory(viewComponent);
                const viewContainerRef = widgetDirective.viewContainerRef;
                viewContainerRef.clear();

                const componentRef = viewContainerRef.createComponent(componentFactory);
                componentRef.changeDetectorRef.detectChanges();
                (<typeof viewComponent>componentRef.instance).root = this.widgets[i].root;
                (<typeof viewComponent>componentRef.instance).content = this.widgets[i].content;
                (<typeof viewComponent>componentRef.instance).options = this.widgets[i].options;
            }
        });
    }
}
