import { Component, Output, Input, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CompareService } from '../compare.service';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { RXCore } from 'src/rxcore';
import { FileGaleryService } from '../../file-galery/file-galery.service';
import { TopNavMenuService } from '../../top-nav-menu/top-nav-menu.service';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { Subscription } from 'rxjs';
import { IComparison } from 'src/rxcore/models/IComparison';
import { FileCategoryService } from 'src/app/services/file-category.service';
import { FileCategory } from 'src/app/shared/enums/file-category';
import { FilePreselectionService } from 'src/app/services/file-preselection.service';

@Component({
  selector: 'rx-create-comparison',
  templateUrl: './create-comparison.component.html',
  styleUrls: ['./create-comparison.component.scss']
})
export class CreateComparisonComponent implements OnInit, OnDestroy {
  @Input() otherFileIndex: number | undefined = undefined;
  @Input() autoConfirm: boolean = false;
  @Output() onComplete: EventEmitter<IComparison> = new EventEmitter<IComparison>();
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();

  colorOptions = this.compareService.colorOptions;

  options = [
    { value: "overlay", title: "Overlay" },
    { value: "background", title: "Background" },
  ];

  fileLoadCompleteSubscription$: Subscription;
  modalFileGaleryOpened$ = this.fileGaleryService.modalOpened$;
  color1 = this.colorOptions[3];
  color2 = this.colorOptions[1];
  selectedOption = this.options[0];
  fileOptions: Array<any> = [];
  activeFile: any = undefined;
  otherFile: any = undefined;
  progress: boolean = false;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly compareService: CompareService,
    private readonly colorHelper: ColorHelper,
    private readonly fileGaleryService: FileGaleryService,
    private readonly topNavMenuService: TopNavMenuService,
    private readonly fileCategoryService: FileCategoryService,
    private filePreselectionService: FilePreselectionService,
    ) {}

  private _init(setOtherFile: boolean = false): void {
    
    
    const fileList = RXCore.getOpenFilesList().filter(file => !this.compareService.findComparisonByFileName(file.name));

        
    this.activeFile = fileList?.find(file => file.isActive);

        //Skip files which are already selected/active in viewer, it is not a good idea to let user perform comparison with same file
    //Exclude 3D files from comparison 
    const threeDFiles = this.fileCategoryService.getCategories(fileList, FileCategory.ThreeD);
    if (threeDFiles && threeDFiles.length > 0) {
    this.fileOptions = fileList?.filter(file => !threeDFiles.map(x => x.id).includes(file.id));
    }else{
      this.fileOptions = fileList;
    }

    this.fileOptions = this.fileOptions?.filter(file => !file.isActive ).map(file => ({ value: file, label: file.name }));
    
    //this.fileOptions = fileList?.map(file => ({ value: file, label: file.name }));

    if (setOtherFile && this.fileOptions?.length) {
      this.otherFile = this.fileOptions[this.fileOptions.length - 1];
    }
  }

  ngOnInit(): void {
    this._init();

    if (this.otherFileIndex != undefined) {
      this.otherFile = this.fileOptions.find(file => file.value.index == this.otherFileIndex);
      this.color1 = this.colorOptions[3];
      this.color2 = this.colorOptions[1];
      if (this.autoConfirm) {
        this.onCreateComparisonConfirm();
      }
    }

    this.fileLoadCompleteSubscription$ = this.rxCoreService.guiFileLoadComplete$.subscribe(() => {
      this.topNavMenuService.selectTab.next(this.activeFile);
      this._init(true);
    });
  }

  ngOnDestroy(): void {
    if (this.fileLoadCompleteSubscription$) this.fileLoadCompleteSubscription$.unsubscribe();
  }

  onCreateComparisonCancel(): void {
    this.onCancel.emit();
  }

  async onCreateComparisonConfirm(): Promise<void> {
    this.progress = true;

    const relativePath = await RXCore.compareOverlayServerJSON(
      this.selectedOption.value == 'background' ? this.activeFile.name : this.otherFile.value.name,
      this.selectedOption.value == 'background' ? this.otherFile.value.name : this.activeFile.name,
      undefined,
      this.colorHelper.hexToRgb(this.selectedOption.value == 'background' ? this.color1.value : this.color2.value),
      this.colorHelper.hexToRgb(this.selectedOption.value == 'background' ? this.color2.value : this.color1.value),
    );

    this.onComplete.emit({
      relativePath,
      activeFile: this.activeFile,
      otherFile: this.otherFile.value,
      activeColor: this.color1,
      otherColor: this.color2,
      activeSetAs: this.selectedOption,
      otherSetAs: this.selectedOption.value == "background" ? this.options[0] : this.options[1]
    });

    this.progress = false;
  }

  onColor1Select(color): void {
    this.color1 = color;
  }

  onColor2Select(color): void {
    this.color2 = color;
  }

  onOtherFileSelect(file): void {
    this.otherFile = file;
  }

  onSelectNewDocument(): void {
    this.filePreselectionService.setContext('comparison');
    this.fileGaleryService.openModal();
  }

  onSwapClick() {
    if (this.selectedOption.value == "overlay") {
      this.selectedOption = this.options[1];
    } else {
      this.selectedOption = this.options[0];
    }
  }

}
