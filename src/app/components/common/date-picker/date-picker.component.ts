import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { IGuiDateFormat } from 'src/rxcore/models/IGuiDateFormat';

@Component({
  selector: 'rx-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  host: {
    '(document:click)': 'handleClickOutside($event)',
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class DatePickerComponent {

  @Input() dateFormat: IGuiDateFormat | undefined;
  @Input() startDate: dayjs.Dayjs | undefined;
  @Input() endDate: dayjs.Dayjs | undefined;
  
  @Output() onSelect = new EventEmitter<{ startDate: dayjs.Dayjs, endDate: dayjs.Dayjs }>();

  constructor(private elem: ElementRef) {
    dayjs.extend(utc);
    dayjs.extend(weekOfYear);
    dayjs.extend(isSameOrBefore);

    const today = dayjs().startOf('day');
    this.quickOptions = [
      { title: 'Today', startDate: today, endDate: today },
      { title: 'Past 7 days', startDate: today.subtract(7, 'days'), endDate: today },
      { title: 'Past 14 days', startDate: today.subtract(14, 'days'), endDate: today },
      { title: 'Past 30 days', startDate: today.subtract(30, 'days'), endDate: today },
    ];
  }

  opened: boolean = false;
  selectedMonth = dayjs();
  calendar: Array<any>;
  quickOptions: Array<any> = [];
  clickCounter: number = 0;

  get date(): string {
    if (!this.startDate && !this.endDate) return 'Select...';

    if (this.startDate && !this.endDate) return `${this.startDate?.format(this.dateFormat?.dateMonthYear)}`;
    if (this.startDate && this.endDate && this.startDate?.isSame(this.endDate)) return `${this.startDate?.format(this.dateFormat?.dateMonthYear)}`;
    return `${this.startDate?.format(this.dateFormat?.dateMonthYear)} - ${this.endDate?.format(this.dateFormat?.dateMonthYear)}`;
  }

  get month(): string {
    return this.selectedMonth?.format(this.dateFormat?.month);
  }

  isStartDate(date: dayjs.Dayjs): boolean {
    return date.isSame((this.startDate || dayjs().startOf('day')));
  }

  isEndDate(date: dayjs.Dayjs): boolean {
    return date.isSame((this.endDate || dayjs().startOf('day')));
  }

  isDateInRange(date: dayjs.Dayjs): boolean {
    if (!this.startDate || !this.endDate || this.startDate.isSame(this.endDate)) return false;
    return this.isStartDate(date) || date.isAfter(this.startDate) && date.isSameOrBefore(this.endDate);
  }

  isRangeSelected(range): boolean {
    if (!this.startDate || !this.endDate) return false;
    return this.startDate.isSame(range.startDate) && this.endDate.isSame(range.endDate);
  }

  _buildCalendar(): void {
    const firstMonthDay = this.selectedMonth.startOf('month');
    const endMonthDay = this.selectedMonth.endOf('month');
    const calendar : any = [];

    let day = firstMonthDay.startOf('week').startOf('day');
    while (day < endMonthDay.endOf('week')) {
      const weekNumber = day.week();
      let week = calendar.find(w => w.weekNumber == weekNumber);
      if (!week) {
        week = { weekNumber, dates: [] };
        calendar.push(week);
      }
      week.dates.push({
        day: day.format('DD'),
        date: day,
        fromSelectedMonth: day.month() == this.selectedMonth.month()
      });
      day = day.add(1, 'day');
    }

    this.calendar = calendar;
  }

  ngOnInit(): void {
    this._buildCalendar();
  }

  handlePrevMonth() {
    this.selectedMonth = this.selectedMonth.subtract(1, 'month');
    this._buildCalendar();
  }

  handleNextMonth() {
    this.selectedMonth = this.selectedMonth.add(1, 'month');
    this._buildCalendar();
  }

  handleSelectDate(date: dayjs.Dayjs): void {
    if (this.clickCounter == 0) {
      this.startDate = date;
      this.endDate = date;
    } else {
      if (date.isBefore(this.startDate)) {
        this.endDate = this.startDate;
        this.startDate = date;
      } else {
        this.endDate = date;
      }
      this.opened = false;
    }
    this.clickCounter = ++this.clickCounter % 2;
    this.onSelect.emit({ startDate: this.startDate || dayjs(), endDate: this.endDate || dayjs() });
  }

  onQuickOptionSelect(option): void {
    this.clickCounter = 0;
    this.startDate = option.startDate;
    this.endDate = option.endDate;
    this.onSelect.emit({ startDate: this.startDate || dayjs(), endDate: this.endDate || dayjs() });
    this.opened = false;
  }

  /* Listeners */
  handleClickOutside(event) {
    if (!this.opened) return;
    const clickedInside = this.elem.nativeElement.contains(event.target);
    if (!clickedInside) {
        this.clickCounter = 0;
        this.opened = false;
    }
  }

  handleKeyboardEvents($event: KeyboardEvent) {
    if (this.opened) {
        $event.preventDefault();
    } else {
        return;
    }

    if ($event.code === 'Escape') {
      this.clickCounter = 0;
        this.opened = false;
    }
  }
}
