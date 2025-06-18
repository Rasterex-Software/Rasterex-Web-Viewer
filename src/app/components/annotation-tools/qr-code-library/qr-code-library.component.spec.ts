import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QRCodeLibraryComponent } from './qr-code-library.component';

describe('QRCodeLibraryComponent', () => {
  let component: QRCodeLibraryComponent;
  let fixture: ComponentFixture<QRCodeLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QRCodeLibraryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QRCodeLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 