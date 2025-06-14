import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileManageService } from '../../../services/file-manage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  selectedFiles: File[] = [];
  isDragging = false;
  readonly MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB in bytes
  readonly MAX_FILES = 5;
  isUploading = false;

  constructor(
    private snackBar: MatSnackBar,
    private fileManageService: FileManageService,
    private router: Router
  ) { }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.addFiles(files);
    event.target.value = ''; // reset file input so same file can be selected again if removed
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(files);
    }
  }

  private addFiles(files: FileList): void {
    if (files.length + this.selectedFiles.length > this.MAX_FILES) {
      this.snackBar.open(`You can upload a maximum of ${this.MAX_FILES} files only.`, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > this.MAX_FILE_SIZE) {
        this.snackBar.open(
          `File "${file.name}" exceeds the maximum size of 200 MB and was not added.`,
          'Close',
          { duration: 5000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
        continue;
      }

      if (!this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.push(file);
        if (this.selectedFiles.length === this.MAX_FILES) {
          // If reached max files, stop adding more
          break;
        }
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  clearFiles(): void {
    this.selectedFiles = [];
  }

  async uploadFiles(): Promise<void> {
    if (this.selectedFiles.length === 0) return;

    this.isUploading = true;
    try {
      const response = await this.fileManageService.uploadFiles(this.selectedFiles);

      // Handle duplicate files if any
      if (response.duplicateFiles && response.duplicateFiles.length > 0) {
        const duplicateNames = response.duplicateFiles.map(f => f.name).join(', ');
        this.snackBar.open(
          `Some files were duplicates and skipped: ${duplicateNames}`,
          'Close',
          { duration: 5000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }

      this.snackBar.open(
        response.message || 'Files uploaded successfully!',
        'Close',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );


      this.clearFiles();
      this.router.navigate(['/admin/']);
    } catch (error) {
      this.snackBar.open(
        'Failed to upload files. Please try again.',
        'Close',
        { duration: 5000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
    } finally {
      this.isUploading = false;
    }
  }
}
