import { Component, Input, Output, EventEmitter} from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { PrintService } from './print.service';

@Component({
  selector: 'print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})

export class PrintComponent {
  //@Input() isPrint: boolean;
  //@Input() isActiveFile: boolean;
  @Output() closed = new EventEmitter<void>();

  selectedPage: string;
  selectedPaperSize: any;
  selectedPaperOrientation: any;
  includeAnnotations: boolean = false;
  pasteWatermark: boolean = false;

  currentPage = 0;
  totalPages = 0;
  progressVisible = false;

  pages = [
    { label: 'All', value: 'all' },
    { label: 'Current page', value: 'currentPage' },
    { label: 'Suitable pages', value: 'suitablePages' },
  ];

  paperSize = [
    {
      value: 'A4',
      label: "A4 210x297 mm",
      dimensions: ['210', '297', 'mm']
    },
    {
      value: 'A3',
      label: "A3 297X420 mm",
      dimensions: ['297', '420', 'mm']
    },
    {
      value: 'A2',
      label: "A2 420x594 mm",
      dimensions: ['420', '594', 'mm']
    },
    {
      value: 'A1',
      label: "A1 594x841 mm",
      dimensions: ['594', '841', 'mm']
    },
    {
      value: 'A0',
      label: "A0 841X1189 mm",
      dimensions: ['841', '1189', 'mm']
    },
    {
      value: 'Letter',
      label: "Letter 8.5x11 in",
      dimensions: ['8.5', '11', 'in']
    },
    {
      value: 'ANSI A',
      label: "ANSI A 8.5x11 in",
      dimensions: ['8.5', '11', 'in']
    },
    {
      value: 'ANSI B',
      label: "ANSI B 11x17 in",
      dimensions: ['11', '17', 'in']
    },
    {
      value: 'ANSI C',
      label: "ANSI C 17x22 in",
      dimensions: ['17', '22', 'in']
    },
    {
      value: 'ANSI D',
      label: "ANSI D 22x34 in",
      dimensions: ['22', '34', 'in']
    },
    {
      value: 'ANSI E',
      label: "ANSI E 34x44 in",
      dimensions: ['34', '44', 'in']
    },
    {
      value: 'Arch A',
      label: "Arch A 9x12 in",
      dimensions: ['9', '12', 'in']
    },
    {
      value: 'Arch B',
      label: "Arch B 12x18 in",
      dimensions: ['12', '18', 'in']
    },
    {
      value: 'Arch C',
      label: "Arch C 18x24 in",
      dimensions: ['18', '24', 'in']
    },
    {
      value: 'Arch D',
      label: "Arch D 24x36 in",
      dimensions: ['24', '36', 'in']
    },
    {
      value: 'Arch E',
      label: "Arch E 36x48 in",
      dimensions: ['36', '48', 'in']
    }
  ];

  paperOrientation = [
    {
      value: 'Auto',
      label: 'Auto'
    },
    {
      value: 'Landscape',
      label: 'Landscape'
    },
    {
      value: 'Portrait',
      label: 'Portrait'
    }
  ];

  constructor(
    private readonly rxCoreService: RxCoreService, 
    private printService: PrintService) {}

  ngOnInit() {
    this.initializeFormValues();

    if (RXCore && RXCore.onPrintProgress) {
      RXCore.onPrintProgress((pagenumtotal) => {

        this.currentPage = pagenumtotal.current;
        this.totalPages = pagenumtotal.total;
        this.progressVisible = true;

      });
  
    }
    

    if (RXCore && RXCore.onPrintComplete) {
      RXCore.onPrintComplete(() => {
        this.cancel();
      });
    }

    /*if (RXCore && RXCore.onPrintComplete) {
      RXCore.onPrintComplete(() => {
        this.progressVisible = false;
        this.currentPage = 0;
        this.totalPages = 0;
        // Auto-close optional:
        // this.cancel();
      });
    }*/

  }

  initializeFormValues() {
    this.includeAnnotations = this.pasteWatermark = false; 
    this.selectedPaperSize = this.paperSize[0];
    this.selectedPaperOrientation = this.paperOrientation[0];
    this.selectedPage = this.pages[1]?.value;
  }

  onPaperSizeSelect(event: any) {
    this.selectedPaperSize = event;
  }

  onPaperOrientationSelect(event: any)  {
    this.selectedPaperOrientation = event;
  }

  onIncludeAnnotationsChange(checked): void {
    this.includeAnnotations = checked;
  }

  onWatermarkChange(checked): void {
    this.pasteWatermark= checked;
  }

  cancel() {
    this.initializeFormValues();

    document.documentElement.style.setProperty("--body-overflow", "hidden");

    this.closed.emit();
  }

  onPrint(): void {
    this.printService.data(true, this.selectedPaperOrientation, this.paperSize, this.selectedPaperSize);
    RXCore.fileInfoDialog();
  }

}
