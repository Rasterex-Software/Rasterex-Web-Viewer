import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageLibraryComponent } from './image-library.component';

describe('ImageLibraryComponent', () => {
  let component: ImageLibraryComponent;
  let fixture: ComponentFixture<ImageLibraryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageLibraryComponent]
    });
    fixture = TestBed.createComponent(ImageLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
