
export interface StampData {
    id: number;
    name: string;
    src: string;
    type: string;// 'image/svg+xml'
    height: number;
    width: number;
  }

export interface StampStoreData {
  name: string;
  type: string;
  content: string;
}

export enum StampType {
  StandardStamp = 'StandardStamp',
  CustomStamp = 'CustomStamp',
  UploadStamp = 'UploadStamp'
}  