import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecentFilesService {
  private storageKey = 'recentFiles';

  getRecentFiles() {
    const files = localStorage.getItem(this.storageKey);
    return files ? JSON.parse(files) : [];
  }

  addRecentFile(file) {
    const files = this.getRecentFiles();
    const existingIndex = files.findIndex(f => f.name === file.name);
    if (existingIndex > -1) {
      files.splice(existingIndex, 1);
    }
    files.unshift(file);
    if (files.length > 10) {
      files.pop();
    }
    localStorage.setItem(this.storageKey, JSON.stringify(files));
  }
}
