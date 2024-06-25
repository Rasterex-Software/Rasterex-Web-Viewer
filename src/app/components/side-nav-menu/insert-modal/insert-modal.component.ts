import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { ModalType, SideNavMenuService } from "../side-nav-menu.service";
import { RxCoreService } from "src/app/services/rxcore.service";
import { RXCore } from "src/rxcore";
import { RecentFilesService } from "../../recent-files/recent-files.service";

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
    pageRangeStr: string = "";
    checkedPageRangeStr: string = "";
    numberPages: number = 1;

    customWidth: number = 8.5;
    customHeight: number = 11;

    isInvalid: boolean = false;

    checkedPageList:boolean[] = []

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
    

    constructor(
        private sideNavMenuService: SideNavMenuService,
        private rxCoreService: RxCoreService,
        private recentFileService: RecentFilesService,
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
        this.sideNavMenuService.pageRange$.subscribe(value => {
            this.pageRange = value;
            this.pageRangeStr = this.convertArrayToString(value)
            this.currentPage = value[0][0] + 1;
        });
        this.leftTabIndex = 0;
    }

    onClickPage(id: number) {
        this.checkedPageList[id] = !this.checkedPageList[id];
        const checkedPages = this.convertArray(this.checkedPageList);
        this.checkedPageRangeStr = this.convertArrayToString(checkedPages)
    }

    convertToBooleanArray(inputStr: string): boolean[] {
        const numberList: number[] = [];
        const inputParts = inputStr.split(',');

        let maxNumber = -Infinity;
        let minNumber = Infinity;

        inputParts.forEach(part => {
            if (part.includes('-')) {
                let [start, end] = part.split('-').map(Number);
                if (start === 0) start = 1; // Normalize range starting from 0 to start from 1
                for (let i = start; i <= end; i++) {
                    numberList.push(i);
                }
                if (start < minNumber) minNumber = start;
                if (end > maxNumber) maxNumber = end;
            } else {
                let num = Number(part);
                if (num === 0) num = 1; // Normalize single number 0 to 1
                numberList.push(num);
                if (num < minNumber) minNumber = num;
                if (num > maxNumber) maxNumber = num;
            }
        });

        // Fill the boolean array from minNumber to maxNumber
        const booleanArray: boolean[] = new Array(maxNumber).fill(false);

        numberList.forEach(num => {
            booleanArray[num - 1] = true;
        });

        return booleanArray;
    }


    onBlurCheckPageRange() {
        this.checkedPageRangeStr = this.formatRanges(this.checkedPageRangeStr);
        this.checkedPageList = this.convertToBooleanArray(this.checkedPageRangeStr);
    }

    close() {
        this.clearData();
        this.sideNavMenuService.toggleInsertModal('NONE')
        this.loadingStatus = 'NONE';
    }

    parseStringToNumArray(input) {
        return input.split(',').map(item => {
            if (item.includes('-')) {
                const [start, end] = item.split('-').map(Number);
                return [start - 1, end - 1];
            } else {
                return [Number(item) - 1];
            }
        });
    }

    addPages() {
        let width = this.customWidth;
        let height = this.customHeight;

        let pageRange = this.parseStringToNumArray(this.pageRangeStr)

        console.log(pageRange)

        if(this.selectedRadioValue === '2') {
            pageRange = pageRange.map(array => {
                return array.map(value => {
                    return value + 1;
                })
            })
        }

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

        RXCore.insertBlankPages(pageRange, this.numberPages, width, height)
        this.close()
    }

    parseInputString(str: string): number[] {
        const ranges: [number, number][] = [];
        const inputParts = str.split(',');

        inputParts.forEach(part => {
            let [start, end] = part.includes('-') ? part.split('-').map(Number) : [Number(part), Number(part)];
            if (start === 0) start = 1; // Normalize range starting from 0 to start from 1
            if (end === 0) end = 1; // Normalize single number 0 to 1
            ranges.push([start, end]);
        });

        ranges.sort((a, b) => a[0] - b[0]); // Sort ranges by their starting values

        // Merge overlapping and adjacent ranges while filling numbers
        const mergedNumbers: number[] = [];
        let [currentStart, currentEnd] = ranges[0];

        for (let i = 1; i < ranges.length; i++) {
            const [start, end] = ranges[i];
            if (start <= currentEnd + 1) {
                currentEnd = Math.max(currentEnd, end);
            } else {
                for (let j = currentStart; j <= currentEnd; j++) {
                    mergedNumbers.push(j);
                }
                currentStart = start;
                currentEnd = end;
            }
        }

        // Add the final merged range
        for (let j = currentStart; j <= currentEnd; j++) {
            mergedNumbers.push(j);
        }

        return mergedNumbers;
    }

    convertToRanges(numbers: number[]): string {
        if (numbers.length === 0) return '';

        // Sort the numbers
        numbers.sort((a, b) => a - b);

        const result: string[] = [];
        let start = numbers[0];
        let end = numbers[0];

        for (let i = 1; i < numbers.length; i++) {
            if (numbers[i] === end + 1) {
                end = numbers[i];
            } else {
                result.push(start === end ? `${start}` : `${start}-${end}`);
                start = numbers[i];
                end = numbers[i];
            }
        }

        // Add the final range
        result.push(start === end ? `${start}` : `${start}-${end}`);

        return result.join(',');
    }

    convertArrayToString(array) {
        return array.map(range => 
            range.length === 2 ? `${range[0] + 1}-${range[1] + 1}` : `${range[0] + 1}`
        ).join(',');
    }

    formatRanges(inputStr) {
        let numbers = this.parseInputString(inputStr);
        return this.convertToRanges(numbers);
    }

    onBlurPageRange() {
        this.pageRangeStr = this.formatRanges(this.pageRangeStr);
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
                this.checkedPageRangeStr = `1-${value.length}`
            }).catch(() => {
                this.loadingStatus = 'NONE';
            }) 
        }
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
        return this.checkedPageList.reduce((count, value) => count + (value ? 1 : 0), 0);
    }

    selectPages() {
        const count = this.selectedCount();
        this.checkedPageRangeStr = count === 0 ? `1-${this.checkedPageList.length}` : ``;  
        this.checkedPageList = new Array(this.checkedPageList.length).fill(count === 0);
    }

    convertArray(arr: boolean[]): number[][] {
        const result: number[][] = [];
        let start = -1;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) {
                if (start === -1) start = i;
            } else {
                if (start !== -1) {
                    result.push(start === i - 1 ? [start] : [start, i - 1]);
                    start = -1;
                }
            }
        }

        if (start !== -1) {
            result.push(start === arr.length - 1 ? [start] : [start, arr.length - 1]);
        }

        return result;
    }

    importPages() {
        const checkedPages = this.convertArray(this.checkedPageList);
        let newPageRange = this.pageRange;

        if(this.selectedRadioValue === '2') {
            newPageRange = newPageRange.map(array => {
                return array.map(value => {
                    return value + 1;
                })
            })
        }
        
        this.loadingStatus = 'LOADING';
        RXCore.importPages(this.file, newPageRange, checkedPages, this.visible === 'REPLACE', this.selectedCount()).then(() => {
            this.loadingStatus = 'NONE';
            this.visible = 'NONE'
        }).catch(() => {
            this.loadingStatus = 'NONE';
        })
    }
}