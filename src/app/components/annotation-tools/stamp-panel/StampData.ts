
export interface StampData {
  id: number;
  name: string;
  src: string;
  type: string;// 'image/svg+xml'
  height: number;
  width: number;
  originalFileName?: string; // Optional field for storing original filename
  // Custom stamp creation settings for editing
  stampSettings?: {
    stampText: string;
    textColor: string;
    selectedFontStyle: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    username: boolean;
    date: boolean;
    time: boolean;
    strokeWidth: number;
    strokeColor: string;
    strokeRadius: number;
    fillColor: string;
    fillOpacity: number;
    font: any;
 };

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
 