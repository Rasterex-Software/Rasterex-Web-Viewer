export interface FileMetadata {
  filename: string;
  filesize: string;
  format: string;
  thumbnail: string; 
  layouts: Layout[];
  layers: string[];
}

export interface Layout {
  name: string;
  blocks: string[];
}


