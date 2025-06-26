import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileMetadataModalComponent } from './file-metadata-modal.component';

describe('FileMetadataModalComponent', () => {
  let component: FileMetadataModalComponent;
  let fixture: ComponentFixture<FileMetadataModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileMetadataModalComponent]
    });
    fixture = TestBed.createComponent(FileMetadataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
