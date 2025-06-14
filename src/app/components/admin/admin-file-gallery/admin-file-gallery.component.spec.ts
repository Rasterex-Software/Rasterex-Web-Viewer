import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFileGalleryComponent } from './admin-file-gallery.component';

describe('AdminFileGalleryComponent', () => {
  let component: AdminFileGalleryComponent;
  let fixture: ComponentFixture<AdminFileGalleryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminFileGalleryComponent]
    });
    fixture = TestBed.createComponent(AdminFileGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
