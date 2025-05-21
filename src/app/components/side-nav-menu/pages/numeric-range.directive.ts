import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumericRange]'
})
export class NumericRangeDirective {
  @Input('appMin') minValue!: number;
  @Input('appMax') maxValue!: number;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    let num = parseFloat(value);
    if (isNaN(num)) return;

    if (this.minValue != null && num < this.minValue) {
      num = this.minValue;
    }
    if (this.maxValue != null && num > this.maxValue) {
      num = this.maxValue;
    }

    const newVal = num.toString();
    if (newVal !== value) {
      this.el.nativeElement.value = newVal;
      this.el.nativeElement.dispatchEvent(new Event('input'));
    }
  }
}
