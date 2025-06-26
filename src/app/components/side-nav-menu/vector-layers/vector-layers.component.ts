import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { IVectorLayer } from 'src/rxcore/models/IVectorLayer';

@Component({
  selector: 'rx-vector-layers',
  templateUrl: './vector-layers.component.html',
  styleUrls: ['./vector-layers.component.scss']
})
export class VectorLayersComponent implements OnInit {
  tabActiveIndex: number = 0;
  vectorLayersAll: boolean = true;
  vectorLayers: Array<IVectorLayer> = [];
  guiState: any;

  constructor(private readonly rxCoreService: RxCoreService) {}

  ngOnInit(): void {
    this.rxCoreService.guiVectorLayers$.subscribe((layers) => {

      this.vectorLayers = layers;

    });

    this.rxCoreService.guiState$.subscribe((state) => {
      this.guiState = state;
      //this.canChangeSign = state.numpages && state.isPDF && RXCore.getCanChangeSign();

    });
    if(!this.vectorLayers)
    {
      localStorage.removeItem("selectedLayers");
    }
  }

  onVectorLayersAllSelect(onoff: boolean): void {
    this.vectorLayersAll = onoff;
    RXCore.vectorLayersAll(onoff);
  }

  onVectorLayerClick(layer: any): void {
    //RXCore.changeVectorLayer(layer?.index);

    if (this.guiState.isPDF){
      RXCore.changePDFLayer(layer.id, !layer.visible);
    }else{
      RXCore.changeVectorLayer(layer?.index);
    }

    /*if($scope.filetype == "file_pdf"){
      RxCore.changePDFLayer(item.id, item.visible);
  }else{
    
  
    (item.state == 1) ? item.state = 0 : item.state = 1;
  }*/


  /*export interface IVectorLayer {
    index: number;
    name: string;
    state: boolean;
    color: string;
  }*/


  }
}
