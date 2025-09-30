import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CompareService } from './compare.service';
import { NotificationService } from '../notification/notification.service';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { firstValueFrom } from 'rxjs';
import { IComparison } from 'src/rxcore/models/IComparison';
import { TopNavMenuService } from '../top-nav-menu/top-nav-menu.service';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { AlignFeatureTutorialService } from '../align-feature-tutorial/align-feature-tutorial.service';
import { GuiMode } from 'src/rxcore/enums/GuiMode';

@Component({
  selector: 'rx-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
  host: {
    '(document:click)': 'handleClickOutside($event)',
    '(document:keydown)': 'handleKeyboardEvents($event)'
  },
  changeDetection: ChangeDetectionStrategy.Default
})
export class CompareComponent implements OnInit {
  @ViewChild("edit") edit: ElementRef;
  createComparisonModalOpened$ = this.compareService.createCompareModalOpened$;
  editComparisonModalOpened: boolean = false;
  comparison: IComparison | undefined = undefined;
  comparisonFile: any = undefined;
  actionsMenuOpened: boolean = false;
  markupChanged: boolean = false;
  guiMode$ = this.rxCoreService.guiMode$;
  progress: boolean = false;
  progressMessage: string | undefined;
  alignArray: Array<any> = [];
  alignComparison: any = undefined;
  unsavedChanges: boolean = false;
  alignInProgress: boolean = false;

  window = window;
  top = top;

  constructor(
    private readonly cdref: ChangeDetectorRef,
    private readonly rxCoreService: RxCoreService,
    private readonly compareService: CompareService,
    private readonly notificationService: NotificationService,
    private readonly topNavMenuService: TopNavMenuService,
    private readonly colorHelper: ColorHelper,
    private readonly tutorialService: AlignFeatureTutorialService) {}

  /* Listeners */
  handleClickOutside(event: any) {
    if (this.actionsMenuOpened && !this.edit?.nativeElement.contains(event.target)) {
      this.actionsMenuOpened = false;
    }
  }

  handleKeyboardEvents($event: KeyboardEvent) {
    if ($event.code === 'Escape') {
      if (this.actionsMenuOpened) {
        this.actionsMenuOpened = false;
      }

      if (this.alignInProgress) {
        this.alignInProgress = false;
        RXCore.exicompareMeasure();
        if (this.comparisonFile) {
          this.topNavMenuService.selectTab.next(this.comparisonFile);
        }
      }
    }
  }

  private _getEqualColor(value: number): string {
    switch (value) {
      case 1: return "rgb(255,255,255)";
      case 2: return "rgb(200,200,200)";
      default: return "rgb(128,128,128)";
    }
  }

  async ngOnInit(): Promise<void> {
    const parameters = new URLSearchParams(window.location.search);

    if (parameters.get("compare") != null) {
      this.progressMessage = "It takes a few seconds to open the comparison related files";
      this.progress = true;
      try {
        const comparison = JSON.parse(String(parameters.get("compare"))) as IComparison;
        if (!comparison) return;
        comparison.activeColor = this.compareService.colorOptions.find(color => color.value == comparison.activeColor?.value);
        comparison.otherColor = this.compareService.colorOptions.find(color => color.value == comparison.otherColor?.value);
        await firstValueFrom(this.rxCoreService.guiFoxitReady$);
        RXCore.openFile(`${RXCore.Config.baseFileURL}${comparison.otherFile.name}`);
        await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
        RXCore.openFile(`${RXCore.Config.baseFileURL}${comparison.activeFile.name}`);
        await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
        this.comparison = this.compareService.addComparison(comparison);
        RXCore.openFile(comparison.relativePath);
        await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
        this.rxCoreService.setGuiMode(GuiMode.Compare);
      } catch (error) {
        this.notificationService.notification({message: error, type: 'error'});
      } finally {
        this.progressMessage = undefined;
        this.progress = false;
      }
    }

    this.rxCoreService.guiState$.subscribe(state => {
      const file = RXCore.getOpenFilesList().find(file => file.isActive);
      this.comparison = this.compareService.findComparisonByFileName(file?.name);
      //this.markupChanged = RXCore.getnumMarkups() > 0;
      
      if (this.comparison && this.markupChanged) {
        this.rxCoreService.setGuiMode(GuiMode.Compare);
      }
    });

    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {


      this.markupChanged = RXCore.getnumMarkups() > 0;


      if (window !== top) {
        parent.postMessage({ type: "comparisonMarkupChanged", payload: this.markupChanged }, "*");
      }
    });

    this.rxCoreService.guiOnExportComplete$.subscribe((fileUrl) => {
      this.progress = false;
      if (fileUrl) {
        window.open(fileUrl, '_new');
      }
    });

    this.rxCoreService.guiOnCompareMeasure$.subscribe(async (data) => {
      switch (this.alignArray.length) {
        default: {
          this.comparisonFile = undefined;
          this.alignArray = [];
          this.alignComparison = undefined;
          this.alignInProgress = false;
          break;
        }
        case 0: {
          if (this.alignComparison) {
            this.alignArray.push(data);
            this.topNavMenuService.selectTab.next(this.alignComparison.activeSetAs.value == 'overlay' ? this.alignComparison.activeFile : this.alignComparison.otherFile);
            RXCore.compareMeasure();
            this.alignInProgress = true;
          }
          break;
        }
        case 1: {
          try {
            this.progressMessage = "It takes a few seconds to align compare";
            this.progress = true;

            this.alignArray.push(data);
            this.topNavMenuService.selectTab.next({
              ...this.comparisonFile,
              comparison: this.alignComparison
            });

            const relativePath = await RXCore.compareOverlayServerJSON(
              this.alignComparison.activeSetAs.value == 'background' ? this.alignComparison.activeFile.name : this.alignComparison.otherFile.name,
              this.alignComparison.activeSetAs.value == 'overlay' ? this.alignComparison.activeFile.name : this.alignComparison.otherFile.name,
              this.alignArray,
              this.colorHelper.hexToRgb(this.alignComparison.activeSetAs.value == 'background' ? this.alignComparison.activeColor.value : this.alignComparison.otherColor.value),
              this.colorHelper.hexToRgb(this.alignComparison.activeSetAs.value == 'overlay' ? this.alignComparison.activeColor.value : this.alignComparison.otherColor.value),
            );

            const comparison = { ...this.alignComparison, relativePath, alignarray: this.alignArray };

            this.comparison = comparison;
            this.compareService.updateComparison(comparison);
            RXCore.closeDocument();
            RXCore.openFile(comparison.relativePath);
            await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
            this.rxCoreService.setGuiMode(GuiMode.Compare);
            if (window !== top) {
              parent.postMessage({ type: "comparisonComplete", payload: comparison }, "*");
            }
          } catch (error) {
            this.notificationService.notification({message: error, type: 'error'});
          } finally {
            this.progressMessage = undefined;
            this.progress = false;
            this.comparisonFile = undefined;
            this.alignArray = [];
            this.alignComparison = undefined;
            this.alignInProgress = false;
            this.cdref.detectChanges();
          }
          break;
        }
      }
    });

    this.compareService.onGrayScaleChange$.subscribe(async (value) => {
      if (!this.comparison) return;

      this.progressMessage = "It takes a few seconds to generate the comparison";
      this.progress = true;
      this.comparison.relativePath = await RXCore.compareOverlayServerJSON(
        this.comparison.activeSetAs.value == 'background' ? this.comparison.activeFile.name : this.comparison.otherFile.name,
        this.comparison.activeSetAs.value == 'background' ? this.comparison.otherFile.name : this.comparison.activeFile.name,
        this.comparison.alignarray,
        this.colorHelper.hexToRgb(this.comparison.activeSetAs.value == 'background' ? this.comparison.activeColor.value : this.comparison.otherColor.value),
        this.colorHelper.hexToRgb(this.comparison.activeSetAs.value == 'background' ? this.comparison.otherColor.value : this.comparison.activeColor.value),
        this._getEqualColor(value)
      );

      this.onEditComparisonApply(this.comparison);
    });

    this.rxCoreService.guiOnMarkupChanged.subscribe(({annotation, operation}) => {

      if(operation.created || operation.deleted){
        
        this.markupChanged = RXCore.getnumMarkups() > 0;
      }
      
      

      if (window !== top) {
        parent.postMessage({ type: "comparisonMarkupChanged", payload: this.markupChanged }, "*");
      }
    });

    this.compareService.onUnsavedChanges$.subscribe(() => {
      this.unsavedChanges = true;
    });

    this.compareService.onComparisonAdded$.subscribe((comparison) => {
      this.comparison = comparison;
    })
  }

  async onCreateComparisonComplete(data: any): Promise<void> {
    try {
      this.progressMessage = "It takes a few seconds to generate the comparison";
      this.progress = true;
      const comparison = this.compareService.addComparison(data);
      RXCore.openFile(comparison.relativePath);
      this.compareService.hideCreateCompareModal();
      await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
      this.rxCoreService.setGuiMode(GuiMode.Compare);
      if (window !== top) {
        parent.postMessage({ type: "comparisonComplete", payload: comparison }, "*");
      }
      this.notificationService.notification({message: `"${comparison.name}" has been successfully created.`, type: 'success'});
    } catch (error) {
      this.notificationService.notification({message: error, type: 'error'});
    } finally {
      this.progressMessage = undefined;
      this.progress = false;
      this.cdref.detectChanges();
    }
  }

  onCreateComparisonCancel(): void {
    this.compareService.hideCreateCompareModal();
  }

  async onEditComparisonApply(comparison: IComparison): Promise<void> {
    try {
      this.progressMessage = "It takes a few seconds to generate the comparison";
      this.progress = true;
      this.comparison = comparison;
      this.compareService.updateComparison(comparison);
      RXCore.closeDocument();
      RXCore.openFile(comparison.relativePath);
      await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
      this.rxCoreService.setGuiMode(GuiMode.Compare);
      if (window !== top) {
        parent.postMessage({ type: "comparisonComplete", payload: comparison }, "*");
      }
      this.notificationService.notification({message: `"${comparison.name}" has been successfully updated.`, type: 'success'});
    } catch (error) {
      this.notificationService.notification({message: error, type: 'error'});
      this.cdref.detectChanges();
    } finally {
      this.editComparisonModalOpened = false;
      this.progressMessage = undefined;
      this.progress = false;
      this.cdref.detectChanges();
    }
  }

  onSaveClick(): void {
    this.actionsMenuOpened = false;
    RXCore.markUpSave();
    this.markupChanged = false;
    this.unsavedChanges = false;
  }

  onExportPDFClick(): void {
    this.actionsMenuOpened = false;
    this.progressMessage = "It takes a few seconds to export file";
    this.progress = true;
    RXCore.exportPDF();
    this.unsavedChanges = false;
  }

  onSaveAndExportClick(): void {
    this.actionsMenuOpened = false;
    RXCore.markUpSave();
    this.markupChanged = false;
    this.progressMessage = "It takes a few seconds to export file";
    this.progress = true;
    RXCore.exportPDF();
    this.unsavedChanges = false;
  }

  onAlignClick(): void {
    this.actionsMenuOpened = false;

    if (window === top && !localStorage.getItem("alignFeatureTutorialChecked")) {
      this.tutorialService.show();
      localStorage.setItem("alignFeatureTutorialChecked", "true");
    }
    if (window !== top && !localStorage.getItem("alignFeatureTutorialCheckedExternal")) {
      this.tutorialService.show();
      localStorage.setItem("alignFeatureTutorialCheckedExternal", "true");
    }

    this.comparisonFile = RXCore.getOpenFilesList().find(file => file.isActive);
    this.alignArray = [];
    this.alignComparison = {...this.comparison };
    this.topNavMenuService.selectTab.next(this.alignComparison.activeSetAs.value == 'background' ? this.alignComparison.activeFile : this.alignComparison.otherFile);
    RXCore.compareMeasure();
    this.alignInProgress = true;
  }

  onHelpClick(): void {
    this.tutorialService.show();
  }

  onCancelUnsavedChanges(): void {
    this.unsavedChanges = false;
  }

  onDiscardUnsavedChanges(): void {
    this.unsavedChanges = false;
    const file = RXCore.getOpenFilesList().find(f => f.isActive);
    if(file) {
      file.comparison = this.compareService.findComparisonByFileName(file.name);
      this.topNavMenuService.closeTab.next(file);
    }
  }

  onSaveOptionSelect(option): void {
    switch (option.value) {
      case 0: {
        this.onSaveClick();
        break;
      }
      case 1: {
        this.onExportPDFClick();
        break;
      }
      case 2: {
        this.onSaveAndExportClick();
        break;
      }
    }
  }

}
