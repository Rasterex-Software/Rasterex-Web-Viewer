import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomPanelComponent } from './room-panel.component';

describe('RoomPanelComponent', () => {
  let component: RoomPanelComponent;
  let fixture: ComponentFixture<RoomPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoomPanelComponent]
    });
    fixture = TestBed.createComponent(RoomPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
