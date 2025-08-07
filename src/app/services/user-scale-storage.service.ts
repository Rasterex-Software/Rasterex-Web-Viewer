import { Injectable } from '@angular/core';
import { ScaleWithPageRange } from './scale-management.service';

@Injectable({ providedIn: 'root' })
export class UserScaleStorageService {
  private getKey(userId: number | string): string {
    return `user_scales_${userId}`;
  }

  getScales(userId: number | string): ScaleWithPageRange[] {
    const key = this.getKey(userId);
    const data = localStorage.getItem(key);

    return data ? JSON.parse(data) : [];
  }

  saveScales(userId: number | string, scales: ScaleWithPageRange[]): void {
    const key = this.getKey(userId);

    localStorage.setItem(key, JSON.stringify(scales));
  }
} 