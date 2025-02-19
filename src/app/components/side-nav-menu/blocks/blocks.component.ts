import { ChangeDetectorRef, Component, OnInit, Pipe } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { IVectorBlock } from 'src/rxcore/models/IVectorBlock';
// import { IVectorLayer } from 'src/rxcore/models/IVectorLayer';

interface IBlockAttribute {
  name: string;
  value: string | number;
}

@Component({
  selector: 'rx-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
})
export class BlocksComponent implements OnInit {
  vectorBlocksAll: boolean = true;
  vectorBlocks: Array<Array<IVectorBlock>> = [];

  lastSelectBlock?: IVectorBlock;

  infoData: Array<IBlockAttribute> = [];
  infoPanelVisible: boolean = false;

  searchPanelVisible = false;
  searchAttriName: string;
  searchBlockName: string;
  searchListData: any[] = [];
  searchResultInfo: string;
  isSearchResultDirty = false; // used when search criteria is changed and search result is not updated yet

  constructor(private readonly rxCoreService: RxCoreService, private ref: ChangeDetectorRef) {}

  get sortVectorBlocks():Array<Array<IVectorBlock>> {
    return this.vectorBlocks.sort((a, b) => a[0].name.localeCompare(b[0].name));
  }

  ngOnInit(): void {
    this.rxCoreService.guiVectorBlocks$.subscribe((blocks) => {
      // this.vectorBlocks = blocks;
      this.vectorBlocks = [];
      blocks.forEach((block) => {
        const attributes = RXCore.getBlockAttributes(block.index);
        // @ts-ignore
        if (block.insert || (attributes && attributes.length > 0)) {
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

      this.vectorBlocks.sort((a: IVectorBlock[], b: IVectorBlock[]) =>{
          if (a.length > 0 && b.length > 0) {
            const str1 = a[0].name;
            const str2 = b[0].name;
            return str1.toLowerCase() >= str2.toLowerCase() ? 1: -1;
          }
          return 0;
      });

      // close panels when switch docs
      this.infoPanelVisible = false;
      this.searchPanelVisible = false;
    });

    // enable to select a block
    RXCore.getBlockInsert(true);
    RXCore.onGui2DBlock((block: IVectorBlock) => {
      // console.log("Block clicked:", block);
      this.onSelectBlock(block);
    });
  }

  onOpenSearchBlock() {
    this.searchPanelVisible = true;
    this.searchAttriName = "";
    this.searchBlockName = "";
    this.searchBlockAttributes(this.searchAttriName, this.searchBlockName);
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


  areAllBlocksChecked(subBlocks: Array<IVectorBlock>): boolean {
    return subBlocks.every((item) => item.state == 1);
  }

  setBlocksVisible(event: Event, subBlocks: Array<IVectorBlock>, visible: boolean) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent
    if (subBlocks.length > 0) {
      const newState = Number(visible);
      subBlocks.forEach((block: IVectorBlock) => {
        block.state = newState;
        RXCore.changeVectorBlock(block.index);
      });
      this.ref.markForCheck();
      this.ref.detectChanges();
    }
  }

  foldSubList(event: Event, subBlocks: Array<IVectorBlock>) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent
    // @ts-ignore
    subBlocks[0].fold = Number(!subBlocks[0].fold);
  }

  onVectorBlocksAllSelect(onoff: boolean): void {
    this.vectorBlocksAll = onoff;
    RXCore.vectorBlocksAll(onoff);
  }

  onSelectBlock(block: IVectorBlock) {
    if (this.lastSelectBlock) {
      // if select the same block, then unselect it
      if (block && block.index === this.lastSelectBlock.index) {
        // @ts-ignore
        this.lastSelectBlock.selected = false;
        this.lastSelectBlock = undefined;
        return;
      }
      // @ts-ignore
      this.lastSelectBlock.selected = false;
      this.lastSelectBlock = undefined;
    }
    if (block) {
      // @ts-ignore
      block.selected = true;
      this.lastSelectBlock = block;
      RXCore.markVectorBlock(block.index);
    }
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

  private getBlockAttributes(block: IVectorBlock): Array<IBlockAttribute> {
     // @ts-ignore
     if (block.hasAttribute !== true) {
      return [];
     }

     const arr: Array<IBlockAttribute> = [];

    const attributes = RXCore.getBlockAttributes(block.index);
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      arr.push({name: attribute.name, value: attribute.value});
    }
    // @ts-ignore
    const insert = block.insert;
    if (insert) {
      arr.push({ name: "Handle", value: insert.blockhandleHigh > 0 ? insert.blockhandleHigh.toString(16).toUpperCase() : '' + insert.blockhandleLow.toString(16).toUpperCase() });
      arr.push({ name: "Insert", value: `(${insert.insertX}, ${insert.insertY}, ${insert.insertZ})` });
      arr.push({ name: "Scale", value: `(${insert.insertscaleX}, ${insert.insertscaleY}, ${insert.insertscaleZ})` });
      arr.push({ name: "Rotation", value: insert.insertRot });
    }

    return arr;
  }

  onVectorBlockInfoClick(event: Event, block: IVectorBlock): void {
    event.stopPropagation();

    // @ts-ignore
    if (block.hasAttribute !== true) {
      this.infoData = [];
      return;
    }
    
    this.infoPanelVisible = true;
    this.infoData = this.getBlockAttributes(block);
  }

  onVectorBlockInfoDbClick(event: Event): void {
    // do nothing but prevent the click event
    event.stopPropagation();
  }

  onVectorBlockDbClick(block: IVectorBlock): void {
     RXCore.zoomToBlockInsert(block.index);
  }

  onSearchTextChange() {
    this.isSearchResultDirty = true;
  }

  searchBlockAttributes(attributeName: string, blockName: string) {
    this.searchListData = [];
    this.searchResultInfo = '';

    const attributeRegex = this.getSearchRegex(attributeName);
    const blockRegex = this.getSearchRegex(blockName);
    if (!blockRegex || !attributeRegex) {
      return;
    }

    const attributeResults: Array<any> = [];
    for (const blocks of this.vectorBlocks) {
      for (let i = 0; i < blocks.length; i++) {
        const vectorBlock = blocks[i];
        // @ts-ignore
        if (vectorBlock.hasAttribute === true && blockRegex.test(vectorBlock.name)) {
          const attributes = this.getBlockAttributes(vectorBlock);
          attributes.forEach((attribute) => {
            if (attributeRegex.test(attribute.name)) {
              attributeResults.push({
                blockName: vectorBlock.name,
                attributeName: attribute.name,
                attributeValue: attribute.value,
              });
            }
          });
        }
      }
    }

    attributeResults.sort((a, b) => {
      const blockName1 = a.blockName.toLowerCase();
      const blockName2 = b.blockName.toLowerCase();
      const attributeName1 = a.attributeName.toLowerCase();
      const attributeName2 = b.attributeName.toLowerCase();
      if (blockName1 > blockName2) {
        return 1;
      } else if (blockName1 < blockName2) {
        return -1;
      }
      if (attributeName1 > attributeName2) {
        return 1;
      } else if (attributeName1 < attributeName2) {
        return -1;
      }
      if (typeof(a.attributeValue) === 'number' && typeof(b.attributeValue) === 'number') {
        return a - b;
      }
      if (typeof(a.attributeValue) === 'string' && typeof(b.attributeValue) === 'string') {
        return a.attributeValue.toLowerCase() > b.attributeValue.toLowerCase() ? 1 : -1;
      }
      return 0;
    });

    this.searchListData = attributeResults;
    this.searchResultInfo = `${this.searchListData.length} item(s)`;
    this.isSearchResultDirty = false;
  }

  getSearchRegex(input: string): RegExp | null {
    // Any special char in the input string will be taken as a common char
    const specialChars = /[\-\[\]\/\{\}\(\)\*\+\?\.^\$\|\\]/g;
    input = input.replace(specialChars, '\\$&');
    let regexStr = '.*' + input + '.*';
    if (input === ''/* || input === '*'*/) {
      regexStr = '.*';
    }
    try {
      return new RegExp(regexStr, 'i');
    } catch (error) {
      return null;
    }
  }

  isSearchCretiriaValid(): boolean {
    // if searchAttriName or searchBlockName is empty, it means for searching all.
    // if (!this.searchAttriName || !this.searchBlockName) {
    //   return false;
    // }
    if (!this.getSearchRegex(this.searchAttriName)) {
      return false;
    }
    if (!this.getSearchRegex(this.searchBlockName)) {
      return false;
    }
    return true;
  }
}
