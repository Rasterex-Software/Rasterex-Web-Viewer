import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolsLibraryComponent } from './symbols-library.component';

describe('SymbolsLibraryComponent', () => {
  let component: SymbolsLibraryComponent;
  let fixture: ComponentFixture<SymbolsLibraryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SymbolsLibraryComponent]
    });
    fixture = TestBed.createComponent(SymbolsLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
