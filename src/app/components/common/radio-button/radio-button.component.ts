import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'rx-radio-button',
    styleUrls: ['./radio-button.component.scss'],
    templateUrl: './radio-button.component.html'
})
export class RadioButtonComponent{
    @Input() options: Array<{ label: string, value: any }> = [];
    @Input() class: string;
    @Input() selectedValue: any;
    @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

    onSelectionChange(value: any) {
        this.selectionChange.emit(value);
    }
}