export interface ImageData {
    id: number;
    src: string;
    height: number;
    width: number;
    colorSpace?: string;  // Optional, add if necessary
    data?: Uint8Array; 
  }
  