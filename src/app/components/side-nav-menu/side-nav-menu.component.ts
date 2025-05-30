import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { GuiMode } from 'src/rxcore/enums/GuiMode';
import { SideNavMenuService } from './side-nav-menu.service';
import {TopNavMenuService} from "../top-nav-menu/top-nav-menu.service";

@Component({
  selector: 'side-nav-menu',
  templateUrl: './side-nav-menu.component.html',
  styleUrls: ['./side-nav-menu.component.scss']
})
export class SideNavMenuComponent implements OnInit {

  constructor(private readonly rxCoreService: RxCoreService,
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly topNavMenuService: TopNavMenuService) { }

  guiConfig$ = this.rxCoreService.guiConfig$;
  guiState$ = this.rxCoreService.guiState$;
  guiMode$ = this.rxCoreService.guiMode$;
  GuiMode = GuiMode;
  activeIndex: number = -1;
  toggleablePanelOpened: boolean = false;
  numpages: number;
  canChangeSign: boolean = false;

  guiConfig: any;
  guiState: any;
  guiMode: any;
  containLayers: boolean = false;
  containBlocks: boolean = false;

  ngOnInit(): void {
    this.guiState$.subscribe(state => {
      this.numpages = state.numpages;
      this.guiState = state;
      //this.toggleablePanelOpened = false;
      //this.activeIndex = -1;
      this.canChangeSign = state.numpages && state.isPDF && RXCore.getCanChangeSign();
    });

    this.rxCoreService.guiVectorLayers$.subscribe((layers) => {
      this.containLayers = layers.length > 0;
    });

    this.rxCoreService.guiVectorBlocks$.subscribe((blocks) => {
      this.containBlocks = blocks.length > 0;
    });

    this.guiMode$.subscribe((mode: GuiMode) => {
      this.guiMode = mode;
      if (mode == GuiMode.Signature) {
        this.toggle(5);
      } else {
        this.toggleablePanelOpened = false;

      }
    });

    this.guiConfig$.subscribe((config) => {
      this.guiConfig = config;
    });

    this.sideNavMenuService.sidebarChanged$.subscribe((index: number) => {
      this.toggle(index);
    })
  }

  togglePanel(onoff: boolean){

    this.topNavMenuService.closeSideNav.next(onoff);
    this.toggleablePanelOpened = onoff;
    //RXCore.getBlockInsert(onoff);

  }

  toggle(index) {
    const openIndex = [0, 3, 4, 5, 6].includes(index);
    this.toggleablePanelOpened = openIndex ? this.activeIndex !== index || !this.toggleablePanelOpened : false;
    this.activeIndex = !this.toggleablePanelOpened && openIndex ? -1 : index;

  }

  visibleSidebarItemsCount(): number {
    const visibleItems = this.getVisibleSidebarItems();
    return visibleItems.length;
  }

  private getVisibleSidebarItems() {
    const visibleItems = [
      { index: 0, visible: !this.guiConfig?.disableViewPages },
      {
        index: 5,
        visible:
          this.guiConfig?.canSignature &&
          this.canChangeSign &&
          this.guiMode == GuiMode.Signature,
      },
      {
        index: 3,
        visible:
          !this.guiConfig?.disableViewVectorLayers &&
          (this.guiState?.is2D || this.guiState?.isPDF) &&
          this.containLayers,
      },
      {
        index: 6,
        visible:
          !this.guiConfig?.disableViewVectorLayers &&
          this.guiState?.is2D &&
          this.containBlocks,
      },
      {
        index: 4,
        visible: !this.guiConfig?.disableView3DParts && this.guiState?.is3D,
      },
    ];

    return visibleItems.filter((item) => item.visible);
  }
}
