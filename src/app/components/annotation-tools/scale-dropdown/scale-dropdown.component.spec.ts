import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleDropdownComponent } from './scale-dropdown.component';

describe('DropdownComponent', () => {
  let component: ScaleDropdownComponent;
  let fixture: ComponentFixture<ScaleDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScaleDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
