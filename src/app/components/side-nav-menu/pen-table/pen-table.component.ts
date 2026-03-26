import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { IVectorPenTable, IVectorPen} from 'src/rxcore/models/IVectorPenTable';

interface IPenTableRow {
  index: number;
  width: number;
  color: string;
}

@Component({
  selector: 'rx-pen-table',
  templateUrl: './pen-table.component.html',
  styleUrls: ['./pen-table.component.scss']
})
export class PenTableComponent implements OnInit {
  penTableRows: IPenTableRow[] = [];
  penData : Array<any> = [];
  penTableEnabled = false;
  penTableScaled = true;
  pentablestate = false;
  color : string = "";
  selectedPenRow: IPenTableRow | null = null;
  colorPickerVisible = false;

  guiState: any;

 constructor(private readonly rxCoreService: RxCoreService,
  private readonly colorHelper: ColorHelper
  ) {}

  ngOnInit(): void {

    //RXCore.setuploadPenTableInput("penTableFileInput");

    RXCore.onGuipenTable((pentable : Array<IVectorPen>) => {

        this.penData = [];

        const pentablelist : Array<IVectorPen> = pentable;
        if(pentablelist){
            for (var pi = 0; pi < pentablelist.length;pi++){
                    
                this.penData.push({index : pentablelist[pi].penindex, width : pentablelist[pi].displaywidth, color : pentablelist[pi].color});

                
            }
            this.sortpens();
        }


    });

    RXCore.onGuipenTableJSON((pentable : Array<IVectorPen>) => {

        this.penData = [];



        const pentablelist : Array<IVectorPen> = pentable;
        const curpentable : IVectorPenTable = RXCore.get2DVectorPentable();

        if(pentablelist && curpentable){
            for (var pi = 0; pi < pentablelist.length;pi++){
                    
                let pen : IVectorPen = curpentable.getPen(pentablelist[pi].penindex);

                if(pen != undefined){

                    RXCore.setpentablePen(pentablelist[pi], false);
        
                }
                
            }

            curpentable.changed = true;
            this.redrawpens();

            
        }


    });


    RXCore.onGuiautoPenTable(() => {

        this.pentablestate = true;
        RXCore.setPenTable(this.pentablestate);

    });

    this.rxCoreService.guiState$.subscribe((state) => {
      this.guiState = state;
    });

    RXCore.penTabledialog();
  }

  

  onPenTableEnabledChange(onoff: boolean): void {
    this.penTableEnabled = onoff;
    this.pentablestate = onoff;
    RXCore.setPenTable(onoff);
  }
  
  sortpens() : void{

    function compare(a, b) {
        const ida = a.index;
        const idb = b.index;
      
        let comparison = 0;
        if (ida > idb) {
          comparison = 1;
        } else if (ida < idb) {
          comparison = -1;
        }
        return comparison;
    }

    this.penData.sort(compare);

  }

  redrawpens() : void{
    this.penData = [];

    const curpentable = RXCore.get2DVectorPentable();

    if(curpentable){

        this.penData = [];

        for (var pi = 0; pi < curpentable.pens.length;pi++){
            
            this.penData.push({index : curpentable.pens[pi].penindex, width : curpentable.pens[pi].displaywidth, color : curpentable.pens[pi].color});

            
        }
        this.sortpens();
        

    }

  }

 setPenTableScaling() : void {

    const curpentable : IVectorPenTable = RXCore.get2DVectorPentable();
    if (curpentable) {

      for (const pen of curpentable.pens) {
        if (pen) {
          RXCore.setPenwidth(pen);
        }
      }
      curpentable.changed = true;
    }


 }

  onPenTableScaledChange(onoff: boolean): void {
    this.penTableScaled = onoff;
    RXCore.setPenTableScaled(onoff);
    this.setPenTableScaling();
    
  }

  
  onPenTableDefault(): void {
    const curpentable : IVectorPenTable = RXCore.get2DVectorPentable();

    if (curpentable?.pens) {
      for (const pen of curpentable.pens) {
        if (pen) {
          pen.resetcolor?.();
          pen.resetwidth?.();
          pen.resetstyle?.();
        }
      }

      curpentable.changed = false;
      this.redrawpens();

      RXCore.setPenTable(this.pentablestate);

    }
  }

  onPenTableUpload(fileInput: HTMLInputElement): void {
    RXCore.usePentableUpload();
    //fileInput.id;
    RXCore.setuploadPenTableInput(fileInput);
    fileInput.click();
  }
  
  onPenTableFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (!input.files || input.files.length === 0) {
      return;
    }
  
    RXCore.fileSelected();
  
    // Optional refresh if needed after upload completes
    // RxCore.penTabledialog();
  }
  
  clearFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = '';
  }

  openColorPicker(row: IPenTableRow, event: MouseEvent): void {
    this.selectedPenRow = row;
    this.colorPickerVisible = true;
  }

  onPenColorChanged(color: string): void {
    if (!this.selectedPenRow) {
      return;
    }
      this.selectedPenRow.color = color;

      this.colorPickerVisible = false;
      this.selectedPenRow = null;

  }
  
  onColorSelect(color: string): void {
    
    this.color = color;
    
  }

  
  
}