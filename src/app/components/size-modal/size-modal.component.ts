import { Component, OnInit } from "@angular/core";
import { SideNavMenuService } from "../side-nav-menu/side-nav-menu.service";
import { RXCore } from "src/rxcore";

@Component({
    selector: 'rx-size-modal',
    templateUrl: './size-modal.component.html',
    styleUrls: ['./size-modal.component.scss']
})
export class SizeModalComponent implements OnInit {
    visible: boolean = false;
    pageRange: number[][] = [];

    radioOptions = [
        { label: 'Above Page', value: '1' },
        { label: 'Below Page', value: '2' },
    ];

    presetsOptions = [
        { label: 'A4', value: '1' },
        { label: 'A3', value: '2' },
        { label: 'Letter', value: '3' },
        { label: 'Half Letter', value: '4' },
        { label: 'Junior Legal', value: '5' },
        { label: 'Custom', value: '6' }
    ]

    unitsOptions = [
        { label: 'Inches (in)', value: '1' },
        { label: 'Centimeters (cm)', value: '2' },
        { label: 'Millimeters (mm)', value: '3' },
    ]

    selectedRadioValue = '1';
    selectedPresets = '1';
    selectedUnits = '1';

    customWidth: number = 8.5;
    customHeight: number = 11;

    isInvalid: boolean = false;

    ngOnInit(): void {
        this.sideNavbarService.pageRange$.subscribe(value => {
            this.pageRange = value;
        });
        this.sideNavbarService.sizeModalChanged$.subscribe(value => {
            this.visible = value;
        })
    }

    constructor(
        private sideNavbarService: SideNavMenuService
    ) {}

    validate() {
        if(this.customWidth < 0 || this.customHeight < 0) {
            this.isInvalid = true;
            return;
        } else {
            this.isInvalid = false;
        }
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

    close() {
        this.sideNavbarService.toggleSizeModal(false)
    }

    change() {
        let width = this.customWidth;
        let height = this.customHeight;
        const DPI = RXCore.getDPI()

        switch (this.selectedPresets) {
            case '1':
                width = 8.27 * DPI.x;
                height = 11.69 * DPI.y;
                break;
            case '2':
                width = 11.69 * DPI.x;
                height = 16.54 * DPI.y;
                break;
            case '3':
                width = 8.5 * DPI.x;
                height = 11 * DPI.y;
                break;
            case '4':
                width = 5.5 * DPI.x;
                height = 8.5 * DPI.y;
                break;
            case '5':
                width = 5 * DPI.x;
                height = 8 * DPI.y;
                break;
            default:
                switch(this.selectedUnits) {
                    case '3':
                        width = this.customWidth * DPI.x;
                        height = this.customHeight * DPI.y;
                        break;
                    case '4':
                        width = this.customWidth / 2.54 * DPI.x;
                        height = this.customHeight / 2.54 * DPI.y;
                        break;
                    default:
                        width = this.customWidth / 25.4 * DPI.x;
                        height = this.customHeight / 25.4 * DPI.y;
                }
        }

        RXCore.setPageSize(this.pageRange, width, height);
        this.close();
    }
}