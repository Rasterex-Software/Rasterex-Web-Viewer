import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { IVectorBlock } from 'src/rxcore/models/IVectorBlock';
import { IVectorLayer } from 'src/rxcore/models/IVectorLayer';

@Component({
  selector: 'rx-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
})
export class BlocksComponent implements OnInit {
  vectorBlocksAll: boolean = true;
  vectorBlocks: Array<Array<IVectorBlock>> = [];

  lastSelectBlock?: IVectorBlock;

  infoData: any = {};
  infoPanelVisible: boolean = false;

  searchPanelVisible = false;
  searchAttriName: string;
  searchBlockName: string;
  searchListData: any[] = [];
  searchResultInfo: string;

  constructor(private readonly rxCoreService: RxCoreService) {}

  ngOnInit(): void {
    this.rxCoreService.guiVectorBlocks$.subscribe((blocks) => {
      // this.vectorBlocks = blocks;
      this.vectorBlocks = [];
      blocks.forEach((block) => {
        const attributes = RXCore.getBlockAttributes(block.index);
        if (attributes && attributes.length > 0) {
          // @ts-ignore
          block.hasAttribute = true;
        }
        // @ts-ignore
        block.fold = 0;
        const subBlocks = this.vectorBlocks.find(
          (subBlocks: Array<IVectorBlock>) => {
            return (
              subBlocks &&
              subBlocks.length > 0 &&
              subBlocks[0].name === block.name
            );
          }
        );
        if (subBlocks) {
          subBlocks.push(block);
        } else {
          this.vectorBlocks.push([block]);
        }
      });
    });
  }

  onOpenSearchBlock() {
    this.searchPanelVisible = true;
    this.searchBlockName = "*";
    this.searchAttriName = "";
    this.searchBlockAttributes(this.searchBlockName, this.searchAttriName);
  }

  toggleSubList(event: Event, subBlocks: Array<IVectorBlock>, state: number) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent
    if (subBlocks.length > 0) {
      subBlocks.forEach((block: IVectorBlock) => {
        block.state = state;
        RXCore.changeVectorBlock(block.index);
      });
    }
  }

  foldSubList(event: Event, subBlocks: Array<IVectorBlock>, fold: number) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent
    if (subBlocks.length > 0) {
      subBlocks.forEach((block: IVectorBlock) => {
        // @ts-ignore
        block.fold = fold;
        RXCore.changeVectorBlock(block.index);
      });
    }
  }

  onVectorBlocksAllSelect(onoff: boolean): void {
    this.vectorBlocksAll = onoff;
    RXCore.vectorBlocksAll(onoff);
  }

  onSelectBlock(block: IVectorBlock) {
    if (this.lastSelectBlock) {
      // @ts-ignore
      this.lastSelectBlock.selected = false;
    }
    // @ts-ignore
    block.selected = true;
    this.lastSelectBlock = block;
  }

  onVectorBlockClick(block: IVectorBlock): void {
    if (block.state == 1) {
      block.state = 0;
    } else {
      block.state = 1;
    }
    //block.state = !block?.state;
    RXCore.changeVectorBlock(block?.index);
  }

  onVectorBlockInfoClick(event: Event, block: IVectorBlock): void {
    event.stopPropagation();

    const attributes = RXCore.getBlockAttributes(block.index);
    if (!attributes || attributes.length === 0) {
      this.infoData = {};
      return;
    }

    const newObjs = {};
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      newObjs[attribute.name] = attribute.value;
    }

    this.infoPanelVisible = true;
    this.infoData = newObjs;
  }

  onVectorBlockInfoDbClick(event: Event): void {
    // do nothing but prevent the click event
    event.stopPropagation();
  }

  onVectorBlockDbClick(block: IVectorBlock): void {
     RXCore.zoomToBlockInsert(block.index);
  }

  searchBlockAttributes(block: string, attribute: string) {
    
    this.searchListData = [];
    this.searchResultInfo = '';

    const blockRegex = this.getSearchRegex(block);
    const attributeRegex = this.getSearchRegex(attribute);
    if (!blockRegex || !attributeRegex) {
      return;
    }

    const attributeResults: Array<any> = [];
    for (const blocks of this.vectorBlocks) {
      for (let i = 0; i < blocks.length; i++) {
        const vectorBlock = blocks[i];
        // @ts-ignore
        if (vectorBlock.hasAttribute === true && blockRegex.test(vectorBlock.name)) {
          const attributes = RXCore.getBlockAttributes(vectorBlock.index);
          if (!attributes || attributes.length === 0) {
             continue;
          }

          attributes.forEach((key) => {
              if (attributeRegex.test(key.name)) {
                attributeResults.push({
                  blockName: vectorBlock.name,
                  attributeName: key.name,
                  attributeValue: key.value,
                });
              }
            });
        }
      }
    }

    this.searchListData = attributeResults;
    this.searchResultInfo = `${this.searchListData.length} item(s)`;
  }

  getSearchRegex(input: string): RegExp | null {
    let regexStr = '.*' + input + '.*';
    if (input === '' || input === '*') {
      regexStr = '.*';
    }
    try {
      return new RegExp(regexStr, 'i');
    } catch (error) {
      return null;
    }
  }

  isSearchCretiriaValid(): boolean {
    if (!this.searchBlockName || !this.searchAttriName) {
      return false;
    }
    if (!this.getSearchRegex(this.searchBlockName)) {
      return false;
    }
    if (!this.getSearchRegex(this.searchAttriName)) {
      return false;
    }
    return true;
  }
}
