import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
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

  guiState: any;

 constructor(private readonly rxCoreService: RxCoreService) {}

  ngOnInit(): void {

    

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

  

  onPenTableUpload(): void {
    //RXCore.GUI_penTableJSON();
    RXCore.usePentableUpload();
  }
}