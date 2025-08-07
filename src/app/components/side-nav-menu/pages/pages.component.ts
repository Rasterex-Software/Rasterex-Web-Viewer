//import { Component, OnInit } from '@angular/core';
import { Component, HostListener, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { TreeviewConfig } from '../../common/treeview/models/treeview-config';
import { TreeviewItem } from '../../common/treeview/models/treeview-item';
import { SideNavMenuService } from '../side-nav-menu.service';
import { TopNavMenuService } from '../../top-nav-menu/top-nav-menu.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';


export type Action = 'move-top' | 'move-bottom' | 'move-up' | 'move-down' | 'rotate-r' | 'rotate-l' | 'page-insert' | 'page-replace' | 'page-copy' | 'page-paste' | 'page-extract' | 'page-delete' | 'page-size'


@Component({
  selector: 'rx-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

  tabActiveIndex: number = 0;
  isPDF : boolean = true;
  thumbnails: Array<any> = [];
  numpages: number = 1;
  selectedPageIndex: number = 0;
  rightClickedPageIndex: number = 0;
  page: number;
  scale: number = 95;
  bookmarks: Array<TreeviewItem> = [];
  search: string;
  viewBookmarks: boolean = false;

  menuHeight: number = 435;
  canPaste: boolean = false;


  multiSelect: boolean = false;
  checkList: boolean[] = [];
  checkString: string = ""

  // Context menu properties
  
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  showContextMenu: boolean = false;


  config = TreeviewConfig.create({
    hasFilter: true,
    decoupleChildFromParent: true
  });


  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly topMenuService: TopNavMenuService,
  ) {}


  //constructor(private readonly rxCoreService: RxCoreService) {}

  ngOnInit(): void {
    this.rxCoreService.guiState$.subscribe(state => {
      this.numpages = state.numpages;

      this.isPDF = state.isPDF;

      if(this.tabActiveIndex == 1){
        RXCore.getPDFBookmarks();
      }
      

    });

    this.rxCoreService.guiPageThumbs$.subscribe(data => {
      this.thumbnails = data;
      this.numpages = this.thumbnails.length;
      this.checkList = new Array(this.numpages).fill(false);
      this.checkList[this.selectedPageIndex] = true;
    });

    this.rxCoreService.guiPdfBookmarks$.subscribe(data => {

      this.bookmarks = [];
      this.bookmarks = this._getBookmarks(data);
    });

    this.rxCoreService.guiPage$.subscribe(page => {
      this.selectedPageIndex = page.currentpage;
      
      if (this.multiSelect) {
        this.checkString = this.convertBooleanArrayToString(this.checkList);
      } else {
        this.checkString = (this.selectedPageIndex + 1).toString();
      }
      
      
      document.getElementById(`page-${page.currentpage}`)?.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "start"
      });
    });

    this.sideNavMenuService.copiedPage$.subscribe(value => {
      this.canPaste = value;
    })

    RXCore.onGuiRemovePage((pageIndex) => {
      this.numpages = this.thumbnails.length;
    })


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
  
  formatRanges(inputStr) {
      let numbers = this.parseInputString(inputStr);
      return this.convertToRanges(numbers);
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
  
  convertBooleanArrayToString(boolArray) {
    let result: any[] = [];
    let start = -1;
  
    for (let i = 0; i < boolArray.length; i++) {
        if (boolArray[i]) {
            if (start === -1) start = i;
        } else if (start !== -1) {
            result.push(start === i - 1 ? `${start + 1}` : `${start + 1}-${i}`);
            start = -1;
        }
    }
  
    if (start !== -1) {
        result.push(start === boolArray.length - 1 ? `${start + 1}` : `${start + 1}-${boolArray.length}`);
    }
  
    return result.join(',');
  }
  
  
  onBlurInputCheckString() {
    this.checkString = this.formatRanges(this.checkString);
    this.checkList = this.convertToBooleanArray(this.checkString);
    //this.multiSelect = true;
  }
  
  onChangeCheckString(value) {
    this.checkString = this.convertBooleanArrayToString(this.checkList)
  }
  
  /*onClickChangeMultiSelectMode() {
    this.multiSelect = !this.multiSelect;
    if(!this.multiSelect) {
      this.checkString = (this.selectedPageIndex + 1).toString();
      this.checkList = this.convertToBooleanArray(this.checkString)
    }
  }*/

  onClickChangeMultiSelectMode() {
    this.multiSelect = !this.multiSelect;
    if(!this.multiSelect) {
      this.checkString = '';
      this.checkList = this.setFirstTrueRestFalse(this.checkList);
      //this.checkList = this.convertToBooleanArray(this.checkString);
    } else {
      this.checkString = '1';
      document.getElementById(`page-${this.checkList.findIndex(item => item)}`)?.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "start"
      });
      this.selectedPageIndex = this.checkList.findIndex(item => item);
    }
  }

  
  onDrop(event: CdkDragDrop<any[]>) {
    const pageRange: number[][] = [];
    if(this.multiSelect) {
      pageRange.push(...this.convertArray(this.checkList))
    } else {
      pageRange.push([event.previousIndex])
    }
    RXCore.movePageTo(pageRange, event.currentIndex)
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if(targetElement && !targetElement.closest('.context-menu')) {
      this.showContextMenu = false;
    }
  }  

  setFirstTrueRestFalse(arr: boolean[]): boolean[] {
    return arr.map((_, index) => index === 0);
  }

  
  private _getBookmarks(bookmarks: Array<any>): Array<TreeviewItem> {
    const items: Array<TreeviewItem> = [];

    try {
      for (let bookmark of bookmarks) {
        const item = new TreeviewItem({
          text: bookmark?.title || '',
          value: bookmark,
          collapsed: true,
        });

        if (bookmark.children?.length) {
          item.children = this._getBookmarks(bookmark.children);
        }

        items.push(item);
      }
    } catch {}

    return items;
  }

  onPageSearch(event): void {
    document.getElementById(`page-${this.page - 1}`)?.scrollIntoView({
      behavior: "instant",
      block: "start",
      inline: "start"
    });
    RXCore.gotoPage(this.page - 1);
  }

  onPageSelect(pageIndex: number): void {
    this.selectedPageIndex = pageIndex;

    if(!this.multiSelect) {
      this.checkString = (this.selectedPageIndex + 1).toString();
    } else {
      this.checkList[pageIndex] = !this.checkList[pageIndex];
    }

    RXCore.gotoPage(pageIndex);
  }

  onViewBookmarksChange(onoff: boolean): void {
  }

  onBookmarkClick(item): void {
    RXCore.navigateBookmark(item.value);
  }

  onRightClick(event: MouseEvent | PointerEvent, pageIndex: number) {
    
    if(!this.isPDF){
      return;
    }    

    event.preventDefault();
    event.stopPropagation();

    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;

    this.showContextMenu = true;

    this.rightClickedPageIndex = pageIndex;

    this.sideNavMenuService.setPageRange([[pageIndex]]);

    const spaceBelow = window.innerHeight - event.clientY;
    const spaceAbove = event.clientY;
    const menuHeight = this.menuHeight; 
    if (spaceBelow < menuHeight && spaceAbove >= menuHeight) {
      this.contextMenuY = event.clientY - menuHeight;
    } else {
      this.contextMenuY = event.clientY;
    }

    if (this.contextMenuY + menuHeight > window.innerHeight) {
      this.contextMenuY = window.innerHeight - menuHeight;
    }
  }

  closeContextMenu() {
    this.showContextMenu = false;
  }

  getpagename(title: string, i: number) : string{

    let pagenum = (i+1) + "/" + this.numpages;
    let retval = pagenum;

    if(title == "Default"){
      retval = pagenum;
      
    }else{
      retval = title;  
    }

    return retval;


  }

  onTabClick(activeindex:number){
    this.tabActiveIndex = activeindex;

    if(activeindex == 1){
      RXCore.getPDFBookmarks();
    }

  }

  onAction(action: Action) {
    const pageRange: number[][] = [];
    let startrange: number; 
    let endrange: number;
    let diffrange: number;
    let fullrange: number[];


    fullrange = [];

    if(this.multiSelect) {
      pageRange.push(...this.convertArray(this.checkList))

      startrange = pageRange[0][0];
      endrange = pageRange[0][1];

      if(endrange){
        for (var pri = startrange; pri <= endrange; pri++){
          fullrange.push(pri);
        }
    
      }

    } else {
      pageRange.push([this.rightClickedPageIndex])
      fullrange.push(this.rightClickedPageIndex);
    }




    switch(action) {
      case 'move-top':
        RXCore.movePageTo(pageRange, 0)
        break;
      case 'move-bottom':
        RXCore.movePageTo(pageRange, this.numpages - 1)
        break;
      case 'move-up':
        RXCore.movePageTo(pageRange, pageRange[0][0] > 0 ? pageRange[0][0] - 1: 0)
        break;
      case 'move-down':
        let index = 0;
        if(this.multiSelect) {
          index = pageRange[pageRange.length - 1][pageRange[pageRange.length - 1].length - 1]
        } else {
          index = pageRange[0][0];
        }
        RXCore.movePageTo(pageRange, index < this.numpages - 1 ? index + 2 : this.numpages - 1)
        break;
      case 'rotate-r':


        RXCore.rotatePageClockwise(fullrange, true);
        break;
      case 'rotate-l':


        RXCore.rotatePageClockwise(fullrange, false);
        break;
      case 'page-size':
        this.sideNavMenuService.toggleSizeModal(true);
        this.sideNavMenuService.setPageRange(pageRange)
        break;
      case 'page-insert':
        this.sideNavMenuService.setPageRange(pageRange);
        this.sideNavMenuService.toggleInsertModal('INSERT');
        break;
      case 'page-replace':
        this.sideNavMenuService.setPageRange(pageRange);
        this.sideNavMenuService.toggleInsertModal('REPLACE')
        break;
      case 'page-extract':
        this.sideNavMenuService.setPageRange(pageRange);
        this.sideNavMenuService.toggleExtractModal(true);
        break;
      case 'page-copy':
        RXCore.copyPage(pageRange)
        break;
      case 'page-paste':
        RXCore.pastePage(this.rightClickedPageIndex)
        break;
      case 'page-delete':
        RXCore.removePage(pageRange)
    }
    this.showContextMenu = false;
  }  

}
