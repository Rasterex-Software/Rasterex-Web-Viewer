import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ToastrModule } from 'ngx-toastr';
import { SearchPanelComponent } from './components/annotation-tools/search-panel/search-panel.component';
import { HighlightPipe } from './components/annotation-tools/search-panel/highligth.pipe';
import { ContextMenuComponent } from './components/side-nav-menu/context-menu/context-menu.component';
import { ExtractModalComponent } from './components/side-nav-menu/extract-modal/extract-modal.component';


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
    CountPanelComponent,
    CountTypeSelectComponent,
    NotificationComponent,
    StampPanelComponent,
    StampTemplateDirective,
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
    ContextMenuComponent,
    ExtractModalComponent,
    HighlightPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AccordionModule,
    NgxSliderModule,
    ColorChromeModule,
    AngularDraggableModule,
    TreeviewModule.forRoot(),
    ToastrModule.forRoot(), // ToastrModule added
  ],
  providers: [ColorHelper],
  bootstrap: [AppComponent]
})
export class AppModule { }
