import { Component, OnInit } from "@angular/core";
import { SideNavMenuService } from "../side-nav-menu.service";
import { RxCoreService } from "src/app/services/rxcore.service";
import { RXCore } from "src/rxcore";

@Component({
    selector: 'rx-replace-modal',
    templateUrl: './replace-modal.component.html',
    styleUrls: ['./replace-modal.component.scss']
})
export class ReplaceModalComponent implements OnInit {
    visible: boolean = false;
    isBlank: boolean = true;
    numpages: number = 0;
    currentPage: number = 0;
    numberPages: number = 1;

    customWidth: number = 8.5;
    customHeight: number = 11;

    isInvalid: boolean = false;

    radioOptions = [
        { label: 'Above Page', value: '1' },
        { label: 'Below Page', value: '2' },
    ];

    presetsOptions = [
        { label: 'Letter', value: '1' },
        { label: 'Half Letter', value: '2' },
        { label: 'Junior Legal', value: '3' },
        { label: 'Custom', value: '4' }
    ]

    unitsOptions = [
        { label: 'Inches (in)', value: '1' },
        { label: 'Centimeters (cm)', value: '2' },
        { label: 'Millimeters (mm)', value: '3' },
    ]

    selectedRadioValue = '1';
    selectedPresets = '1';
    selectedUnits = '1';

    constructor(
        private sideNavMenuService: SideNavMenuService,
        private rxCoreService: RxCoreService
    ) {}

    ngOnInit(): void {
        this.sideNavMenuService.replaceModalChanged$.subscribe(value => {
            this.visible = value
        })
        this.rxCoreService.guiState$.subscribe(state => {
            this.numpages = state.numpages;
        });
        this.sideNavMenuService.rightClickedPage$.subscribe(value => {
            this.currentPage = value + 1;
        })
    }

    replacePages() {
        let startIndex = this.currentPage;
        if(this.selectedRadioValue === '1') {
            startIndex --;
        }
        let width = this.customWidth;
        let height = this.customHeight;

        const DPI = RXCore.getDPI()

        switch (this.selectedPresets) {
            case '1':
                width = 8.5 * DPI.x;
                height = 11 * DPI.y;
                break;
            case '2':
                width = 5.5 * DPI.x;
                height = 8.5 * DPI.y;
                break;
            case '3':
                width = 5 * DPI.x;
                height = 8 * DPI.y;
                break;
            default:
                switch(this.selectedUnits) {
                    case '1':
                        width = this.customWidth * DPI.x;
                        height = this.customHeight * DPI.y;
                        break;
                    case '2':
                        width = this.customWidth / 2.54 * DPI.x;
                        height = this.customHeight / 2.54 * DPI.y;
                        break;
                    default:
                        width = this.customWidth / 25.4 * DPI.x;
                        height = this.customHeight / 25.4 * DPI.y;
                }
        }

        RXCore.insertBlankPages(startIndex, this.numberPages, width, height)
        this.close()
    }

    validate() {
        if(this.customWidth < 0 || this.customHeight < 0 || this.currentPage <= 0 || this.currentPage > this.numpages || this.numberPages <= 0) {
            this.isInvalid = true;
            return;
        } else {
            this.isInvalid = false;
        }
    }

    browseFiles() {

    }

    onRadioSelectionChange(value: any) {
        this.selectedRadioValue = value;
        this.validate()
    }
    onPresetsSelectionChange(value: any) {
        this.selectedPresets = value;
        this.validate()
    }
    onUnitsSelectionChange(value: any) {
        this.selectedUnits = value;
        this.validate()
    }

    setBlank(value: boolean) {
        this.isBlank = value
    }

    close() {
        this.sideNavMenuService.toggleReplaceModal(false)
    }
}