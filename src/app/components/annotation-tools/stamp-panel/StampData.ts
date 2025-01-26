
export interface StampData {
    id: number;
    name: string;// unique name of stamp
    src: string;
    type: string;// 'image/svg+xml'
    height: number;
    width: number;
  }

export interface StampStoreData {
  name: string;// unique name of stamp
  type: string;
  content: string;
}

export enum StampType {
  CustomStamp = 'CustomStamp',
  UploadStamp = 'UploadStamp'
}  