import { Component } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { IBlock3D } from 'src/rxcore/models/IBlock3D';
import { TreeviewItem } from '../../common/treeview/models/treeview-item';
import { TreeviewConfig } from '../../common/treeview/models/treeview-config';
import { RxCoreService } from 'src/app/services/rxcore.service';

@Component({
  selector: 'rx-threed-parts',
  templateUrl: './threed-parts.component.html',
  styleUrls: ['./threed-parts.component.scss']
})
export class ThreedPartsComponent {
  tabActiveIndex: number = 0;
  select3DVectorBlock: boolean = false;

  config = TreeviewConfig.create({
    hasFilter: false,
    decoupleChildFromParent: true
  });

  items: Array<TreeviewItem>;

  constructor(private readonly rxCoreService: RxCoreService) {
    this.rxCoreService.guiState$.subscribe((state) => {
      this.tabActiveIndex = 0;
      this.select3DVectorBlock = false;
    });
  }

  private _getLeafGlobalIds(node: IBlock3D): string[] {
    const ids = new Set<string>();
    const stack: IBlock3D[] = [node];
  
    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;
  
      const hasChildren = !!current.children?.length;
  
      if (hasChildren) {
        stack.push(...current.children);
      } else if (current.globalid) {
        ids.add(current.globalid);
      }
    }
  
    return [...ids];
  }

  /*private _getDescendantGlobalIds(node: IBlock3D): string[] {
    const ids = new Set<string>();
    const stack: IBlock3D[] = [...(node.children ?? [])];
  
    while (stack.length > 0) {
      const current = stack.pop();
  
      if (!current) {
        continue;
      }
  
      if (current.globalid) {
        ids.add(current.globalid);
      }
  
      if (current.children?.length) {
        stack.push(...current.children);
      }
    }
  
    return [...ids];
  }*/

  private _getItems(parts: Array<IBlock3D>): Array<TreeviewItem> {
    const items: Array<TreeviewItem> = [];
    for (let part of parts) {
      const item = new TreeviewItem({
        text: part?.name || '',
        value: part,
        checked: part.state
      });

      if (part.children?.length) {
        item.children = this._getItems(part.children);
      }

      items.push(item);
    }

    return items;
  }

  /*private _itemCheckedChange(checked: boolean, node: IBlock3D): void {
    const globalIds = this._getDescendantGlobalIds(node);
  
    for (const globalid of globalIds) {
      const meshIds = RXCore.search3dAttributes(globalid) || [];
  
      for (const mesh of meshIds) {
        const id = mesh.userData?.name || globalid;
        RXCore.set3DBlockState(id, checked);
      }
    }
  }*/

  private _itemCheckedChange(checked: boolean, node: IBlock3D): void {
    const leafGlobalIds = this._getLeafGlobalIds(node);
    let mesharr: any[] = [];
    let meshnode: Array<any> = [];

    if(leafGlobalIds.length != 0){
      const mehsestest = RXCore.search3DAttributesExArr(leafGlobalIds);
      for(let meshid = 0; meshid < mehsestest.length; meshid ++){
        const id = mehsestest[meshid].userData?.name;// ?? leafGlobalIds[glid];
        RXCore.set3DBlockState(id, checked);
      }
  
    }else{

      if (node.globalid) {
        meshnode = RXCore.search3dAttributes(node.globalid);
      } else {
        meshnode = RXCore.search3dAttributes(node.name);
      }
  
      for(let meshid = 0; meshid < meshnode.length; meshid ++){
        const id = meshnode[meshid].userData?.name;// ?? globalid;
        RXCore.set3DBlockState(id, checked);
      }


      
    }
    




    
    /*for(let glid = 0; glid < leafGlobalIds.length; glid ++){
      const meshes = RXCore.search3dAttributesEx(leafGlobalIds[glid], false) || [];

      for(let meshid = 0; meshid < meshes.length; meshid ++){
        const id = meshes[meshid].userData?.name ?? leafGlobalIds[glid];
        RXCore.set3DBlockState(id, checked);
      }
  
      //mesharr.push(...meshes);
    }*/
    /*for(let meshid = 0; meshid < mesharr.length; meshid ++){
      const id = mesharr[meshid].userData?.name;
      RXCore.set3DBlockState(id, checked);
    }*/
    /*for (const globalid of leafGlobalIds) {


      const meshes = RXCore.search3dAttributesEx(globalid, false) || [];

  
      for (const mesh of meshes) {
        const id = mesh.userData?.name ?? globalid;
        RXCore.set3DBlockState(id, checked);
      }
    }*/
  }

  /*private _itemCheckedChange(checked: boolean, node: IBlock3D): void {
    let meshid: Array<any> = [];
    if (node.globalid) {
      meshid = RXCore.search3dAttributes(node.globalid);
    } else {
      meshid = RXCore.search3dAttributes(node.name);
    }

    if (meshid.length > 0) {
      for(let mi = 0; mi < meshid.length; mi++) {
        const globid = meshid[mi].userData.name;
        RXCore.set3DBlockState(globid, checked);
      }
    }
  }*/

  ngOnInit(): void {
    this.rxCoreService.gui3DParts$.subscribe((parts) => {
      if (this.select3DVectorBlock) {
        this.select3DVectorBlock = false;
        return;
      }
      this.items = this._getItems(parts);
    });
  }

  onCheckedAllChange(state: boolean): void {
    RXCore.set3DBlockStateAll(state);
  }

  onItemCheckedChange(event: TreeviewItem): void {
    this.select3DVectorBlock = false;
    this._itemCheckedChange(event.checked, event.value);
  }

  onItemClick(item: TreeviewItem): void {
    this.select3DVectorBlock = true;
    const meshid = RXCore.search3dAttributes(item.value.globalid);
    if (meshid.length > 0) {
      RXCore.select3DVectorBlock(meshid[0].userData.name);
    }
  }
}
