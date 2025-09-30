import { OnInit, Component } from '@angular/core';
import { RxCoreService } from './services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { CompareService } from './components/compare/compare.service';
import { firstValueFrom } from 'rxjs';
import { TopNavMenuService } from './components/top-nav-menu/top-nav-menu.service';
import { AnnotationToolsService } from './components/annotation-tools/annotation-tools.service';
import { ColorHelper } from './helpers/color.helper';
import { NotificationService } from './components/notification/notification.service';

@Component({
  selector: 'app-message-broker',
  template: ""
})
export class AppMessageBrokerComponent implements OnInit {

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly compareService: CompareService,
    private readonly topNavMenuService: TopNavMenuService,
    private readonly annotationToolsService : AnnotationToolsService,
    private readonly colorHelper: ColorHelper,
    private readonly notificationService: NotificationService) { }

    currentPage: number = 0;

  ngOnInit() {
     if (window !== top) {
      this.rxCoreService.guiPage$.subscribe((state) => {
        this.currentPage = state.currentpage;
      });

      window.addEventListener("message", async (event) => {
        switch (event.data.type) {


          
          case "addToolbarButton": {
            const { target = "topnav", id, label, icon, svgIcon, active, toggle } = event.data.payload;
          
            const button = {
              id,
              label,
              icon,
              svgIcon,
              active: false,         // default
              toggle: toggle ?? false,
              onClick: () => {
                if (toggle) {
                  const service = target === "annotation"
                    ? this.annotationToolsService
                    : this.topNavMenuService;
              
                  // 🔹 use exclusive toggle
                  //const updatedBtn = service.toggleExclusiveButton(id);
                  const updatedBtn = service.getButtonById(id);
              
                  parent.postMessage({
                    type: "toolbarClick",
                    id,
                    active: updatedBtn?.active ?? false   // always include state
                  }, "*");

                } else {
                  parent.postMessage({ type: "toolbarClick", id, active: true }, "*");
                }
              }
              
            };
          
            switch (target) {
              case "annotation":
                this.annotationToolsService.addButton(button);
                break;
              case "topnav":
              default:
                this.topNavMenuService.addButton(button);
                break;
            }
            break;
          }

          case "removeToolbarButton": {
            const { id, target = "topnav" } = event.data.payload;
          
            switch (target) {
              case "annotation":
                this.annotationToolsService.removeButton(id);
                break;
              case "topnav":
              default:
                this.topNavMenuService.removeButton(id);
                break;
            }
            break;
          }
          
          case "guiConfig": {
            this.rxCoreService.setGuiConfig(event.data.payload, true);
            break;
          }

          case "view": {
            parent.postMessage({ type: "progressStart", message: "It takes a few seconds to open the file." }, "*");
            RXCore.openFile(`${RXCore.Config.baseFileURL}${event.data.payload.fileName}`);
            await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
            parent.postMessage({ type: "progressEnd" }, "*");

            break;
          }

          case "compare": {
            const { backgroundFileName, overlayFileName, outputName } = event.data.payload;
            parent.postMessage({ type: "progressStart", message: "It takes a few seconds to generate the comparison." }, "*");
            RXCore.openFile(`${RXCore.Config.baseFileURL}${backgroundFileName}`);
            await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
            RXCore.openFile(`${RXCore.Config.baseFileURL}${overlayFileName}`);
            await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
            const relativePath = await RXCore.compareOverlayServerJSON(
              event.data.payload.backgroundFileName,
              event.data.payload.overlayFileName,
              undefined,
              this.colorHelper.hexToRgb(this.compareService.colorOptions[1].value),
              this.colorHelper.hexToRgb(this.compareService.colorOptions[3].value),
              undefined,
              outputName
            );

            RXCore.openFile(relativePath);
            await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);

            const files = RXCore.getOpenFilesList();

            const comparison = this.compareService.addComparison({
              activeFile: files.find(f => f.name == overlayFileName),
              activeColor: this.compareService.colorOptions[3],
              activeSetAs: this.compareService.setAsOptions[0],
              otherFile: files.find(f => f.name == backgroundFileName),
              otherColor: this.compareService.colorOptions[1],
              otherSetAs: this.compareService.setAsOptions[1],
              relativePath: relativePath
            });

            this.notificationService.notification({message: `"${comparison.name}" has been successfully created.`, type: 'success'});
            parent.postMessage({ type: "comparisonComplete", payload: comparison }, "*");
            parent.postMessage({ type: "progressEnd" }, "*");

            break;
          }

          case "compareSave": {
            parent.postMessage({ type: "progressStart", message: "It takes a few seconds to save the comparison." }, "*");
            const { outputName } = event.data.payload;
            RXCore.markUpSave();
            parent.postMessage({ type: "compareSaveComplete", payload: outputName }, "*");
            parent.postMessage({ type: "progressEnd" }, "*");

            break;
          }

          case "guiMode": {
            this.rxCoreService.setGuiMode(event.data.payload.mode);
            break;
          }

          case "export": {
            RXCore.onGuiExportComplete((fileUrl) => {
              window.open(fileUrl, '_new');
              parent.postMessage({ type: "progressEnd" }, "*");
            });
            parent.postMessage({ type: "progressStart", message: "It takes a few seconds to export file." }, "*");
            RXCore.exportPDF();
            break;
          }

          case "setActiveFileByIndex": {
            const files = RXCore.getOpenFilesList();
            const file = files[event.data.payload.fileIndex];

            if(file) {
              file.comparison = this.compareService.findComparisonByFileName(file.name);
              this.topNavMenuService.selectTab.next(files[event.data.payload.fileIndex]);
            }
            break;
          }

          case "print": {
            parent.postMessage({ type: "progressStart", message: "It takes a few seconds to open the file." }, "*");
            RXCore.openFile(`${RXCore.Config.baseFileURL}${event.data.payload.fileName}`);
            await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
            this.topNavMenuService.openModalPrint.next();
            parent.postMessage({ type: "progressEnd" }, "*");

            break;
          }

          case "download": {
            RXCore.onGuiExportComplete((fileUrl) => {
              window.open(fileUrl, '_new');
              parent.postMessage({ type: "downloadEnd" }, "*");
            });
            parent.postMessage({ type: "downloadStart", message: "It takes a few seconds to prepare file for download." }, "*");
            RXCore.openFile(`${RXCore.Config.baseFileURL}${event.data.payload.fileName}`);
            await firstValueFrom(this.rxCoreService.guiFileLoadComplete$);
            RXCore.exportPDF();
            break;
          }

          case "zoomWidth": {
            RXCore.zoomWidth();
            break;
          }

          case "zoomHeight": {
            RXCore.zoomHeight();
            break;
          }

          case "redrawPage": {
            RXCore.redrawPage(this.currentPage);
            break;
          }

          default: {
            parent.postMessage({ type: "progressEnd" }, "*");
            break;
          }
        }
      }, false);
    }
  }
}
