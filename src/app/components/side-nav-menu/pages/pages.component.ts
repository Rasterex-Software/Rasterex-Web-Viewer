import { Component, HostListener, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { TreeviewConfig } from '../../common/treeview/models/treeview-config';
import { TreeviewItem } from '../../common/treeview/models/treeview-item';
import { SideNavMenuService } from '../side-nav-menu.service';

type Action = 'move-top' | 'move-bottom' | 'rotate-r' | 'rotate-l' | 'page-insert' | 'page-replace' | 'page-copy' | 'page-paste' | 'page-extract' | 'page-delete'

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
    private readonly sideNavMenuService: SideNavMenuService
    ) {}

  ngOnInit(): void {
    this.rxCoreService.guiState$.subscribe(state => {
      this.numpages = state.numpages;
    });

    this.rxCoreService.guiPageThumbs$.subscribe(data => {
      this.thumbnails = data;
      this.numpages = this.thumbnails.length;
    });

    this.rxCoreService.guiPdfBookmarks$.subscribe(data => {
      this.bookmarks = this._getBookmarks(data);
    });

    this.rxCoreService.guiPage$.subscribe(page => {
      this.selectedPageIndex = page.currentpage;
      document.getElementById(`page-${page.currentpage}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start"
    });
    });

    RXCore.onRotatePage((degree: number, pageIndex: number) => {
      
    })

    RXCore.onGuiRemovePage((pageIndex) => {
      this.numpages = this.thumbnails.length;
    })
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
    RXCore.gotoPage(pageIndex);
  }

  onViewBookmarksChange(onoff: boolean): void {
  }

  onBookmarkClick(item): void {
    RXCore.navigateBookmark(item.value);
  }

  onRightClick(event: MouseEvent, pageIndex: number) {
    event.preventDefault();
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.showContextMenu = true;

    this.rightClickedPageIndex = pageIndex
    this.sideNavMenuService.setRightClickedPage(pageIndex)

    const spaceBelow = window.innerHeight - event.clientY;
    // If the space below is less than the menu height, position the menu above
    if (spaceBelow < this.menuHeight) {
      this.contextMenuY -= this.menuHeight; // Adjust the position to place the menu above
    }
  }

  closeContextMenu() {
    this.showContextMenu = false;
  }

  onAction(action: Action) {
    switch(action) {
      case 'move-top':
        RXCore.movePageTo(this.rightClickedPageIndex, 0)
        break;
      case 'move-bottom':
        RXCore.movePageTo(this.rightClickedPageIndex, this.numpages - 1)
        break;
      case 'rotate-r':
        RXCore.rotatePage(this.rightClickedPageIndex, true)
        break;
      case 'rotate-l':
        RXCore.rotatePage(this.rightClickedPageIndex, false)
        break;
      case 'page-insert':
        break;
      case 'page-replace':
        break;
      case 'page-extract':
        this.sideNavMenuService.toggleExtractModal(true)
        break;
      case 'page-copy':
        break;
      case 'page-paste':
        break;
      case 'page-delete':
        RXCore.removePage(this.rightClickedPageIndex)
    }
    this.showContextMenu = false;
  }
}
