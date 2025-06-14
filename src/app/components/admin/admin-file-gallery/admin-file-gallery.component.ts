import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DemoFileGroup, FileManageService } from 'src/app/services/file-manage.service';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';

@Component({
  selector: 'app-admin-file-gallery',
  templateUrl: './admin-file-gallery.component.html',
  styleUrls: ['./admin-file-gallery.component.scss']
})
export class AdminFileGalleryComponent {
  isLoading: boolean = true;
  groups: DemoFileGroup[] = [];
  selected: DemoFileGroup;
  constructor(
    private readonly rxCoreService: RxCoreService,
    private demoFileService: FileManageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadDemoFiles();
  }

  
  async loadDemoFiles() {
    this.isLoading = true;
    try {
      this.groups = await this.demoFileService.fetchDemoFiles();
      if (this.groups.length > 0) {
        this.selected = this.groups[0];
      }
    } catch (error) {
      console.error('Error loading demo files:', error);
    }
    finally {
      this.isLoading = false;
    }
  }

  navigateToFileUpload() {
    this.router.navigate(['/admin/upload']);
  }
  async deleteFile(event: Event, item: any) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this file?')) {
      try {
         const currentGroupName = this.selected?.name;
        await this.demoFileService.deleteFile(item.id);
        if (this.selected) {
          this.selected.items = this.selected.items.filter(file => file.id !== item.id);
        }
        await this.loadDemoFiles();
          if (currentGroupName) {
          const previousGroup = this.groups.find(group => group.name === currentGroupName);
          if (previousGroup) {
            this.selected = previousGroup;
          }
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file. Please try again.');
      }
    }
  }
}
