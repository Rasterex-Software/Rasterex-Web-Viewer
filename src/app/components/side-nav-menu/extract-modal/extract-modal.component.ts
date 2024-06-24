import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { RXCore } from "src/rxcore";
import { SideNavMenuService } from "../side-nav-menu.service";

@Component({
    selector: 'rx-extract-modal',
    styleUrls: ['./extract-modal.component.scss'],
    templateUrl: './extract-modal.component.html'
})
export class ExtractModalComponent implements OnInit {
    @Output() closed = new EventEmitter<void>();

    visible: boolean = false;
    pageRange: number[][] = [];

    constructor(
        private sideNavMenuService: SideNavMenuService
    ){}

    ngOnInit(): void {
        this.sideNavMenuService.extractModalChanged$.subscribe(value => {
            this.visible = value
        })
        this.sideNavMenuService.pageRange$.subscribe(value => {
            this.pageRange = value
        })
    }

    cancel() {
        this.sideNavMenuService.toggleExtractModal(false)
    }

    extract(isDelete: boolean) {
        RXCore.extractPage(this.pageRange, isDelete);
        this.cancel()
    }
}