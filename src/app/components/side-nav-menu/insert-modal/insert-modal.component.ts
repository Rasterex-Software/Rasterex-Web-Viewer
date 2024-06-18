import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { ModalType, SideNavMenuService } from "../side-nav-menu.service";
import { RxCoreService } from "src/app/services/rxcore.service";
import { RXCore } from "src/rxcore";

type PDFLoadingStatus = 'NONE' | 'LOADING' | 'LOADED'

@Component({
    selector: 'rx-insert-modal',
    templateUrl: './insert-modal.component.html',
    styleUrls: ['./insert-modal.component.scss']
})
export class InsertModalComponent implements OnInit {
    @ViewChild('fileToUpload') fileToUpload: ElementRef; 

    visible: ModalType = 'NONE';
    leftTabIndex: number = 0;
    leftTabActiveIndex: number = 0;
    selectedFileName: string;
    fileSize: number = 0;
    fileSizeUnits: string;
    file: any;
    isUploadFile: boolean = false;
    fileType: string;
    loadingStatus: PDFLoadingStatus = 'NONE';

    thumbnails: ImageData[] = []

    numpages: number = 0;
    currentPage: number = 0;
    numberPages: number = 1;

    customWidth: number = 8.5;
    customHeight: number = 11;

    isInvalid: boolean = false;

    checkedPageList:boolean[] = []

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
        private rxCoreService: RxCoreService,
    ) {}

    ngOnInit(): void {
        this.clearData(); 
        this.leftTabActiveIndex = 0;
        this.sideNavMenuService.insertModalChanged$.subscribe(value => {
            this.visible = value
        })
        this.rxCoreService.guiState$.subscribe(state => {
            this.numpages = state.numpages;
        });
        this.sideNavMenuService.rightClickedPage$.subscribe(value => {
            this.currentPage = value + 1;
        })
    }

    close() {
        if (this.selectedFileName) this.clearData();
        this.sideNavMenuService.toggleInsertModal('NONE')
    }

    addPages() {
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

    handleFileSelect(item): void {
        this.uploadFile(item);
        this.fileType = item.type;
    }

    handleFileUpload(event) {
        const file = this.file = event.target ? event.target.files[0] : event[0];

        if (file) {
        this.selectedFileName = file.name;
        const bytes = file.size;

        if (bytes < 1024) {
            this.fileSize = parseFloat(bytes.toFixed(2)); 
            this.fileSizeUnits = 'B';
        } else if (bytes < 1024 * 1024) {
            this.fileSize = parseFloat((bytes / 1024).toFixed(2));
            this.fileSizeUnits = 'КB';
        } else if (bytes < 1024 * 1024 * 1024) {
            this.fileSize = parseFloat((bytes / (1024 * 1024)).toFixed(2));
            this.fileSizeUnits = 'МB';
        } else {
            this.fileSize = parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
            this.fileSizeUnits = 'GB';
        }
        }
    }

    uploadFile(fileSelect) {
        if (this.file || fileSelect) {
            this.loadingStatus = 'LOADING';
            RXCore.getAllThumbnailsFromFile(this.file).then(value => {
                this.thumbnails = value;
                this.loadingStatus = 'LOADED';
                this.checkedPageList = new Array(value.length).fill(true);
            })
        }

        // this.insertModalService.sendEventUploadFile();

        // if (this.file) this.onUpload.emit();
    }

    clearData() {
        this.file = undefined;
        this.selectedFileName = ''; 
        this.isUploadFile = false;
    }


    public onDrop(files: FileList): void {
        this.handleFileUpload(files);
        this.fileToUpload.nativeElement.files = files;
    }

    public onChooseClick() {
        this.fileToUpload.nativeElement.click();
    }

    selectedCount() {
        let count = 0;
        this.checkedPageList.forEach(value => {
            if(value) count ++;
        })
        return count;
    }

    selectPages() {
        this.checkedPageList = new Array(this.checkedPageList.length).fill(this.selectedCount() === 0)
    }

    convertArray(arr: boolean[]) {
        let result:number[][] = [];
        let start = -1;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) {
                if (start === -1) {
                    start = i;
                }
            } else {
                if (start !== -1) {
                    if (start === i - 1) {
                        result.push([start]);
                    } else {
                        result.push([start, i - 1]); 
                    }
                    start = -1; 
                }
            }
        }

        if (start !== -1) {
            if (start === arr.length - 1) {
                result.push([start]); 
            } else {
                result.push([start, arr.length - 1]); 
            }
        }

        return result;
}

    importPages() {
        const checkedPages = this.convertArray(this.checkedPageList);
        let startIndex = this.currentPage;
        if(this.selectedRadioValue === '1') {
            startIndex --;
        }
        this.loadingStatus = 'LOADING';
        RXCore.importPages(this.file, startIndex, checkedPages, this.visible === 'REPLACE', this.selectedCount()).then(() => {
            this.loadingStatus = 'NONE';
            this.visible = 'NONE'
        }).catch(() => {
            this.loadingStatus = 'NONE';
        })
    }
}