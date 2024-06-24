import { Component, HostListener, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { TreeviewConfig } from '../../common/treeview/models/treeview-config';
import { TreeviewItem } from '../../common/treeview/models/treeview-item';
import { SideNavMenuService } from '../side-nav-menu.service';
import { TopNavMenuService } from '../../top-nav-menu/top-nav-menu.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

type Action = 'move-top' | 'move-bottom' | 'move-up' | 'move-down' | 'rotate-r' | 'rotate-l' | 'page-insert' | 'page-replace' | 'page-copy' | 'page-paste' | 'page-extract' | 'page-delete' | 'page-size'

@Component({
  selector: 'rx-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

  tabActiveIndex: number = 0;
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

  ngOnInit(): void {
    this.rxCoreService.guiState$.subscribe(state => {
      this.numpages = state.numpages;
    });

    this.rxCoreService.guiPageThumbs$.subscribe(data => {
      this.thumbnails = data;
      this.numpages = this.thumbnails.length;
      this.checkList = new Array(this.numpages).fill(false);
      this.checkList[this.selectedPageIndex] = true;
    });

    this.rxCoreService.guiPdfBookmarks$.subscribe(data => {
      this.bookmarks = this._getBookmarks(data);
    });

    this.rxCoreService.guiPage$.subscribe(page => {
      this.selectedPageIndex = page.currentpage;
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

formatRanges(inputStr) {
    let numbers = this.parseInputString(inputStr);
    return this.convertToRanges(numbers);
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

convertBooleanArrayToString(boolArray) {
    let result:any [] = [];
    let start = -1;

    for (let i = 0; i < boolArray.length; i++) {
        if (boolArray[i]) {
            if (start === -1) {
                start = i;
            }
        } else {
            if (start !== -1) {
                if (start === i - 1) {
                    result.push(`${start}`);
                } else {
                    result.push(`${start}-${i - 1}`);
                }
                start = -1;
            }
        }
    }

    // Handle the last range if the array ends with `true`
    if (start !== -1) {
        if (start === boolArray.length - 1) {
            result.push(`${start}`);
        } else {
            result.push(`${start}-${boolArray.length - 1}`);
        }
    }

    return result.join(',');
}

onBlurInputCheckString() {
  this.checkString = this.formatRanges(this.checkString);
  this.checkList = this.convertToBooleanArray(this.checkString);
  this.multiSelect = true;
}

onChangeCheckString(value) {
  this.checkString = this.convertBooleanArrayToString(this.checkList)
}

onClickChangeMultiSelectMode() {
  this.multiSelect = !this.multiSelect;
  if(!this.multiSelect) {
    this.checkString = this.selectedPageIndex.toString();
    this.checkList = this.convertToBooleanArray(this.checkString)
  }
}

onDrop(event: CdkDragDrop<any[]>) {
  const pageRange: number[][] = [];
  if(this.multiSelect) {
    pageRange.push(...this.convertArray(this.checkList))
  } else {
    pageRange.push([event.previousIndex])
  }
  moveItemInArray(this.thumbnails, event.previousIndex, event.currentIndex)
  RXCore.movePageTo(pageRange, event.currentIndex)
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const targetElement = event.target as HTMLElement;
  if(targetElement && !targetElement.closest('.context-menu')) {
    this.showContextMenu = false;
  }
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
  }

  onPageSelect(pageIndex: number): void {
    this.selectedPageIndex = pageIndex;
    this.checkString = this.selectedPageIndex.toString();
    RXCore.gotoPage(pageIndex);
  }

  onViewBookmarksChange(onoff: boolean): void {
  }

  onBookmarkClick(item): void {
    RXCore.navigateBookmark(item.value);
  }


  onRightClick(event: MouseEvent | PointerEvent, pageIndex: number) {
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

  onAction(action: Action) {
    const pageRange: number[][] = [];
    if(this.multiSelect) {
      pageRange.push(...this.convertArray(this.checkList))
    } else {
      pageRange.push([this.rightClickedPageIndex])
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
        RXCore.movePageTo(pageRange, pageRange[0][0] < this.numpages - 1 ? pageRange[0][0] + 1 : this.numpages - 1)
        break;
      case 'rotate-r':
        RXCore.rotatePage(pageRange, true)
        break;
      case 'rotate-l':
        RXCore.rotatePage(pageRange, false)
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
