import { Injectable } from '@angular/core';
import { FileCategory } from '../shared/enums/file-category';

@Injectable({
  providedIn: 'root'
})
export class FileCategoryService {
  private extensionMap: { [key: string]: FileCategory } = {
     // 2D CAD
  '.dwg': FileCategory.TwoD,
  '.dgn': FileCategory.TwoD,
  '.idw': FileCategory.TwoD,
  '.tiff': FileCategory.TwoD,
  // '.dwf': FileCategory.TwoD,

  //plotter Files
  '.plt': FileCategory.Plotter,
  '.gbr': FileCategory.Plotter,

  //Image Files
  '.jpg': FileCategory.ImageFile,
  '.jpeg': FileCategory.ImageFile,
  '.png': FileCategory.ImageFile,
   '.tif': FileCategory.ImageFile,

  // 3D Models
  '.stp': FileCategory.ThreeD,
  '.step': FileCategory.ThreeD,
  '.ifc': FileCategory.ThreeD,
  '.igs': FileCategory.ThreeD,
  '.ipt': FileCategory.ThreeD,

  // Office
  '.doc': FileCategory.Office,
  '.docx': FileCategory.Office,
  '.xlsx': FileCategory.Office,
  '.xls': FileCategory.Office,
  '.ppt': FileCategory.Office,
  '.pptx': FileCategory.Office,
  '.pdf': FileCategory.Office,
  };

  getCategory(fileName: string):  FileCategory {
    const extension = this.getFileExtension(fileName);
    return this.extensionMap[extension] || 'Other';
  }

getCategories(
  files: { id: string; name: string }[],
  fileCategory?: FileCategory | null
): { id: string; name: string; category: FileCategory }[] {
  return files
    .map(file => ({
      id: file.id,
      name: file.name,
      category: this.getCategory(file.name)
    }))
    .filter(file => !fileCategory || file.category === fileCategory);
}

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot).toLowerCase() : '';
  }
}
