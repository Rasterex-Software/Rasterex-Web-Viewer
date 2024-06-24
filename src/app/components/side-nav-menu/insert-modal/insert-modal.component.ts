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
        })
    }

    onClickPage(id: number) {
        this.checkedPageList[id] = !this.checkedPageList[id];
        const checkedPages = this.convertArray(this.checkedPageList);
        this.checkedPageRangeStr = this.convertArrayToString(checkedPages)
        console.log(this.checkedPageRangeStr)
    }

    convertToBooleanArray(inputStr: string) {
        let numbers:any[] = [];
            let parts = inputStr.split(',');

            parts.forEach(part => {
                if (part.includes('-')) {
                    let [start, end] = part.split('-').map(Number);
                    for (let i = start; i <= end; i++) {
                        numbers.push(i);
                    }
                } else {
                    numbers.push(Number(part));
                }
            });
            let maxNumber = Math.max(...numbers);
            let boolArray = new Array(maxNumber + 1).fill(false);

            numbers.forEach(num => {
                boolArray[num] = true;
            });

            return boolArray;
        }

    onBlurCheckPageRange() {
        this.checkedPageRangeStr = this.formatRanges(this.checkedPageRangeStr);
        this.checkedPageList = this.convertToBooleanArray(this.checkedPageRangeStr)
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
                return [start, end];
            } else {
                return [Number(item)];
            }
        });
    }

    addPages() {
        let width = this.customWidth;
        let height = this.customHeight;

        let pageRange = this.parseStringToNumArray(this.pageRangeStr)

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

    parseInputString(str) {
        let numbers: any[] = [];

        // Split the input string by commas
        let parts = str.split(',');

        parts.forEach(part => {
            // Check if the part is a range
            if (part.includes('-')) {
                let [start, end] = part.split('-').map(Number);
                // Add all numbers in the range to the numbers array
                for (let i = start; i <= end; i++) {
                    numbers.push(i);
                }
            } else {
                // Otherwise, add the single number to the numbers array
                numbers.push(Number(part));
            }
        });

        return numbers;
    }

    convertToRanges(numbers) {
        // Sort the numbers
        numbers.sort((a, b) => a - b);

        let result: any[] = [];
        let start = numbers[0];
        let end = numbers[0];

        for (let i = 1; i < numbers.length; i++) {
            if (numbers[i] === end + 1) {
                // If the current number is consecutive, extend the range
                end = numbers[i];
            } else {
                // If the current number is not consecutive, push the current range
                if (start === end) {
                    result.push(start.toString());
                } else {
                    result.push(`${start}-${end}`);
                }
                // Start a new range
                start = numbers[i];
                end = numbers[i];
            }
        }

        // Push the last range
        if (start === end) {
            result.push(start.toString());
        } else {
            result.push(`${start}-${end}`);
        }

        return result.join(',');
    }

    convertArrayToString(array) {
        return array.map(range => {
            if (range.length === 2) {
                return `${range[0]}-${range[1]}`;
            } else {
                return `${range[0]}`;
            }
        }).join(',');
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
                this.checkedPageRangeStr = `0-${value.length-1}`
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
        let newPageRange = this.pageRange;
        console.log(this.selectedRadioValue)
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