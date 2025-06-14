import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLandingComponent } from './admin-landing.component';

describe('AdminLandingComponent', () => {
  let component: AdminLandingComponent;
  let fixture: ComponentFixture<AdminLandingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminLandingComponent]
    });
    fixture = TestBed.createComponent(AdminLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
