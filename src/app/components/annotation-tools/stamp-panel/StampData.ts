
export interface StampData {
  id: number;
  name: string;
  src: string;
  type: string;// 'image/svg+xml'
  height: number;
  width: number;
  originalFileName?: string; // Optional field for storing original filename
}

export interface StampStoreData {
  name: string;
  type: string;
  content: string;
  originalFileName?: string; // Optional field for storing original filename
}

export enum StampType {
  StandardStamp = 'StandardStamp',
  CustomStamp = 'CustomStamp',
  UploadStamp = 'UploadStamp'
}  
 