import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

//import { FormsModule } from '@angular/forms';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { TopNavMenuComponent } from './components/top-nav-menu/top-nav-menu.component';
import { DropdownComponent } from './components/common/dropdown/dropdown.component';
import { SideNavMenuComponent } from './components/side-nav-menu/side-nav-menu.component';
import { ModalDialogComponent } from './components/common/modal-dialog/modal-dialog.component';
import { FileGaleryComponent } from './components/file-galery/file-galery.component';
import { DndZoneComponent } from './components/common/dnd-zone/dnd-zone.component';
import { DndZoneDirective } from './components/common/dnd-zone/dnd-zone.directive';
import { BottomToolbarComponent } from './components/bottom-toolbar/bottom-toolbar.component';
import { AnnotationToolsComponent } from './components/annotation-tools/annotation-tools.component';
import { ContextEditorComponent } from './components/annotation-tools/context-editor/context-editor.component';
import { QuickActionsMenuComponent } from './components/annotation-tools/quick-actions-menu/quick-actions-menu.component';
import { ColorPickerComponent } from './components/common/color-picker/color-picker.component';
import { AccordionModule } from './components/common/accordion/accordion.module';
import { PropertiesPanelComponent } from './components/annotation-tools/properties-panel/properties-panel.component';
import { TextStyleSelectComponent } from './components/common/text-style-select/text-style-select.component';
import { LineStyleSelectComponent } from './components/common/line-style-select/line-style-select.component';
import { PanelComponent } from './components/common/panel/panel.component';

import { ColorHelper } from './helpers/color.helper';

import { NgxSliderModule } from 'ngx-slider-v2';
import { ColorChromeModule } from 'ngx-color/chrome';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { AngularDraggableModule } from 'angular2-draggable';
import { SwitchComponent } from './components/common/switch/switch.component';
import { VectorLayersComponent } from './components/side-nav-menu/vector-layers/vector-layers.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { ThreedPartsComponent } from './components/side-nav-menu/threed-parts/threed-parts.component';
import { TreeviewModule } from './components/common/treeview/treeview.module';
import { NotePanelComponent } from './components/annotation-tools/note-panel/note-panel.component';
import { NotePopoverComponent } from './components/annotation-tools/note-popover/note-popover.component';
import { MultiSelectComponent } from './components/common/multi-select/multi-select.component';
import { DatePickerComponent } from './components/common/date-picker/date-picker.component';
import { TextSelectionHighlightComponent } from './components/bottom-toolbar/text-selection-highlight/text-selection-highlight.component';
import { ErasePanelComponent } from './components/annotation-tools/erase-panel/erase-panel.component';
import { PrintComponent } from './components/print/print.component';
import { FileInfoComponent } from './components/file-info/file-info.component';
import { PagesComponent } from './components/side-nav-menu/pages/pages.component';
import { ThreedPartInfoComponent } from './components/side-nav-menu/threed-part-info/threed-part-info.component';
import { PageThumbnailDirective } from './components/side-nav-menu/pages/page-thumbnail.directive';
import { CountPanelComponent } from './components/annotation-tools/count-panel/count-panel.component';
import { CountTypeSelectComponent } from './components/common/count-type-select/count-type-select.component';
import { NotificationComponent } from './components/notification/notification.component';
import { StampPanelComponent } from './components/annotation-tools/stamp-panel/stamp-panel.component';
import { StampTemplateDirective } from './components/annotation-tools/stamp-panel/stamp-template.directive';
import { MeasurePanelComponent } from './components/annotation-tools/measure-panel/measure-panel.component';
import { SignatureComponent } from './components/signature/signature.component';
import { CheckboxComponent } from './components/common/checkbox/checkbox.component';
import { AdoptSignatureComponent } from './components/signature/adopt-signature/adopt-signature.component';
import { CompareComponent } from './components/compare/compare.component';
import { CreateComparisonComponent } from './components/compare/create-comparison/create-comparison.component';
import { EditComparisonComponent } from './components/compare/edit-comparison/edit-comparison.component';
import { OpenedFilesTabsComponent } from './components/top-nav-menu/opened-files-tabs/opened-files-tabs.component';
import { DraggableFileTabDirective } from './components/top-nav-menu/opened-files-tabs/draggable-file-tab.directive';
import { SimpleProgressComponent } from './components/common/simple-progress/simple-progress.component';
import { AppMessageBrokerComponent } from './app-message-broker.component';
import { AlignFeatureTutorialComponent } from './components/align-feature-tutorial/align-feature-tutorial.component';
import { SaveComparisonMenuComponent } from './components/compare/save-comparison-menu/save-comparison-menu.component';
import { SignaturePanelComponent } from './components/side-nav-menu/signature-panel/signature-panel.component';
import { DropdownMenuComponent } from './components/common/dropdown-menu/dropdown-menu.component';
import { BlocksComponent } from './components/side-nav-menu/blocks/blocks.component';
import { AnnotationShapeIconComponent } from './components/annotation-tools/annotation-shape-icon/annotation-shape-icon.component';
import { MeasureDetailPanelComponent } from './components/annotation-tools/measure-detail-panel/measure-detail-panel.component';
import { ScaleDropdownComponent } from './components/annotation-tools/scale-dropdown/scale-dropdown.component';
import { ToastrModule } from 'ngx-toastr';

import { ImageLibraryComponent } from './components/image-library/image-library.component';
import { ImageDragDropDirective } from './components/image-library/image-draggable.directive';
import { SymbolsLibraryComponent } from './components/annotation-tools/symbols-library/symbols-library.component';
import { LinksLibraryComponent } from './components/annotation-tools/links-library/links-library.component';
import { LinkDragDropDirective } from './components/annotation-tools/links-library/link-draggable.directive';
//import { InteractiveStampTemplateDirective } from './components/annotation-tools/stamp-panel/interactive-stamp-template.directive ';
import { SafeHtmlPipe } from './SafeHtmlPipe';

import { SearchPanelComponent } from './components/annotation-tools/search-panel/search-panel.component';
import { HighlightPipe } from './components/annotation-tools/search-panel/highligth.pipe';
import { ContextMenuComponent } from './components/side-nav-menu/context-menu/context-menu.component';
import { ExtractModalComponent } from './components/side-nav-menu/extract-modal/extract-modal.component';
import { RadioButtonComponent } from './components/common/radio-button/radio-button.component';
import { InsertModalComponent } from './components/side-nav-menu/insert-modal/insert-modal.component';
import { SelectComponent } from './components/common/select/select.component';
import { ThumbnailDirective } from './components/side-nav-menu/insert-modal/thumbnail.directive';
import { RecentFilesComponent } from './components/recent-files/recent-files.component';
import { SizeModalComponent } from './components/size-modal/size-modal.component';
import { CommentStatusIconComponent } from './components/annotation-tools/comment-status-icon/comment-status-icon.component';

import { LoginComponent } from './components/user/login/login.component';

const storeSchema = [
  { name: 'name', keypath: 'name', options: { unique: false } },
  { name: 'data', keypath: 'data', options: { unique: false } },
];
const dbConfig: DBConfig  = {
  name: 'RasterXDb',
  version: 1,
  objectStoresMeta: [
    { store: 'CustomStamp',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema 
    },
    { store: 'UploadStamp',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema 
    }
  ]
};


@NgModule({
  declarations: [
    AppComponent,
    AppMessageBrokerComponent,
    TopNavMenuComponent,
    DropdownComponent,
    SideNavMenuComponent,
    ModalDialogComponent,
    FileGaleryComponent,
    DndZoneComponent,
    DndZoneDirective,
    BottomToolbarComponent,
    AnnotationToolsComponent,
    ContextEditorComponent,
    QuickActionsMenuComponent,
    ColorPickerComponent,
    PropertiesPanelComponent,
    TextStyleSelectComponent,
    LineStyleSelectComponent,
    SelectComponent,
    PanelComponent,
    SwitchComponent,
    VectorLayersComponent,
    ConfirmationModalComponent,
    ThreedPartsComponent,
    NotePanelComponent,
    SearchPanelComponent,
    NotePopoverComponent,
    MultiSelectComponent,
    DatePickerComponent,
    TextSelectionHighlightComponent,
    ErasePanelComponent,
    PrintComponent,
    FileInfoComponent,
    PagesComponent,
    ThreedPartInfoComponent,
    PageThumbnailDirective,
    ThumbnailDirective,
    CountPanelComponent,
    CountTypeSelectComponent,
    NotificationComponent,
    StampPanelComponent,
    StampTemplateDirective,
    //InteractiveStampTemplateDirective,
    MeasurePanelComponent,
    SignatureComponent,
    CheckboxComponent,
    AdoptSignatureComponent,
    CompareComponent,
    CreateComparisonComponent,
    EditComparisonComponent,
    OpenedFilesTabsComponent,
    DraggableFileTabDirective,
    SimpleProgressComponent,
    AlignFeatureTutorialComponent,
    SaveComparisonMenuComponent,
    SignaturePanelComponent,
    DropdownMenuComponent,
    BlocksComponent,
    AnnotationShapeIconComponent,
    MeasureDetailPanelComponent,
    ScaleDropdownComponent,
    ImageLibraryComponent,
    ImageDragDropDirective,
    SymbolsLibraryComponent,
    LinksLibraryComponent,
    LinkDragDropDirective,
    ContextMenuComponent,
    ExtractModalComponent,
    RadioButtonComponent,
    InsertModalComponent,
    RecentFilesComponent,
    HighlightPipe,
    SizeModalComponent,
    SafeHtmlPipe,
    CommentStatusIconComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AccordionModule,
    DragDropModule,
    BrowserAnimationsModule,
    NgxSliderModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    ColorChromeModule,
    AngularDraggableModule,
    TreeviewModule.forRoot(),
    ToastrModule.forRoot(), // ToastrModule added
  ],
  providers: [ColorHelper, Title],
  bootstrap: [AppComponent],
  
})
export class AppModule { }
