import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Action } from "../pages/pages.component";

@Component({
    selector: 'rx-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
    @Input() x: number;
    @Input() y: number;
    @Input() show: boolean;
   @Output('onAction') onAction = new EventEmitter<Action>();

   setAction(action: Action) {
        this.onAction.emit(action)
    }
}