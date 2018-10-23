import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-pretty-json',
    templateUrl: './pretty-json.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PrettyJsonComponent),
            multi: true
        }
    ]
})
export class PrettyJsonComponent implements ControlValueAccessor {
    private jsonString: string;
    private parseError: boolean;
    private data: any;

    private keyUpTimeOut1: any = null;
    private keyUpTimeOut2: any = null;
    private prettifying: boolean;

    @Input()
    rows: number;
    @Input()
    jsonWidth = 4;
    @Input()
    readonly = false;


    writeValue(value: any) {
        if (value) {
            this.data = value;
            // this will format it with 4 character spacing
            this.jsonString = JSON.stringify(this.data, undefined, this.jsonWidth);
        }
    }

    propagateChange = (_: any) => {};

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() {}

    // change events from the textarea
    private onChange(event) {
        // get value from text area
        const _self = this;
        const newValue = event.target.value;

        clearTimeout(this.keyUpTimeOut1);
        clearTimeout(this.keyUpTimeOut2);

        try {
            // parse it to json
            _self.data = JSON.parse(newValue);
            _self.parseError = false;

            this.keyUpTimeOut1 = setTimeout(function () {
                console.log('prettifying');
                _self.prettifying = true;
                _self.keyUpTimeOut2 = setTimeout(function () {
                    try {
                        _self.jsonString = JSON.stringify(JSON.parse(newValue), null, _self.jsonWidth);
                        event.target.value = _self.jsonString;
                    } catch (ex) {
                        console.log(ex);
                    }
                    console.log('prettifying done');
                    _self.prettifying = false;
                }, 500);
            }, 2000);

        } catch (ex) {
            // set parse error if it fails
            _self.parseError = true;
        }



        // update the form
        _self.propagateChange(this.data);
    }

    // editJsonOnKey(event: any, width: number, obj: any, attribute: string) {
    //     const _self = this;
    //     _self.prettifying = '';
    //     clearTimeout(_self.keyUpTimeOut1);
    //     clearTimeout(_self.keyUpTimeOut2);
    //     _self.keyUpTimeOut1 = setTimeout(function() {
    //         _self.prettifying = '(formating json...)';
    //         _self.keyUpTimeOut1 = setTimeout(function() {
    //             try {
    //                 obj[attribute] = JSON.stringify(JSON.parse(event.target.value), null, width);
    //                 event.target.value = obj[attribute];
    //                 _self.prettifying = '';
    //             } catch (ex) {
    //                 _self.prettifying = '(ERROR: JSON is incorrect!)';
    //             }
    //         }, 100);
    //     }, 500);
    // }
}