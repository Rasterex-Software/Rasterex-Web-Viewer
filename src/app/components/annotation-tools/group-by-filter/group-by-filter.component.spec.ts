import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupByFilterComponent } from './group-by-filter.component';

describe('GroupByFilterComponent', () => {
  let component: GroupByFilterComponent;
  let fixture: ComponentFixture<GroupByFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupByFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupByFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 