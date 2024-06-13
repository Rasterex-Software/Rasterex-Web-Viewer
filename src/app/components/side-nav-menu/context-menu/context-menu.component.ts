import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'rx-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
    @Input() x: number;
    @Input() y: number;
    @Input() show: boolean;
   @Output('onAction') onAction = new EventEmitter<string>();

    setAction(action: string) {
        this.onAction.emit(action)
    }
}