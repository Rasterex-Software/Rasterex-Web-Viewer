import { Injectable } from '@angular/core';
import { ScaleWithPageRange } from './scale-management.service';

export interface FileScaleData {
  fileId: string;
  fileName: string;
  scales: ScaleWithPageRange[];
  selectedScale?: ScaleWithPageRange | null;
}

@Injectable({ providedIn: 'root' })
export class FileScaleStorageService {
  private fileScalesMap: Map<string, FileScaleData> = new Map();

  constructor() {}

  private getFileId(file: any): string {
    // Use file index as primary identifier since it's more stable than name/path
    const fileIndex = file.index !== undefined ? file.index : 'unknown';
    let fileName = file.name || 'unknown';

    // Extract just the filename if it contains a full path
    // Use file name as primary identifier since index is not unique per file
    // Add a hash of the file path/name to ensure uniqueness
    
    if (fileName.includes('/') || fileName.includes('\\')) {
      const pathParts = fileName.split(/[/\\]/);
      fileName = pathParts[pathParts.length - 1];
    }

    // Create a stable ID using index and clean filename
    const fileId = `file_${fileIndex}_${fileName}`.replace(/[^a-zA-Z0-9_]/g, '_');

    return fileId;
  }

  getScalesForFile(file: any): ScaleWithPageRange[] {
    const fileId = this.getFileId(file);
    let fileData = this.fileScalesMap.get(fileId);
    let scales = fileData?.scales || [];

    // If no scales found with exact match, try to find by file index only
    if (scales.length === 0 && file.index !== undefined) {
      for (const [key, data] of this.fileScalesMap) {
        if (key.startsWith(`file_${file.index}_`)) {
          scales = data.scales;
          break;
        }
      }
    }

    return scales;
  }

  getSelectedScaleForFile(file: any): ScaleWithPageRange | null {
    const fileId = this.getFileId(file);
    let fileData = this.fileScalesMap.get(fileId);
    let selectedScale = fileData?.selectedScale || null;

    // If no selected scale found with exact match, try to find by file index only
    if (!selectedScale && file.index !== undefined) {
      for (const [key, data] of this.fileScalesMap) {
        if (key.startsWith(`file_${file.index}_`)) {
          selectedScale = data.selectedScale || null;
          break;
        }
      }
    }
    return selectedScale;
  }

  saveScalesForFile(file: any, scales: ScaleWithPageRange[]): void {
    const fileId = this.getFileId(file);
    const existingData = this.fileScalesMap.get(fileId);

    scales.forEach((scale, index) => {});

    const fileData: FileScaleData = {
      fileId,
      fileName: file.name,
      scales: [...scales],
      selectedScale: existingData?.selectedScale,
    };

    this.fileScalesMap.set(fileId, fileData);
  }

  setSelectedScaleForFile(
    file: any,
    selectedScale: ScaleWithPageRange | null
  ): void {
    const fileId = this.getFileId(file);
    const existingData = this.fileScalesMap.get(fileId);

    if (existingData) {
      existingData.selectedScale = selectedScale;

      // Ensure the selected scale is also in the scales array
      if (selectedScale) {
        const scaleExists = existingData.scales.some(
          (scale) => scale.label === selectedScale.label
        );
        if (!scaleExists) {
          existingData.scales.push(selectedScale);
        }
      }

      this.fileScalesMap.set(fileId, existingData);
    } else {
      const fileData: FileScaleData = {
        fileId,
        fileName: file.name,
        scales: selectedScale ? [selectedScale] : [],
        selectedScale,
      };
      this.fileScalesMap.set(fileId, fileData);
    }
  }

  updateScaleInFile(
    file: any,
    originalLabel: string,
    updatedScale: ScaleWithPageRange
  ): void {
    const fileId = this.getFileId(file);
    const existingData = this.fileScalesMap.get(fileId);

    if (existingData) {
      const index = existingData.scales.findIndex(
        (s) => s.label === originalLabel
      );
      if (index !== -1) {
        existingData.scales[index] = updatedScale;

        // Update selected scale if it was the one being updated
        if (existingData.selectedScale?.label === originalLabel) {
          existingData.selectedScale = updatedScale;
        }

        this.fileScalesMap.set(fileId, existingData);
      }
    }
  }

  deleteScaleFromFile(file: any, scaleLabel: string): void {
    const fileId = this.getFileId(file);
    const existingData = this.fileScalesMap.get(fileId);

    if (existingData) {
      existingData.scales = existingData.scales.filter(
        (s) => s.label !== scaleLabel
      );

      // Clear selected scale if it was the one being deleted
      if (existingData.selectedScale?.label === scaleLabel) {
        existingData.selectedScale = null;
      }

      this.fileScalesMap.set(fileId, existingData);
    }
  }

  fixSelectedScaleConsistency(): void {
    let fixedCount = 0;

    for (const [fileId, fileData] of this.fileScalesMap) {
      if (
        fileData.selectedScale &&
        !fileData.scales.some(
          (scale) => scale.label === fileData.selectedScale?.label
        )
      ) {
        fileData.scales.push(fileData.selectedScale);
        fixedCount++;
      }
    }
  }

  clearAllScales(): void {
    this.fileScalesMap.clear();
  }
  
}
