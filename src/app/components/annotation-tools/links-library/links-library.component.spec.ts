import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksLibraryComponent } from './links-library.component';

describe('LinksLibraryComponent', () => {
  let component: LinksLibraryComponent;
  let fixture: ComponentFixture<LinksLibraryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinksLibraryComponent]
    });
    fixture = TestBed.createComponent(LinksLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
