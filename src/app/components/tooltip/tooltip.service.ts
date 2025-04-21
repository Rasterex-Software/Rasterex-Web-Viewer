import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TooltipService {
  private tooltipSubject = new BehaviorSubject<any>({});
  public tooltip$ = this.tooltipSubject.asObservable();

  tooltip(data: any): void {
    this.tooltipSubject.next(data);
  }

 closeTooltip(): void {
    this.tooltipSubject.next({});
 }
}
