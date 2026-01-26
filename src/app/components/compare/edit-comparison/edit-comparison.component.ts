import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CompareService } from '../compare.service';
import { IComparison } from 'src/rxcore/models/IComparison';
import { RXCore } from 'src/rxcore';
import { ColorHelper } from 'src/app/helpers/color.helper';

@Component({
  selector: 'rx-edit-comparison',
  templateUrl: './edit-comparison.component.html',
  styleUrls: ['./edit-comparison.component.scss']
})
export class EditComparisonComponent implements OnInit {
  @Input() comparison: IComparison;
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onApply: EventEmitter<IComparison> = new EventEmitter<IComparison>();

  constructor(
    private readonly compareService: CompareService,
    private readonly colorHelper: ColorHelper) { }

  colorOptions = this.compareService.colorOptions;
  isUpdateComparison: boolean = false;
  dpi: number = 200;

  ngOnInit(): void {
  }

  onSwapClick() {
    const temp = this.comparison.activeSetAs;
    this.comparison.activeSetAs = this.comparison.otherSetAs;
    this.comparison.otherSetAs = temp;
  }

  onActiveColorSelect(color): void {
    this.comparison.activeColor = color;
  }

  onOtherColorSelect(color): void {
    this.comparison.otherColor = color;
  }

  onCancelClick(): void {
    this.onCancel.emit();
  }

  async onApplyClick(): Promise<void> {
    this.isUpdateComparison = true;

    this.compareService.setDPI(this.dpi);

    this.comparison.relativePath = await RXCore.compareOverlayServerJSON(
      this.comparison.activeSetAs.value == 'background' ? this.comparison.activeFile.name : this.comparison.otherFile.name,
      this.comparison.activeSetAs.value == 'background' ? this.comparison.otherFile.name : this.comparison.activeFile.name,
      this.comparison.alignarray,
      this.colorHelper.hexToRgb(this.comparison.activeSetAs.value == 'background' ? this.comparison.activeColor.value : this.comparison.otherColor.value),
      this.colorHelper.hexToRgb(this.comparison.activeSetAs.value == 'background' ? this.comparison.otherColor.value : this.comparison.activeColor.value),
      undefined,
      undefined,
      this.dpi
    );

    this.onApply.emit(this.comparison);

    this.isUpdateComparison = false;
  }
}
