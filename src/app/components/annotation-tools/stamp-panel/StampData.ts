export interface StampData {
    id: number;
    name: string;// unique name of stamp
    src: string;
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
  