import { trigger, state, style, transition, animate } from "@angular/animations";
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  OnInit,
  QueryList,
  EventEmitter,
  Output
} from "@angular/core";
import { AccordionItem } from "./directives/accordion-item.directive";
import { memoize } from 'lodash-es';

@Component({
  selector: "rx-accordion",
  templateUrl: "./accordion.component.html",
  styleUrls: ["./accordion.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('contentExpansion', [
      state('expanded', style({height: '*', opacity: 1, visibility: 'visible'})),
      state('collapsed', style({height: '0px', opacity: 0, visibility: 'hidden'})),
      transition('expanded <=> collapsed',
        animate('200ms cubic-bezier(.37,1.04,.68,.98)')),
    ])
  ]
})
export class AccordionComponent implements  AfterContentInit {
  expanded = new Set<number>();
  @Input() expandAll = false;
  @Input() collapsing = true;
  @Input() isBottom = false;
  @Input() expandFirst = false;
  @Input() expandedIndex: number | null = null;
  @Output() expandedIndexChange = new EventEmitter<number | null>();  
  @ContentChildren(AccordionItem) items: QueryList<AccordionItem>;

  ngAfterContentInit() {

    if (this.expandAll) {
      this.items?.forEach((item, index) => this.expanded.add(index));
    } else if (this.expandFirst && this.items?.length > 0) {
      this.expanded.add(0);
    } else if (this.expandedIndex !== null && this.items?.length > this.expandedIndex) {
      this.expanded.add(this.expandedIndex);
    }
  }

  getToggleState = memoize((index: number) => {
    return this.toggleState.bind(this, index);
  })

  toggleState = (index: number) => {
    if (this.expanded.has(index)) {
      this.expanded.delete(index);
      this.expandedIndex = null;
    } else {
      if (this.collapsing) {
        this.expanded.clear();
      }
      this.expanded.add(index);
      this.expandedIndex = index;
    }
    this.expandedIndexChange.emit(this.expandedIndex);
  };

  isExpanded = (index: number): boolean => {
    return this.expanded.has(index);
  }
}
