import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FileSelectionOptions, FileMetadata, FileMetadataService } from 'src/app/services/file-metadata.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-file-metadata-modal',
  templateUrl: './file-metadata-modal.component.html',
  styleUrls: ['./file-metadata-modal.component.scss']
})
export class FileMetadataModalComponent {
  fileName: string;
  filePath: string = '';
  @Output() confirmed = new EventEmitter<FileSelectionOptions>();
  @Output() cancelled = new EventEmitter<void>();

  metadata: FileMetadata | null = null;
  loading = true;
  error = false;

  selectedLayers: string[] = [];
  selectedBlocks: string[] = [];


  constructor(
    private fileMetadataService: FileMetadataService,
    private dialogRef: MatDialogRef<FileMetadataModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fileName: string }
  ) {
    this.fileName = data.fileName;
  }

  ngOnInit() {
    this.loadMetadata(this.fileName);
  }


  noLayersFound = false;
  noBlocksFound = false;
  noContentFound = false;



  async loadMetadata(fileName: string): Promise<void> {
    this.loading = true;
    this.error = false;

    try {
      const data = await new Promise<any>((resolve, reject) => {
        this.fileMetadataService.getFileMetadata(fileName).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err)
        });
      });

      if (!data) {
        this.error = true;
        console.warn('No metadata received for file:', fileName);
        return;
      }

      const layers = Array.isArray(data.layers) ? [...data.layers] : [];
      const layouts = Array.isArray(data.layouts) ? [...data.layouts] : [];

      this.metadata = {
        ...data,
        layers,
        layouts
      };

      this.selectedLayers = [...layers];
      this.selectedBlocks = this.getAllBlocks();

      if (layers.length === 0 && this.selectedBlocks.length === 0) {
        console.warn('No layers or blocks found for this file.');
      }

      this.noLayersFound = layers.length === 0;
      this.noBlocksFound = this.selectedBlocks.length === 0;
      this.noContentFound = this.noLayersFound && this.noBlocksFound;

    } catch (err) {
      this.error = true;
      console.error('Failed to load file metadata:', err);
    } finally {
      this.loading = false;
    }
  }



  private getAllBlocks(): string[] {
    if (!this.metadata?.layouts) return [];
    return this.metadata.layouts.flatMap(layout => layout.blocks || []);
  }


  toggleLayer(layer: string) {
    const index = this.selectedLayers.indexOf(layer);
    if (index > -1) {
      this.selectedLayers.splice(index, 1);
    } else {
      this.selectedLayers.push(layer);
    }
  }

  toggleBlock(block: string) {
    const index = this.selectedBlocks.indexOf(block);
    if (index > -1) {
      this.selectedBlocks.splice(index, 1);
    } else {
      this.selectedBlocks.push(block);
    }
  }
  selectAllLayers() {
    this.selectedLayers = [...(this.metadata?.layers || [])];
  }

  deselectAllLayers() {
    this.selectedLayers = [];
  }

  selectAllBlocks() {
    this.selectedBlocks = this.getAllBlocks();
  }

  deselectAllBlocks() {
    this.selectedBlocks = [];
  }
  validationError: boolean = false;
  validationErrorMessage: string = '';
  onConfirm() {
    const hasLayers = this.selectedLayers.length > 0;
    const hasBlocks = this.selectedBlocks.length > 0;

    const layersAvailable = (this.metadata?.layers?.length || 0) > 0;
    const blocksAvailable = this.getAllBlocks().length > 0;


    if (layersAvailable && blocksAvailable) {
      if (!hasLayers && hasBlocks) {
        this.validationError = true;
        this.validationErrorMessage = 'Please select at least one layer before proceeding.';
        return;
      }

      if (!hasBlocks && hasLayers) {
        this.validationError = true;
        this.validationErrorMessage = 'Please select at least one block before proceeding.';
        return;
      }

      if (!hasLayers && !hasBlocks) {
        this.validationError = true;
        this.validationErrorMessage = 'Please select at least one layer and one block before proceeding.';
        return;
      }
    }

    if (layersAvailable && !blocksAvailable && !hasLayers) {
      this.validationError = true;
      this.validationErrorMessage = 'Please select at least one layer before proceeding.';
      return;
    }

    if (blocksAvailable && !layersAvailable && !hasBlocks) {
      this.validationError = true;
      this.validationErrorMessage = 'Please select at least one block before proceeding.';
      return;
    }

    this.validationError = false;
    this.validationErrorMessage = '';
    const options: FileSelectionOptions = {
      selectedLayers: this.selectedLayers,
      selectedBlocks: this.selectedBlocks
    };
    this.confirmed.emit(options);
  }

  onCancel() {
    this.cancelled.emit();
  }

  isLayerSelected(layer: string): boolean {
    return this.selectedLayers.includes(layer);
  }

  isBlockSelected(block: string): boolean {
    return this.selectedBlocks.includes(block);
  }
}
