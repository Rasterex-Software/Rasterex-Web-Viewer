February 12, 2025

### 1. Implement block info and search panel

Modified files
src\app\components\side-nav-menu\blocks\blocks.component.ts
src\app\components\side-nav-menu\blocks\blocks.component.html

February 7, 2025

### 1. Fixed page range rotation problem.

Modified files
src\app\components\side-nav-menu\pages\pages.component.ts


February 6, 2025

### 1. Fixed page range selection instability.
### 2. Fixed thumbnail refresh issue.
### 2. Page search in thumbnails panel now also update the page in main view.

Modified files
src\assets\scripts\iframefoxit.js
src\app\components\side-nav-menu\pages\pages.component.ts



February 3, 2025

### 1. Fixed a bug that date in stamp doesn't update properly.
### 2. When creating a stamp with username, dynamically replace with display username if a user logged in.

Modified files
src\app\components\annotation-tools\stamp-panel\stamp-template.directive.ts


January 31, 2025

### 1. Minor fixes for annotation move and scale.
### 2. Fixed login/logout logic to corretly restore default user.
### 3. Fixed collaboration handling of text box annoations.
### 4. Updated package.json with added socket.io support.
### 5. RxCore version is now 35.61.

Modified files
src\assets\scripts\rxcorefunctions.js
src\app\app.component.ts
src\app\services\collab.service.ts
src\app\helpers\color.helper.ts


January 28, 2025
### 1. Back-end URL now stored in rxconfig.js.
### 2. Added support for new Rx2B format.
### 3. RxCore verison is now 35.6. (Require updated server side components).
### 4. Minor fixes for custom stamps.
### 5. Added drop down for built in demo users in login dialog.


January 26, 2025

### 1. Added document collaboration page, which contains two viewers that opens the same document.
### 2. Implemented real time collaboration between the two viewers.
### 3. Added new GUIConfig setting canCollaborate, when true, real time collaboration will be enabled.
### 4. Fixed collaboration annotation create duplication problem.


Modfied files
src\app\app.component.ts
src\app\services\collab.service.ts
src\document-collaboration.html

January 25, 2025

### 1. Implemented new stamp panel with 3 tabs, Standard, Custom and UploadImage.
### 2. Added around 11 pre-defined stamps.
### 3. Implemented customized stamps and uploading an image as a stamp.
### 4. Enable stamps to be saved ti indexeddb.
### 5. Fixed stamp drag/drop problem.

Component Path: `src\app\components\annotation-tools\stamp-panel`



January 21, 2025

### 1. Added new GUIConfig setting showAnnotationsOnLoad, when false no annotations are displayed until the display is turned on using the comment list switches or selecting either the annotation or measure menu.
### 2. Fixed 3D sliders for cross section, transparency and explode.
### 3. Fixed a problem with unstable annoation display state that turned off all annotation when clicking in the drawing.
### 4. UI version is now 12.1.0.4.
### 5. RxCore version is now 35.5.
### 6. Image stamps are now type 11 subtype 12.


Modfied files
src\app\app.component.ts
src\app\components\annotation-tools\annotation-shape-icon\annotation-shape-icon.component.html
src\app\components\annotation-tools\note-panel\note-panel.component.html
src\app\components\annotation-tools\note-panel\note-panel.component.ts
src\app\components\annotation-tools\stamp-panel\stamp-template.directive.ts
src\app\components\bottom-toolbar\bottom-toolbar.component.ts
src\assets\config\UIConfig.js
src\assets\scripts\rxcorefunctions.js
src\rxcore\constants\index.ts
src\rxcore\models\IGuiConfig.ts
src\rxcore\index.ts


January 15, 2025

### 1. Comment list and top menu switch now has connected logic to show/hide annotations and measurement respectively.
### 2. Minor adjustments to comment list UI.
### 3. Hide annoations button removed as this is now done from comment list.


January 14, 2025

### 1. Thumbnails for all formats will now rotate with the page rotation in the viewer
### 2. Annotations are now (again) drawn on thumbnails for all file formats.
### 3. Annotations are now correctly drawn when the thumbnail is rotated.
### 4. Comment list pointer line should now work for annoations on rotated pages.
### 5. UI elements that has no effect when no files are open are now hidden on startup.
### 6. UI elements open should now be hidden, when the last file is closed.
### 7. Signature switch is removed from comment list.
### 8. Comment list filter should now reflect the annoations loaded with the current document.

Changes RxCore 
### 1. New method on markup object getrotatedPoint(x,y). Used for calculating comment pointer line on rotated pages.

Changes to iframefoxit.js
                        
### 1. this.getBirdsEye //modiefied to handle rotated PDF page.

January 6, 2025

### 1. Added new switches in comment list to replace Annotate/measure switch on top toolbar.
### 2. Fixed a problem where wrong user was shown when adding a comment reply to an annotation.

December 17, 2024

### 1. Annotate/measure switch can now be turned off using a setting in UIConfig.js
### 2. Markup zoom button for each annotation item in the annotation list can now be turned off using a setting in UIConfig.js
### 3. Minor corrections to comment list update and state functionality.


December 11, 2024

### 1. Merged new measurement/annotation switch functionality.
### 2. Removed non functioning use of title on annotation object.
### 3. this is version 12.1.0.2



December 10, 2024

### 1. Merged new login code with permission settings.'
### 2. Added continuous measure mode button.
### 3. Added new configuration object src\assets\config\UIConfig.js that allow UI behaviour changes without recompiling.

Settings are then moved from src\assets\config\config.json to the new src\assets\config\UIConfig.js
"canLogin" : true,
"convertPDFAnnots" : true,

### 4. this is version 12.1.0.1


December 3, 2024

### 1. Fixed fill problem for rectangular measurement.
### 2. Zoom out is no longer limited to viewspace size.
### 3. Zoom in/out is now default for single page PDF files. Used to be vertical scroll.
### 4.Added button for comment list items to zoom to an annotation.
### 5.Added upload/export support for locally modified PDF files.

### 6. Added support for login, this require a woriking database back-end.
### 7. Added support for converting PDF annotations to Rasterex annotations.

These settings need to be turned on in src\assets\config\config.json

"canLogin" : true,
"convertPDFAnnots" : true,

November 15, 2024

### 1. Introduced versioning for UI project this is version 12.0.0.8. Value in src\app\app.component.ts uiversion
### 2. Updated src\rxstyles.scss with background color setting for 3D canvas to prevent visibility of other open files.


November 12, 2024

### 1. Consolidation update.
### 2. Thumbnails was not generated for all pages, fixed.
### 3. Configuration updated to support setting user name on startup.
### 4. Minified RxCore now reinstated as default RxCore in project.
### 5. Introduced versioning for UI project this is version 12.0.0.7. Value in src\app\app.component.ts uiversion : string = '12.0.0.7'


October 1, 2024

# 1. Comment Status Menu

Component Paths:
`src\app\app.module.t`
`src\app\components\annotation-tools\comment-status-icon\comment-status-icon.component.html`
`src\app\components\annotation-tools\comment-status-icon\comment-status-icon.component.scss`
`src\app\components\annotation-tools\comment-status-icon\comment-status-icon.component.spec.ts`
`src\app\components\annotation-tools\comment-status-icon\comment-status-icon.component.ts`
`src\app\components\annotation-tools\note-panel\note-panel-component.html`
`src\app\components\annotation-tools\note-panel\note-panel.component.scss`
`src\app\components\annotation-tools\note-panel\note-panel.component.ts`
`src\assets\scripts\rxcorefunctions.js`
`src\rxcore\constants\index.ts`

# 2. Separate annotate objects and measure objects

Component Path:
`src\app\components\top-nav-menu\top-nav-menu.component.ts`
`src\app\components\annotation-tools\note-panel\note-panel.component.ts`


September 30, 2024

# 1. Code merge for panel and menu states.

September 27, 2024

# 1. Code merge of fixed comment list to make it stay open when switching between files.

Component Paths: `src\app\components\annotation-tools\note-panel\note-panel.component.ts`
                 `src\app\components\annotation-tools\annotation-tools.component.ts`

# 2. Fixed issue with canvas scaling on startup not working correctly.

Component Paths: `src\app\app.component.ts`


September 26, 2024

# 1. Code merge of fixed comment list with corrected comment reply listing.

Component Paths: `src\app\components\annotation-tools\note-panel\note-panel.component.html`
                 `src\assets\scripts\rxcorefunctions.js`


September 20, 2024

# 1. Code merge of new Text search and PDF page manipulation functions.
# 2. Code merge of new stamps, symbols and images functionality.
# 3. Fixed JavaScript printed only first page problem.
# 4. Fixed problem with thumbnails for other formats than PDF not working.
# 5. Fixed problem with undo redo restoring annoation with correct page number property.

# 6. Added new sort functions for comment list.

Component Paths: `src\app\components\annotation-tools\note-panel\note-panel.component.ts`
                 `src\assets\scripts\rxcorefunctions.js`

# 7. Added new download PDF method to download PDF modified in client.


July 07, 2024

# 1. Added rx-search-panel component

Component Path: `components/annotation-tools/search-panel`

# 2. Modified the annotation-tools.service.ts

### Added searchPanelState to control the visibility of the search-panel.

# 3. Modified Top Nav Menu

### Added a button to the Top Nav Menu template.

### Added two functions: `onCommentPanelSelect` and `onSearchPanelSelect` to control visibility.

# 4. Modified app template

### Added rx-search-panel to the template.

### Imported a pipe from `components/annotation-tools/search-panel` to highlight the search text.

# 5. Modified RxCore & rxcorefunctions.js

### Created functions:

- `documentTextSearch`
- `markupDocumentSearchResult`
- `markupTextWithOrange`
- `onGuiDocumentSearch`
