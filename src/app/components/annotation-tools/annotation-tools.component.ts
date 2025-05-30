import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnnotationToolsService } from './annotation-tools.service';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { UserService } from '../user/user.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Component({
  selector: 'rx-annotation-tools',
  templateUrl: './annotation-tools.component.html',
  styleUrls: ['./annotation-tools.component.scss'],
})
export class AnnotationToolsComponent implements OnInit, OnDestroy {
  guiConfig$ = this.rxCoreService.guiConfig$;
  opened$ = this.service.opened$;
  guiConfig: IGuiConfig | undefined;
  shapesAvailable: number = 5;
  private freehandListenerAdded = false;
  private freehandMouseUpListener: (() => void) | null = null;
  private freehandMouseDownListener: (() => void) | null = null;
  private isDrawing = false;
  private strokeCounter = 0;

  isActionSelected = {
    "TEXT": false,
    "CALLOUT": false,
    "SHAPE_RECTANGLE": false,
    "SHAPE_RECTANGLE_ROUNDED": false,
    "SHAPE_ELLIPSE": false,
    "SHAPE_CLOUD": false,
    "SHAPE_POLYGON": false,
    "NOTE": false,
    "ERASE": false,
    "ARROW_FILLED_BOTH_ENDS": false,
    "ARROW_FILLED_SINGLE_END": false,
    "ARROW_BOTH_ENDS": false,
    "ARROW_SINGLE_END": false,
    "PAINT_HIGHLIGHTER": false,
    "PAINT_FREEHAND": false,
    "PAINT_TEXT_HIGHLIGHTING": false,
    "PAINT_POLYLINE": false,
    "COUNT": false,
    "STAMP": false,
    "SCALE_SETTING": false,
    "IMAGES_LIBRARY": false,
    "SYMBOLS_LIBRARY": false,
    "LINKS_LIBRARY": false,
    "CALIBRATE": false,
    "MEASURE_CONTINUOUS" : false,
    "MEASURE_LENGTH": false,
    "MEASURE_AREA": false,
    "MEASURE_PATH": false,
    "MEASURE_ARC": false,
    "MEASURE_ANGLE_CCLOCKWISE": false,
    "SNAP": false,
    "MARKUP_LOCK" : false,
    "NO_SCALE": false
  };

  get isPaintSelected(): boolean {
    return (
      this.isActionSelected['PAINT_HIGHLIGHTER'] ||
      this.isActionSelected['PAINT_FREEHAND'] ||
      this.isActionSelected['PAINT_TEXT_HIGHLIGHTING'] ||
      this.isActionSelected['PAINT_POLYLINE']
    );
  }

  get isShapeSelected(): boolean {
    return (
      this.isActionSelected['SHAPE_RECTANGLE'] ||
      this.isActionSelected['SHAPE_RECTANGLE_ROUNDED'] ||
      this.isActionSelected['SHAPE_ELLIPSE'] ||
      this.isActionSelected['SHAPE_CLOUD'] ||
      this.isActionSelected['SHAPE_POLYGON']
    );
  }

  get isArrowSelected(): boolean {
    return (
      this.isActionSelected['ARROW_FILLED_BOTH_ENDS'] ||
      this.isActionSelected['ARROW_FILLED_SINGLE_END'] ||
      this.isActionSelected['ARROW_BOTH_ENDS'] ||
      this.isActionSelected['ARROW_SINGLE_END']
    );
  }

  get isMeasureSelected(): boolean {
    return (
      this.isActionSelected['MEASURE_LENGTH'] ||
      this.isActionSelected['MEASURE_AREA'] ||
      this.isActionSelected['MEASURE_PATH'] ||
      this.isActionSelected['MEASURE_ANGLE_CLOCKWISE'] ||
      this.isActionSelected['MEASURE_ANGLE_CCLOCKWISE']
    );
  }

  canAddAnnotation = this.userService.canAddAnnotation$;
  canUpdateAnnotation = this.userService.canUpdateAnnotation$;
  canDeleteAnnotation = this.userService.canDeleteAnnotation$;

  constructor(
    private readonly service: AnnotationToolsService,
    private readonly rxCoreService: RxCoreService,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.guiConfig$.subscribe((config) => {
      this.guiConfig = config;

      this.shapesAvailable =
        Number(!this.guiConfig.disableMarkupShapeRectangleButton) +
        Number(!this.guiConfig.disableMarkupShapeRoundedRectangleButton) +
        Number(!this.guiConfig.disableMarkupShapeEllipseButton) +
        Number(!this.guiConfig.disableMarkupShapeCloudButton) +
        Number(!this.guiConfig.disableMarkupShapePolygonButton);
    });

    // Disable multi-operation mode globally to ensure each drawing operation is a separate undo step
    RXCore.markupAddMulti(false);

    this.rxCoreService.guiState$.subscribe((state) => {
      this._deselectAllActions();
      //this.service.setNotePanelState({ visible: false });
      //this.service.hideQuickActionsMenu();
      //this.service.setNotePopoverState({visible: false, markup: -1});
      //this.service.hide();
      //this.service.setMeasurePanelState({ visible: false });
    });

    this.rxCoreService.guiTextInput$.subscribe(({ rectangle, operation }) => {
      if (operation === -1) return;

      if (operation.start) {
        this._deselectAllActions();
      }
    });

    this.rxCoreService.guiMarkup$.subscribe(({ markup, operation }) => {
      if (markup !== -1) {
        if (markup.type == MARKUP_TYPES.COUNT.type) return;
        if (markup.type == MARKUP_TYPES.STAMP.type) {
          if (operation?.created) return;
          this.isActionSelected['STAMP'] = false;
        }
      }

      // If operation is undo or redo, don't reset the active tool
      if (operation?.isUndo || operation?.isRedo) {
        return;
      }

      if (markup === -1 || operation?.created) {
        const selectedAction = Object.entries(this.isActionSelected).find(
          ([key, value]) => value
        );

        // Only deselect when not in middle of multi-operation drawing
        if (operation?.created && !operation?.isMultiOperation) {
          this._deselectAllActions();
        }

        if (operation?.created && this.shapesAvailable == 1 && selectedAction) {
          this.onActionSelect(selectedAction[0]);
        }
      }
    });

    this.service.measurePanelState$.subscribe((state) => {
      this.isActionSelected['SCALE_SETTING'] = state.visible;

      /*if(state.visible && this.isActionSelected['SCALE_SETTING'] === false){
        // this.onActionSelect('SCALE_SETTING');
        this.isActionSelected['SCALE_SETTING'] = true;
      }*/
    });

    this.service.imagePanelState$.subscribe((state) => {
      this.isActionSelected['IMAGES_LIBRARY'] = state.visible;
    });
    this.service.symbolPanelState$.subscribe((state) => {
      this.isActionSelected['SYMBOLS_LIBRARY'] = state.visible;
    });
    this.service.linkPanelState$.subscribe((state) => {
      this.isActionSelected['LINKS_LIBRARY'] = state.visible;
    });

    this.service.snapState$.subscribe((state) => {
      if (state) {
        this.isActionSelected['SNAP'] = state;
      }
    });
  }

  private _deselectAllActions(excludeTools: string[] = []): void {
    Object.entries(this.isActionSelected).forEach(([key, value]) => {
      // Skip tools that are in the exclude list
      if (excludeTools.includes(key)) {
        return;
      }

      if (
        key !== 'MARKUP_LOCK' &&
        key !== 'SNAP' &&
        key !== 'NO_SCALE' &&
        key !== 'MEASURE_CONTINUOUS'
      ) {
        this.isActionSelected[key] = false;
      }
    });

    console.log('deselect all called');
    RXCore.restoreDefault();
  }

  onActionSelect(actionName: string) {
    const selected = this.isActionSelected[actionName];
    this._deselectAllActions();
    this.isActionSelected[actionName] = !selected;
    if (actionName) {
      this.rxCoreService.resetLeaderLine(true);
    }

    switch (actionName) {
      case 'TEXT':
        RXCore.markUpTextRect(this.isActionSelected[actionName]);
        break;

      case 'CALLOUT':
        RXCore.markUpTextRectArrow(this.isActionSelected[actionName]);
        break;

      case 'SHAPE_RECTANGLE':
        RXCore.setGlobalStyle(true);
        RXCore.markUpShape(this.isActionSelected[actionName], 0);
        break;

      case 'SHAPE_RECTANGLE_ROUNDED':
        RXCore.setGlobalStyle(true);
        RXCore.markUpShape(this.isActionSelected[actionName], 0, 1);
        break;

      case 'SHAPE_ELLIPSE':
        RXCore.setGlobalStyle(true);
        RXCore.markUpShape(this.isActionSelected[actionName], 1);
        break;

      case 'SHAPE_CLOUD':
        RXCore.setGlobalStyle(true);
        if (this.shapesAvailable == 1) {
          RXCore.changeFillColor('A52A2AFF');
          RXCore.markUpFilled();
          RXCore.changeTransp(20);
        }
        RXCore.markUpShape(this.isActionSelected[actionName], 2);
        break;

      case 'SHAPE_POLYGON':
        RXCore.setGlobalStyle(true);
        RXCore.markUpShape(this.isActionSelected[actionName], 3);
        break;

      case 'NOTE':
        RXCore.markUpNote(this.isActionSelected[actionName]);
        //this.service.setNotePanelState({ visible: this.isActionSelected[actionName] });
        break;

      case 'ERASE':
        RXCore.markUpErase(this.isActionSelected[actionName]);
        break;

      case 'ARROW_SINGLE_END':
        RXCore.setGlobalStyle(true);
        RXCore.markUpArrow(this.isActionSelected[actionName], 0);
        break;

      case 'ARROW_FILLED_SINGLE_END':
        RXCore.setGlobalStyle(true);
        RXCore.markUpArrow(this.isActionSelected[actionName], 1);
        break;

      case 'ARROW_BOTH_ENDS':
        RXCore.setGlobalStyle(true);
        RXCore.markUpArrow(this.isActionSelected[actionName], 2);
        break;

      case 'ARROW_FILLED_BOTH_ENDS':
        RXCore.setGlobalStyle(true);
        RXCore.markUpArrow(this.isActionSelected[actionName], 3);
        break;

      case 'PAINT_HIGHLIGHTER':
        RXCore.markUpHighlight(this.isActionSelected[actionName]);
        break;

      case 'PAINT_FREEHAND':
        // Enable freehand drawing
        RXCore.markUpFreePen(this.isActionSelected[actionName]);

        if (this.isActionSelected[actionName]) {
          // Disable multi-add mode for freehand - this forces each stroke to be a separate undo operation
          RXCore.markupAddMulti(false);

          // When freehand is selected, set up proper stroke handling
          if (!this.freehandListenerAdded) {
            const viewportElement =
              document.querySelector('.viewer-viewport') || document.body;

            // Create listener for mouse down - start of stroke
            this.freehandMouseDownListener = () => {
              if (this.isActionSelected['PAINT_FREEHAND']) {
                this.isDrawing = true;
                this.strokeCounter++;
                console.log('Freehand stroke started', this.strokeCounter);
              }
            };

            // Create listener for mouse up - end of stroke
            this.freehandMouseUpListener = () => {
              if (this.isActionSelected['PAINT_FREEHAND'] && this.isDrawing) {
                this.isDrawing = false;
                console.log('Freehand stroke completed', this.strokeCounter);

                // Force the stroke to be finalized immediately
                // This is the key to making each stroke undoable separately
                setTimeout(() => {
                  try {
                    // Call RXCore method to forcefully finalize the current operation
                    // This ensures the current stroke is saved as a separate entity in the undo stack
                    RXCore.selectMarkUp(true); // Switch to selection mode briefly

                    // After a tiny delay, switch back to freehand if still needed
                    setTimeout(() => {
                      if (this.isActionSelected['PAINT_FREEHAND']) {
                        RXCore.markUpFreePen(true);
                      }
                    }, 10);
                  } catch (e) {
                    console.error('Error finalizing freehand stroke:', e);
                  }
                }, 5);
              }
            };

            // Add both listeners with pointer events for better touch support
            viewportElement.addEventListener(
              'pointerdown',
              this.freehandMouseDownListener
            );
            viewportElement.addEventListener(
              'pointerup',
              this.freehandMouseUpListener
            );
            viewportElement.addEventListener(
              'pointerleave',
              this.freehandMouseUpListener
            );

            this.freehandListenerAdded = true;
          }
        } else {
          RXCore.selectMarkUp(true);
        }
        break;

      case 'PAINT_TEXT_HIGHLIGHTING':
        RXCore.textSelect(this.isActionSelected[actionName]);
        break;

      case 'PAINT_POLYLINE':
        RXCore.markUpPolyline(this.isActionSelected[actionName]);
        break;

      case 'STAMP':
        break;

      case 'SCALE_SETTING':
        this.service.setMeasurePanelState({
          visible: this.isActionSelected[actionName],
        });
        break;

      case 'IMAGES_LIBRARY':
        this.service.setImagePanelState({
          visible: this.isActionSelected[actionName],
        });
        break;
      case 'LINKS_LIBRARY':
        this.service.setLinksPanelState({
          visible: this.isActionSelected[actionName],
        });
        break;
      case 'SYMBOLS_LIBRARY':
        this.service.setSymbolPanelState({
          visible: this.isActionSelected[actionName],
        });
        break;

      /*case 'CALIBRATE':
          //RXCore.calibrate(true);
          this.calibrate(true);
          break;*/

      case 'MEASURE_CONTINUOUS':
        RXCore.markupAddMulti(this.isActionSelected[actionName]);
        break;

      case 'MEASURE_LENGTH':
        //MeasureDetailPanelComponent
        this.service.setMeasurePanelDetailState({
          visible: this.isActionSelected[actionName],
          type: MARKUP_TYPES.MEASURE.LENGTH.type,
          created: true,
        });
        //this.annotationToolsService.setMeasurePanelState({ visible: true });
        //this.service.setPropertiesPanelState({ visible: this.isActionSelected[actionName], markup: MARKUP_TYPES.MEASURE.LENGTH,  readonly: false });
        RXCore.markUpDimension(this.isActionSelected[actionName], 0);
        break;

      case 'MEASURE_AREA':
        this.service.setMeasurePanelDetailState({
          visible: this.isActionSelected[actionName],
          type: MARKUP_TYPES.MEASURE.AREA.type,
          created: true,
        });
        //this.service.setPropertiesPanelState({ visible: this.isActionSelected[actionName], markup: MARKUP_TYPES.MEASURE.AREA, readonly: false });
        RXCore.markUpArea(this.isActionSelected[actionName]);
        break;

      case 'MEASURE_PATH':
        this.service.setMeasurePanelDetailState({
          visible: this.isActionSelected[actionName],
          type: MARKUP_TYPES.MEASURE.PATH.type,
          created: true,
        });
        //this.service.setPropertiesPanelState({ visible: this.isActionSelected[actionName], markup:  MARKUP_TYPES.MEASURE.PATH, readonly: false });
        RXCore.markupMeasurePath(this.isActionSelected[actionName]);
        //RXCore.changeSnapState(this.isActionSelected[actionName]); //turn snap on here,.

        break;

      case 'MEASURE_ARC':
        //this.service.setMeasurePanelDetailState({ visible: this.isActionSelected[actionName], type:  MARKUP_TYPES.MEASURE.ANGLECLOCKWISE.type, created: true });
        //this.service.setPropertiesPanelState({ visible: this.isActionSelected[actionName], markup:  MARKUP_TYPES.MEASURE.PATH, readonly: false });
        RXCore.measureArc(this.isActionSelected[actionName]);
        break;

      case 'MEASURE_ANGLE_CCLOCKWISE':
        this.service.setMeasurePanelDetailState({
          visible: this.isActionSelected[actionName],
          type: MARKUP_TYPES.MEASURE.ANGLECCLOCKWISE.type,
          created: true,
        });
        //this.service.setPropertiesPanelState({ visible: this.isActionSelected[actionName], markup:  MARKUP_TYPES.MEASURE.PATH, readonly: false });
        RXCore.markupAngle(this.isActionSelected[actionName], true);
        break;

      case 'MEASURE_RECTANGULAR_AREA':
        this.service.setMeasurePanelDetailState({
          visible: this.isActionSelected[actionName],
          type: MARKUP_TYPES.SHAPE.RECTANGLE.type,
          created: true,
        });
        RXCore.markupAreaRect(this.isActionSelected[actionName]);
        break;
      case 'SNAP':
        RXCore.changeSnapState(this.isActionSelected[actionName]);
        break;
      case 'COUNT':
        if (!this.isActionSelected[actionName]) {
          RXCore.markupCount(this.isActionSelected[actionName]);
        }
        break;
      case 'MARKUP_LOCK':
        RXCore.lockMarkup(this.isActionSelected[actionName]);
        break;

      case 'NO_SCALE':
        RXCore.useNoScale(this.isActionSelected[actionName]);
        RXCore.markUpRedraw();
        break;
    }
  }

  onPaintClick(): void {
    if (this.isActionSelected['PAINT_FREEHAND']) {
      this.onActionSelect('PAINT_FREEHAND');
    }
  }

  onAction(undo: boolean) {
    // Save current tool state before undo/redo
    const currentFreehand = this.isActionSelected['PAINT_FREEHAND'];

    // Reset any in-progress drawing state
    this.isDrawing = false;

    // Perform undo or redo
    if (undo) {
      console.log('Performing undo operation');
      RXCore.markUpUndo();
    } else {
      // For redo operations, we need a special approach to ensure proper sequencing
      console.log('Performing enhanced redo operation');

      try {
        // Temporarily disable all tool selections to prevent interference
        const previousToolState = { ...this.isActionSelected };
        this._deselectAllActions();

        // First step: Force any selection to be cleared
        RXCore.unSelectAllMarkup();

        // Second step: Perform the redo operation
        RXCore.markUpRedo();

        // Third step: Add a forced reset and reload of the markup state
        setTimeout(() => {
          // Force redraw of all elements with current properties
          RXCore.markUpRedraw();

          // Select all markups to force property refresh
          RXCore.selectMarkUp(true);

          // Reset state to ensure properties are applied correctly
          RXCore.restoreDefault();

          // Redraw again to show everything properly
          setTimeout(() => {
            RXCore.unSelectAllMarkup();
            RXCore.markUpRedraw();

            // Restore the previous tool state
            Object.keys(previousToolState).forEach((key) => {
              if (previousToolState[key] === true) {
                // Skip certain tools that shouldn't be reactivated
                if (!['SNAP', 'MARKUP_LOCK', 'NO_SCALE'].includes(key)) {
                  this.isActionSelected[key] = true;

                  // If it was a freehand tool, reactivate it
                  if (key === 'PAINT_FREEHAND') {
                    RXCore.markUpFreePen(true);
                  }
                }
              }
            });
          }, 50);
        }, 50);
      } catch (error) {
        console.error('Error during redo operation:', error);
        // Fallback to standard redo if enhanced approach fails
        RXCore.markUpRedo();
        RXCore.markUpRedraw();
      }
    }

    // Don't restore freehand separately since we're handling it in the tool state restoration
    if (undo && currentFreehand) {
      // Small delay to ensure undo completes
      setTimeout(() => {
        console.log('Restoring freehand tool after undo');
        this.isActionSelected['PAINT_FREEHAND'] = true;
        RXCore.markUpFreePen(true);
      }, 100);
    }
  }
  /*calibrate(selected) {

    RXCore.onGuiCalibratediag(onCalibrateFinished);

    let rxCoreSvc = this.rxCoreService;

    function onCalibrateFinished(data) {
      console.log("data app", data);
        //$rootScope.$broadcast(RXCORE_EVENTS.CALIBRATE_FINISHED, data);
        rxCoreSvc.setCalibrateFinished(true, data)
    }

    RXCore.calibrate(selected);
  }*/

  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.freehandMouseUpListener || this.freehandMouseDownListener) {
      const viewportElement =
        document.querySelector('.viewer-viewport') || document.body;

      if (this.freehandMouseDownListener) {
        viewportElement.removeEventListener(
          'pointerdown',
          this.freehandMouseDownListener
        );
      }

      if (this.freehandMouseUpListener) {
        viewportElement.removeEventListener(
          'pointerup',
          this.freehandMouseUpListener
        );
        viewportElement.removeEventListener(
          'pointerleave',
          this.freehandMouseUpListener
        );
      }
    }
  }
}
