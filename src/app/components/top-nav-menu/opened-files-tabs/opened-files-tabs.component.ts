import { Component, OnInit } from '@angular/core';
import { CompareService } from '../../compare/compare.service';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { FileGaleryService } from '../../file-galery/file-galery.service';
import { BottomToolbarService } from '../../bottom-toolbar/bottom-toolbar.service';
import { TopNavMenuService } from '../top-nav-menu.service';
import { AnnotationToolsService } from '../../annotation-tools/annotation-tools.service';
import { SideNavMenuService } from '../../side-nav-menu/side-nav-menu.service';
import { GuiMode } from 'src/rxcore/enums/GuiMode';
import { MeasurePanelService } from '../../annotation-tools/measure-panel/measure-panel.service';
import { CollabService } from 'src/app/services/collab.service';

declare var bringIframeToFront;
declare var hideAllIframes;

@Component({
  selector: 'rx-opened-files-tabs',
  templateUrl: './opened-files-tabs.component.html',
  styleUrls: ['./opened-files-tabs.component.scss']
})
export class OpenedFilesTabsComponent implements OnInit {
  guiState$ = this.rxCoreService.guiState$;
  openedFiles: any = [];
  activeFile: any = null;
  droppableIndex: number | undefined = undefined;
  closeDocumentModal: boolean = false;
  isCollabActive: boolean = false;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly topNavMenuService: TopNavMenuService,
    private readonly fileGaleryService: FileGaleryService,
    private readonly bottomToolbarService: BottomToolbarService,
    private readonly compareService: CompareService,
    private readonly measurePanelService: MeasurePanelService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly collabService: CollabService
    ) {}

  private _getOpenFilesList(): Array<any> {
    const hidden = new Set<number>();
    return RXCore.getOpenFilesList().map(file => {
      const comparison = this.compareService.findComparisonByFileName(file.name);
      if (comparison) {
        hidden.add(comparison.activeFile.index);
        hidden.add(comparison.otherFile.index);
      }
      return { ...file, comparison };
    }).map(file => {
      file.hidden = hidden.has(file.index);
      return file;
    });
  }

  private _closeTabWithSaveConfirmModal(file): void {
    if (!file) return;
    const doc = RXCore.printDoc();

    if(doc.bMarkupchanged) {
      this.closeDocumentModal = true;
    }

    if(!this.closeDocumentModal) {
      this._closeTab(file);
    }

    this.activeFile = file;
  }

  private _closeTab(file): void {
    if (!file) return;

    if (file.comparison) {
      this.compareService.deleteComparison(file.comparison);
    }

    //RXCore.markupSaveCheck(false);    
    RXCore.closeDocument();
    RXCore.markupSaveCheck(true);

    this.bottomToolbarService.removeFromStates(file.index);

    this.compareService.decIndexesAfter(file.index);

    this.openedFiles = this._getOpenFilesList();

    this.topNavMenuService.setFileLength(this.openedFiles.length);

    if (this.openedFiles.length) {
      const file = this.openedFiles.find(f => !f.hidden);
      if (file) {
        this._selectTab(file);
      }
    } else {
      hideAllIframes();
      RXCore.hidedisplayCanvas(false);
      this.bottomToolbarService.nextState();
      this.measurePanelService.setMeasureScaleState({visible: false});
      this.annotationToolsService.setNotePanelState({visible: false});
      this.annotationToolsService.setMeasurePanelState({visible: false});
      this.annotationToolsService.setImagePanelState({visible: false});
      this.annotationToolsService.setLinksPanelState({visible: false});
      this.annotationToolsService.setSymbolPanelState({visible: false});
      this.annotationToolsService.setPropertiesPanelState({visible: false});
      this.annotationToolsService.setMeasurePanelDetailState({visible: false});
      this.annotationToolsService.setErasePanelState({visible: false});
      this.annotationToolsService.setContextPopoverState({visible: false});
      this.annotationToolsService.hideQuickActionsMenu();
      this.annotationToolsService.hide();
      this.sideNavMenuService.toggleSidebar(-1);

    }
  }

  private _selectTab(file: any): void {
    RXCore.setActiveFileEx(file.index);
    this.activeFile = file;
    this.topNavMenuService.setActiveFile(file);
    this.bottomToolbarService.nextState(file.index);

    // set active frame for pdf
    const iframename = RXCore.getFoxitIframeID(file.index);
    if (iframename != null) {
      bringIframeToFront(iframename);
      RXCore.hidedisplayCanvas(true);
    } else {
      hideAllIframes();
      RXCore.hidedisplayCanvas(false);
    }
    // end set active frame for pdf

    //RXCore.doResize(0, 0);

    /*this.rxCoreService.resetGuiConfig();
    if (this.compareService.isComparisonActive) {
      this.rxCoreService.setGuiMode(GuiMode.Compare);
    } else {
      this.rxCoreService.setGuiMode(GuiMode.View);
    }*/

    // broadcast if viewer is inside iframe
    if (window !== top) {
      RXCore.zoomWidth();
      RXCore.redrawPage(0);
      parent.postMessage({ type: "activeFileChanged", payload: file }, "*");
    }
  }

  ngOnInit(): void {
    this.rxCoreService.guiFileLoadComplete$.subscribe(() => {
      this.fileGaleryService.closeModal();
      const list = this._getOpenFilesList();
      this.openedFiles = list;
      this.topNavMenuService.setFileLength(list.length);
      this.handleSelectTab(list[list.length - 1]);
      this.bottomToolbarService.addToStates(this.activeFile.index);
    });

    this.topNavMenuService.selectTab$.subscribe(file => {
      this.handleSelectTab(file);
    });

    this.topNavMenuService.closeTab$.subscribe((file) => {
      // this._closeTab(file);
      this._closeTabWithSaveConfirmModal(file);
    })

    this.collabService.isCollabActive$.subscribe(isActive=>{
      this.isCollabActive = isActive;
    });
  }

  handleCloseTab(event, file): void {
    event.preventDefault();
    event.stopPropagation();

    if(this.isCollabActive) return;

    if (file.comparison && RXCore.markupChanged) {
      this.compareService.onUnsavedChanges.next();
    } else {
      // this._closeTab(file);
      this._closeTabWithSaveConfirmModal(file);
    }
  }

  handleSelectTab(file): void {
    if (this.activeFile?.index === file?.index) return;
    this._selectTab(file);
  }

  handleSelectSubTab(event, file): void {
    event.preventDefault();
    event.stopPropagation();
    this.handleSelectTab(file);
  }

  onDroppableZone(index): void {
    this.droppableIndex = index;
  }

  onDrop(): void {
    if (this.droppableIndex != undefined) {
      this.compareService.showCreateCompareModal({ otherFileIndex: this.droppableIndex });
    }
    this.droppableIndex = undefined;
  }

  saveMarkupAndClose(saveMarkup: boolean): void {
    if(!saveMarkup) {
      RXCore.markupSaveCheck(false);
    }
    this._closeTab(this.activeFile);
    this.closeDocumentModal = false;
  }
}
