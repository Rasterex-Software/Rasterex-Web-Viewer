import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsListFiltersComponent } from './comments-list-filters.component';

describe('CommentsListFiltersComponent', () => {
  let component: CommentsListFiltersComponent;
  let fixture: ComponentFixture<CommentsListFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentsListFiltersComponent]
    });
    fixture = TestBed.createComponent(CommentsListFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
