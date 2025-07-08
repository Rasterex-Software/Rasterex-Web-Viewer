import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotePanelComponent } from './note-panel.component';

describe('NotePanelComponent', () => {
  let component: NotePanelComponent;
  let fixture: ComponentFixture<NotePanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotePanelComponent]
    });
    fixture = TestBed.createComponent(NotePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('shouldShowGroup', () => {
    beforeEach(() => {
      // Initialize component properties
      component.showAnnotations = false;
      component.showMeasurements = false;
    });

    it('should return false for empty group', () => {
      const result = component.shouldShowGroup([]);
      expect(result).toBe(false);
    });

    it('should return false for null/undefined group', () => {
      const result = component.shouldShowGroup(null as any);
      expect(result).toBe(false);
    });

    it('should show group with annotations when annotations switch is ON', () => {
      component.showAnnotations = true;
      component.showMeasurements = false;
      
      const groupItems = [
        { ismeasure: false }, // annotation
        { ismeasure: false }  // annotation
      ];
      
      const result = component.shouldShowGroup(groupItems);
      expect(result).toBe(true);
    });

    it('should hide group with annotations when annotations switch is OFF', () => {
      component.showAnnotations = false;
      component.showMeasurements = false;
      
      const groupItems = [
        { ismeasure: false }, // annotation
        { ismeasure: false }  // annotation
      ];
      
      const result = component.shouldShowGroup(groupItems);
      expect(result).toBe(false);
    });

    it('should show group with measurements when measurements switch is ON', () => {
      component.showAnnotations = false;
      component.showMeasurements = true;
      
      const groupItems = [
        { ismeasure: true }, // measurement
        { ismeasure: true }  // measurement
      ];
      
      const result = component.shouldShowGroup(groupItems);
      expect(result).toBe(true);
    });

    it('should hide group with measurements when measurements switch is OFF', () => {
      component.showAnnotations = false;
      component.showMeasurements = false;
      
      const groupItems = [
        { ismeasure: true }, // measurement
        { ismeasure: true }  // measurement
      ];
      
      const result = component.shouldShowGroup(groupItems);
      expect(result).toBe(false);
    });

    it('should show mixed group when annotations switch is ON', () => {
      component.showAnnotations = true;
      component.showMeasurements = false;
      
      const groupItems = [
        { ismeasure: false }, // annotation
        { ismeasure: true }   // measurement
      ];
      
      const result = component.shouldShowGroup(groupItems);
      expect(result).toBe(true);
    });

    it('should show mixed group when measurements switch is ON', () => {
      component.showAnnotations = false;
      component.showMeasurements = true;
      
      const groupItems = [
        { ismeasure: false }, // annotation
        { ismeasure: true }   // measurement
      ];
      
      const result = component.shouldShowGroup(groupItems);
      expect(result).toBe(true);
    });

    it('should show mixed group when both switches are ON', () => {
      component.showAnnotations = true;
      component.showMeasurements = true;
      
      const groupItems = [
        { ismeasure: false }, // annotation
        { ismeasure: true }   // measurement
      ];
      
      const result = component.shouldShowGroup(groupItems);
      expect(result).toBe(true);
    });

    it('should hide mixed group when both switches are OFF', () => {
      component.showAnnotations = false;
      component.showMeasurements = false;
      
      const groupItems = [
        { ismeasure: false }, // annotation
        { ismeasure: true }   // measurement
      ];
      
      const result = component.shouldShowGroup(groupItems);
      expect(result).toBe(false);
    });
  });

  describe('_ensureSelectedValuesAreEnabled', () => {
    beforeEach(() => {
      // Initialize component properties
      component.showAnnotations = true;
      component.showMeasurements = true;
      component.sortByField = 'author';
      
      // Mock the markup list
      const mockMarkupList = [
        { markupnumber: 1, signature: 'user1', ismeasure: false, setdisplay: jasmine.createSpy('setdisplay') },
        { markupnumber: 2, signature: 'user2', ismeasure: true, setdisplay: jasmine.createSpy('setdisplay') },
        { markupnumber: 3, signature: 'user1', ismeasure: false, setdisplay: jasmine.createSpy('setdisplay') }
      ] as any[];
      
      // Mock the service method
      spyOn(component['rxCoreService'], 'getGuiMarkupList').and.returnValue(mockMarkupList);
      
      // Mock RXCore methods
      (window as any).RXCore = {
        getDisplayName: (signature: string) => signature
      };
    });

    it('should clear hidden states for selected author markups', () => {
      // Add some markups to hidden states
      component['hiddenAnnotations'].add(1);
      component['groupHiddenAnnotations'].add(2);
      
      const selectedValues = ['user1'];
      
      // Call the method
      component['_ensureSelectedValuesAreEnabled'](selectedValues, component['rxCoreService'].getGuiMarkupList() as any);
      
      // Check that hidden states are cleared for selected markups
      expect(component['hiddenAnnotations'].has(1)).toBe(false);
      expect(component['hiddenAnnotations'].has(3)).toBe(false);
      // But not for non-selected markups
      expect(component['hiddenAnnotations'].has(2)).toBe(true);
    });

    it('should handle page number filtering', () => {
      component.sortByField = 'pagenumber';
      const mockMarkupList = [
        { markupnumber: 1, pagenumber: 0, ismeasure: false, setdisplay: jasmine.createSpy('setdisplay') },
        { markupnumber: 2, pagenumber: 1, ismeasure: true, setdisplay: jasmine.createSpy('setdisplay') }
      ] as any[];
      spyOn(component['rxCoreService'], 'getGuiMarkupList').and.returnValue(mockMarkupList);
      
      // Add markup to hidden states
      component['hiddenAnnotations'].add(1);
      component['hiddenAnnotations'].add(2);
      
      const selectedValues = [1]; // Page 1
      
      // Call the method
      component['_ensureSelectedValuesAreEnabled'](selectedValues, mockMarkupList);
      
      // Check that hidden states are cleared for selected page markups
      expect(component['hiddenAnnotations'].has(2)).toBe(false);
      // But not for non-selected page markups
      expect(component['hiddenAnnotations'].has(1)).toBe(true);
    });
  });
});
