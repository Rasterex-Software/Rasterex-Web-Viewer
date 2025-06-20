June 20, 2025
# 1. Keep original file name uploaded
# 2. Keep custom stamp, images even if moving to Standard\
# 3. Implement drag and drop of qr code
Updated and new files
src/app/components/annotation-tools/stamp-panel/stamp-panel.component.html
src/app/components/annotation-tools/stamp-panel/stamp-panel.component.scss
src/app/components/annotation-tools/stamp-panel/stamp-panel.component.ts
src/app/components/annotation-tools/stamp-panel/StampData.ts
src/app/components/annotation-tools/qr-code-library/qr-code-library.component.html
src/app/components/annotation-tools/qr-code-library/qr-code-library.component.scss
src\app\app.module.ts

June 18, 2025
# 1. Add QR Code Generation Logic
Updated and new files
src/app/app.module.ts
src/app/components/annotation-tools/annotation-tools.component.html
src/app/components/annotation-tools/annotation-tools.component.ts
src/app/components/annotation-tools/annotation-tools.service.ts
src/app/components/annotation-tools/qr-code-library/qr-code-library.component.html
src/app/components/annotation-tools/qr-code-library/qr-code-library.component.scss
src/app/components/annotation-tools/qr-code-library/qr-code-library.component.spec.ts
src/app/components/annotation-tools/qr-code-library/qr-code-library.component.ts
src/app/components/annotation-tools/qr-code-library/qr-code-library.service.ts

June 16, 2025
# 1. Integrate Symbols API
Updated and new files
src\app\components\annotation-tools\symbols-library\symbols-library.component.html
src\app\components\annotation-tools\symbols-library\symbols-library.component.ts
src\app\components\annotation-tools\symbols-library\symbols-library.service.ts

June 16, 2025

### 1. Updated Foxit to new version 10.
### 2. New method used for zoom to point for PDF.
### 3. Fixed snap to point for rotated PDF files.
### 3. Fixed snap to point for rotated PDF files.
### 4. Removed automatic load of bookmarks for PDF this are now loaded on demand.
### 5. Quick action menu for annoations are no longer loaded for non-owning users.


Updated and new files

RxCore version is now 35.926

src\assets\scripts\rxcorefunctions.js
src\assets\scripts\iframefoxit.js
src\assets\html\foxpage.html

tsconfig.app.json
src\rxcore\index.ts

src\assets\vendors\foxit\web\*.*

src\app\components\side-nav-menu\pages\pages.component.ts
src\app\components\side-nav-menu\pages\pages.component.html
src\app\components\annotation-tools\annotation-tools.component.ts



June 13, 2025
# 1. Update symbols to remove upload, delete and just list via localstorage
Updated and new files
src/app/components/annotation-tools/symbols-library/symbols-library.component.html
src/app/components/annotation-tools/symbols-library/symbols-library.component.scss
src/app/components/annotation-tools/symbols-library/symbols-library.component.ts

Jun 10, 2025
### 1. Implement Folder Creation in Symbols and manage symbols based on folders
Updated and new files
src/app/components/annotation-tools/symbols-library/symbols-library.component.html
src/app/components/annotation-tools/symbols-library/symbols-library.component.scss
src/app/components/annotation-tools/symbols-library/symbols-library.component.ts

June 3, 2025
### 1. Implement Upload Custom Stamp and Uploaded Images to Backend DB

Updated and new files
src/app/components/annotation-tools/stamp-panel/stamp-panel.component.html
src/app/components/annotation-tools/stamp-panel/stamp-panel.component.
src/app/components/annotation-tools/stamp-panel/stamp-panel.component.ts

May 30, 2025

### 1. Restructured annoation context menu component. Number of buttons and button states are now set in new method.

Updated and new files

src\app\components\annotation-tools\quick-actions-menu\quick-actions-menu.component.html
src\app\components\annotation-tools\quick-actions-menu\quick-actions-menu.component.ts



May 26, 2025

### 1. New measure tool Arc.

Updated and new files

RxCore version is now 35.924.
src\assets\scripts\rxcorefunctions.js


src\app\components\annotation-tools\annotation-tools.component.html
src\app\components\annotation-tools\annotation-tools.component.ts
src\app\components\annotation-tools\annotation-shape-icon\annotation-shape-icon.component.html

src\app\components\annotation-tools\quick-actions-menu\quick-actions-menu.component.ts
src\app\components\annotation-tools\quick-actions-menu\quick-actions-menu.component.html
src\app\components\annotation-tools\properties-panel\properties-panel.component.ts
src\app\components\annotation-tools\note-panel\note-panel.component.ts

src\rxcore\index.ts
src\rxcore\constants\index.ts


May 23, 2025

### 1. Some fixes to text annotation input element.
### 2. Some fixes to Annotation context menu.
### 3. Some fixes to Annotation context menu.

### 4. Resolve issue with close and pin actions causing duplicate pinned tabs 

### 5. Fixed an issue with Annotation comment list JSON input/ouput.


### 6.Fixed an issue in the comparison popup where users could mistakenly select the same file as both base and comparison file causing UI confusion.
### 7. Disabled the "Compare" option in the burger menu when a 3D file is opened, aligning with feature restrictions.
### 8. Updated the "Compare Document" popup to exclude unsupported 3D files from the dropdown for better user clarity.
### 9. Introduced a reusable file category service with a centralized enum and helper methods to streamline type-based operations.
### 10. Resolved issue where the Grayscale slider tool in the comparison window did not toggle correctly when switching between normal and comparison views. Also added the missing tooltip for better user guidance.
### 11. Resolved issue where comparison window's toolbar being shown on other windows even if comparison window closed or not active. streamline the behavior aviour of comparison window's toolbar to only appear in compare mode

### 12. Solved issue with comment panel overlapping the annotation and measurement toolbars.


Updated and new files

RxCore version is now 35.923.
src\assets\scripts\rxcorefunctions.js

src\app\components\compare\create-comparison\create-comparison.component.ts
src\app\components\compare\top-nav-menu\top-nav-menu.component.ts
src\app\components\compare\top-nav-menu\top-nav-menu.component.html
src\app\services\file-category.service.ts
src\app\shared\enums\file-category.ts 
src\app\components\bottom-toolbar\bottom-toolbar.component.html

src\app\components\top-nav-menu\opened-files-tabs\opened-files-tabs.component.scss src\app\components\top-nav-menu\opened-files-tabs\opened-files-tabs.component.ts

src\app\components\annotation-tools\quick-actions-menu\quick-actions-menu.component.ts

src\app\components\annotation-tools\context-editor\context-editor.component.ts
src\app\components\annotation-tools\context-editor\context-editor.component.html
src\app\components\annotation-tools\context-editor\context-editor.component.scss

src\app\components\annotation-tools\note-panel\note-panel.component.scss



May 22, 2025

### 1. Added insert and delete point functionality for all multi-point annotations (polyline, polygon, counter, and measurement path)
### 2. Added move label for area measurement.
### 3. Added move to front/back for annotations.
### 4. Added spinner to file load.
### 5. Corrections to text annoation html text area input.


### 6. Display open file tabs in dropdown list
### 7. Correctly update checkString after page toggle in multiSelect mode
### 8. Add pinned files section next to dropdown list


### 9. fixed issue with paginator, added possibility to rotate icon on top-nav-menu when closed from side-nav-menu, reset selected pages when switch from multiselect to single


### 10. Improved Annotation & Measurement - refined the visual styling of note elements for a more elegant appearance, “Show/Hide All” toggle.
### 11. Added support for displaying images (imgSrc) alongside dropdown options
### 12. Introduced an author icon to visually represent the user/creator



Updated and new files

RxCore version is now 35.922.

/src/app/components/bottom-toolbar.html
/src/app/components/bottom-toolbar.scss 
/src/app/components/side-nav-menu/pages.ts 
/src/app/components/side-nav-menu.ts 
/src/app/components/top-nav-menu.html 
/src/app/components/top-nav-menu.ts 
/src/app/components/top-nav-menu.service.ts

src\app\components\top-nav-menu\opened-files-tabs\opened-files-tabs.component.html 
src\app\components\top-nav-menu\opened-files-tabs\opened-files-tabs.component.scss 
src\app\components\top-nav-menu\opened-files-tabs\opened-files-tabs.component.ts 
src\app\components\top-nav-menu\opened-files-tabs\is-pinned.pipe.ts
src\app\components\side-nav-menu\pages\pages.component.ts


src\assets\scripts\rxcorefunctions.js

src/app/components/annotation-tools/quick-actions-menu/quick-actions-menu.component.html
src/app/components/annotation-tools/quick-actions-menu/quick-actions-menu.component.ts
src\app\components\bottom-toolbar\bottom-toolbar.component.ts
src\app\components\bottom-toolbar\bottom-toolbar.component.html
src\app\components\file-galery\file-galery.component.html
src\app\components\file-galery\file-galery.component.scss

src\app\components\annotation-tools\context-editor\context-editor.component.ts
src\app\components\annotation-tools\context-editor\context-editor.component.scss
src\app\components\annotation-tools\context-editor\context-editor.component.html


src/assets/images/remove-point.svg
src\rxcore\index.ts

src/app/components/annotation-tools/note-panel/note-panel.component.ts
src/app/components/annotation-tools/note-panel/note-panel.component.html
src/app/components/annotation-tools/note-panel/note-panel.component.scss
src/app/components/commont/dropdown/dropdown.component.html
src/app/components/commont/dropdown/dropdown.component.scss
src/assets/images/author-icon.svg



May 20, 2025


### 1. Added a draggable resize handle for the left pages panel.
### 2. Align rotation button icon with applied rotation.
### 3. Rename and refactor NumericRangeDirective.

### 1. Improved dateFormat config (src\assets\config\UIConfig.js), added dateTimeWithSeconds format under properties-panel
### 2. Correction to annotation / measurement menu, fixed multipple trigger guiConfig, fixed swicher state


### 3. Improved UI design of the File Gallery with enhanced styling, background shadow, and bordered tiles for a more realistic look.
### 4. Removed repeated static "PDF Reader powered by Foxit" lines and ensured it appears only once per tab for consistency.
### 5. Fixed modal layout issues to prevent UI elements from overflowing outside the modal boundaries.
### 6. Added placeholder generic thumbnails for selectable demo files, and organized them in a dedicated images/thumbnails/ folder.
### 7. Refined the layout of the Recent Documents tab to ensure visual consistency and alignment with neighboring tiles.

### 8. Added Fills to Create Custom Stamp Modal so that It can be 3sections and added edit button to enable edit of custom stamp(Need to dig into more for IndexDB)

Updated and new files

RxCore version is now 35.921.

src\assets\config\UIConfig.js
src/rxcore/models/IGuiDateFormat.ts
src/rxcore/models/IMarkup.ts
src/app/components/annotation-tools/properties-panel/properties-panel.component.ts
src/app/components/annotation-tools/note-panel/note-panel.component.ts
src/app/components/annotation-tools/note-panel/note-panel.component.html
src/app/components/top-nav-menu/top-nav-menu.component.ts

src\app\components\common\modal-dialog\modal-dialog.component.scss
src\app\components\common\file-galery\file-galery.component.html
src\app\components\common\file-galery\file-galery.component.scss
src\app\components\common\recent-files\recent-files.component.scss

src\assets\images\thumbnails\3d-thumbnail.png
src\assets\images\thumbnails\cad-thumbnail.png
src\assets\images\thumbnails\documents-thumbnail.png
src\assets\images\thumbnails\image-thumbnail.png
src\assets\images\thumbnails\plotter-thumbnail.png

src\app\app.module.ts
src\app\components\side-nav-menu\context-menu\context-menu.component.scss
src\app\components\side-nav-menu\pages\pages.component.html
src\app\components\side-nav-menu\pages\pages.component.scss
src\app\components\side-nav-menu\side-nav-menu.component.html
src\app\components\side-nav-menu\side-nav-menu.component.scss
src\app\components\bottom-toolbar\bottom-toolbar.component.html
src\app\directives\resizable.directive.ts
src\app\directives\numeric-range.directive.ts

src/app/components/annotation-tools/stamp-panel/stamp-panel.component.html
src/app/components/annotation-tools/stamp-panel/stamp-panel.component.ts
src/assets/images/edit-ico.svg




May 16, 2025

### 1. Implemented locked aspect ratio for image type annoations.
### 2. Correction to drag and drop image aspect ratio.
### 3. Modification to time and date now got from src\assets\config\UIConfig.js.
### 4. Links in link dialog can now be deleted.


RxCore version is now 35.92.

Updated and new files

src\rxcore\models\IGuiDateFormat.ts
src\assets\config\UIConfig.js
src\rxcore\models\IGuiConfig.ts
src\rxcore\models\IMarkup.ts
src\assets\scripts\rxcorefunctions.js
src\app\app.module.ts
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.html
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.scss
src\app\components\top-nav-menu\top-nav-menu.component.ts
src\app\components\top-nav-menu\top-nav-menu.component.scss
src\app\components\top-nav-menu\top-nav-menu.component.html
src\app\components\side-nav-menu\pages\numeric-range.directive.ts
src\app\components\side-nav-menu\pages\pages.component.html
src\app\components\side-nav-menu\pages\pages.component.scss
src\app\components\side-nav-menu\pages\pages.component.ts
src\app\components\common\date-picker\date-picker.component.ts
src\app\components\annotation-tools\note-panel\note-panel.component.ts
src\app\components\annotation-tools\note-panel\note-panel.component.html
src\app\components\annotation-tools\links-library\links-library.component.html
src\app\components\annotation-tools\links-library\links-library.component.scss
src\app\components\annotation-tools\links-library\links-library.component.ts



May 15, 2025

### 1. Minor changes and corrections to hamburger menu.

Updated and new files

src\app\components\top-nav-menu\top-nav-menu.component.html
src\app\components\top-nav-menu\top-nav-menu.component.scss
src\app\components\top-nav-menu\top-nav-menu.component.ts
src\assets\scripts\rxconfig.js
src\assets\config\UIConfig.js




May 14, 2025

### 1. Fixed a problem with drawing display when having PDF and other formats open at the same time.


RxCore version is now 35.9.

Updated and new files

src\assets\scripts\rxcorefunctions.js


May 9, 2025

### 1. When the block has attributes, add the "(Attribute yes)" mark under the block name in the tooltip.


RxCore version is now 35.89.

Updated and new files

src\assets\scripts\rxcorefunctions.js

src\rxcore\index.ts
src\app\app.component.ts
src\app\components\annotation-tools\note-panel\note-panel.component.ts
src\app\components\bottom-toolbar\bottom-toolbar.component.ts
src\app\components\side-nav-menu\blocks\blocks.component.html
src\app\components\side-nav-menu\blocks\blocks.component.ts
src\app\services\rxcore.service.ts



May 5, 2025

### 1. Fixed vector and block selection related bugs.
### 2. When "showAnnotationsOnLoad" is true, Measurement and Annotation main filters are disabled.
### 3. When performing scroll zoom, comment list leade line and annotation context menu is hidden.
### 4. Fixed filter by type in comment list.
### 5. Annotation and measurement types should now be correctly filtered and counted in comment list.
### 6. Introduced scroll to method for comment list for annotations not currently in view when the list is long.
### 7. Removed filter by Author duplication for comment list and fixed the display of annotation when filtering by author.
### 8. Fixed annotation cotext menu placement depending on placement on page.
### 9. Fixed annotation cotext menu placement depending on page rotation.
### 10. Corrected incorrect use of css in foxpage.html that resulted in page divider section not being displayed.
### 11. Added context menu support for new measure type angle.
### 12. Added comment list icon for new measure type angle.
### 13. All shape annotation and measurement types should now be restricted to page using max,min rectangle calculation.
### 14. Free pen should now be restricted to page.


RxCore version is now 35.88.

Updated and new files

src\assets\scripts\rxcorefunctions.js

src\app\app.component.html
src\app\app.component.ts
src\app\components\annotation-tools.component.ts
src\app\components\annotation-tools\annotation-shape-icon\annotation-shape-icon.component.html
src\app\components\annotation-tools\context-editor\context-editor.component.ts
src\app\components\annotation-tools\measure-panel\measure-panel.component.ts
src\app\components\annotation-tools\note-panel\note-panel.component.html
src\app\components\annotation-tools\note-panel\note-panel.component.ts
src\app\components\annotation-tools\properties-panel\properties-panel.component.ts
src\app\components\annotation-tools\quick-actions-menu\quick-actions-menu.component.ts
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.html
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.ts
src\app\components\bottom-toolbar\bottom-toolbar.component.ts
src\app\components\bottom-toolbar\bottom-toolbar.service.ts
src\app\components\side-nav-menu\blocks\blocks.component.ts
src\app\components\tooltip\tooltip.component.scss
src\app\components\tooltip\tooltip.component.ts
src\app\helpers\color.helper.ts
src\app\services\rxcore.service.ts
src\assets\html\foxpage.html
src\app\components\file-galery\file-galery.component.ts
src\rxcore\index.ts
src\rxcore\constants\index.ts




April 21, 2025

### 1. Refined entity and block tooltip styles.
### 2. Added angle measurement.

RxCore version is now 35.87.

Updated and new files

src\app\app.component.html
src\app\app.component.ts
src\app\app.module.ts
src\app\components\annotation-tools.component.html
src\app\components\annotation-tools.component.ts
src\app\components\bottom-toolbar\bottom-toolbar.component.html
src\app\components\bottom-toolbar\bottom-toolbar.component.ts
src\app\components\common\panel\panel.component.scss
src\app\components\side-nav-menu\blocks\blocks.component.ts

src\app\components\tooltip\tooltip.component.ts
src\app\components\tooltip\tooltip.component.html
src\app\components\tooltip\tooltip.component.scss
src\app\components\tooltip\tooltip.service.ts

src\assets\images\vector-information.svg
src\assets\scripts\rxcorefunctions.js
src\rxcore\index.ts
src\rxcore\constants\index.ts


April 8, 2025

### 1. Refined entity and block tooltip styles.
### 2. Various fixes for PDF rendering and handling.

RxCore version is now 35.85

Updated files
src\styles.scss
src\assets\scripts\rxcorefunctions.js
src\assets\scripts\iframefoxit.js
src\assets\html\foxpage.html
src\app\app.component.ts
src\app\components\side-nav-menu\blocks\blocks.component.ts
src\app\components\side-nav-menu\blocks\blocks.component.scss


March 28, 2025

### 1. Added Length to callback for vector entity on hover.

RxCore version is now 35.82

src\assets\scripts\rxcorefunctions.js
src\app\app.component.ts


March 27, 2025

### 1. Some modifications to vector and blocks feature

RxCore version is now 35.81

src\assets\scripts\rxcorefunctions.js
src\app\app.component.ts
src\rxcore\index.ts
src\app\components\side-nav-menu\blocks\blocks.component.html
src\app\components\side-nav-menu\blocks\blocks.component.ts


March 22, 2025

### 1. Some symbols and stamps dialog corrections.

src\app\components\annotation-tools\symbols-library\symbols-library.component.html
src\app\components\annotation-tools\symbols-library\symbols-library.component.scss
src\app\components\annotation-tools\symbols-library\symbols-library.component.ts
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.html


March 21, 2025

### 1. Fixes for collaboration close tab
### 2. Fixes for Symbol component
### 3. Fixes for Watermark


src\app\app.component.ts
src\assets\scripts\rxcorefunctions.js
src\assets\scripts\iframefoxit.js
src\app\components\user\login\login.component.ts
src\app\components\top-nav-menu\opened-files-tabs\opened-files-tabs.component.ts
src\app\components\annotation-tools\symbols-library\symbols-library.component.ts
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.ts
src\app\components\collab\room-panel.component.ts


March 17, 2025

### 1. Fixed the bug that svg stamp become blur when zoom in.
### 2. Fixed symbol aspect ratio.
### 3. Adjusted room panel style a bit.

Modified files
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.html
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.ts
src\app\components\annotation-tools\symbols-library\symbols-library.component.html
src\app\components\annotation-tools\symbols-library\symbols-library.component.ts
src\assets\scripts\rxcorefunctions.js

March 14, 2025

### 1. Fix thumbnail refresh when watermark

Modified file src\app\components\top-nav-menu\top-nav-menu.component.ts


March 12, 2025

### 1. Optimized code and merged the common logic for backend storage and synchronization of Annotations.
### 2. Fixed the problems of failed storage and synchronization of Stamp and Symbol.
### 3. Fixed the aspect ratio and deletion issues of Symbol.
### 4. Fixed a bug that room participants don't refresh when switch doc.

RxCore version is now 35.79

Modified files
src\rxcore\index.ts
src\app\app.component.ts
src\assets\scripts\rxcorefunctions.js 
src\app\components\collab\room-panel.component.ts
src\app\components\annotation-tools\symbols-library\symbols-library.component.ts
src\app\components\top-nav-menu\top-nav-menu.component.ts
src\app\components\user\user.service.ts
src\assets\scripts\rxcorefunctions.js


March 11, 2025

### 1. Implemented Real-time Collaboration. Enable login user to join a room for each doc.
### 2. Added room panel to list participants.
### 3. Enabled a user to join more than one rooms.
### 4. Enabled admin to add/delete standard stamps
### 5. Stored images into IndexedDB

Modified files
src\app\app.component.ts
src\app\app.module.ts
src\app\components\annotation-tools\annotation-tools.component.html
src\app\components\annotation-tools\stamp-panel\StampData.ts
src\app\components\annotation-tools\stamp-panel\stamp-library.service.ts
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.html
src\app\components\annotation-tools\stamp-panel\stamp-panel.component.ts
src\app\components\annotation-tools\stamp-panel\stamp-storage.service.ts
src\app\components\annotation-tools\stamp-panel\stamp-templates.ts
src\app\components\annotation-tools\symbols-library\symbols-library.component.html
src\app\components\collab\room-panel.component.html
src\app\components\collab\room-panel.component.ts
src\app\components\top-nav-menu\top-nav-menu.component.html
src\app\components\top-nav-menu\top-nav-menu.component.ts
src\app\components\user\user.service.ts
src\app\services\collab.service.ts


March 10, 2025

### 1. Added watermark functionality (addWatermarkToPage, addWatermarkToAllPages and removeWatermarkFromAllPages)

RxCore version is now 35.78

Modified files 
src\assets\scripts\rxcorefunctions.js 
src\assets\scripts\iframefoxit.js 
src\app\components\top-nav-menu\top-nav-menu.component.html 
src\app\components\top-nav-menu\top-nav-menu.component.ts 
src\app\components\top-nav-menu\top-nav-menu.component.scss 
src\rxcore\index.ts


March 9, 2025

### 1. Add annotation storage service.
### 2. Store annotations to bakcend db.

RxCore version is now 35.77.

Modified files
src\assets\scripts\rxcorefunctions.js
src\app\app.component.ts
src\app\components\user\login\login.component.ts
src\app\components\user\user.service.ts
src\app\services\annotation-storage.service.ts


March 4, 2025

### 1. Added block select and marking for rotated page.
### 2. Changed to new development server on https://test.rasterex.com

RxCore version is now 35.76.

Modified files
src\assets\scripts\rxconfig.js
src\assets\scripts\rxcorefunctions.js
src\rxcore\index.ts
src\app\components\side-nav-menu\blocks\blocks.component.ts


February 27, 2025 

### 1. Added new image sub types returned by markup.getMarkupType(), RxCore.getMarkupTypes() and RxCore.getMarkupType(type, subtype)

RxCore version is now 35.75.

Modified files
src\assets\scripts\rxcorefunctions.js
src\app\components\side-nav-menu\pages\pages.component.ts


February 24, 2025 

### 1. Updated block list with new thin scrollbar.

RxCore version is now 35.74.
Web viewer version is now 12.1.0.5.

Modified files
src\assets\scripts\rxcorefunctions.js
src\rxcore\index.ts
src\app\components\side-nav-menu\blocks\blocks.component.ts
src\app\components\side-nav-menu\blocks\blocks.component.html
src\app\components\side-nav-menu\blocks\blocks.component.scss



February 19, 2025

### 1. Refine block panel, block info and search panel

Modified files
src\assets\scripts\rxcorefunctions.js
src\rxcore\index.ts
src\app\components\side-nav-menu\blocks\blocks.component.ts
src\app\components\side-nav-menu\blocks\blocks.component.html
src\app\components\side-nav-menu\blocks\blocks.component.scss
src\app\components\side-nav-menu\side-nav-menu.component.html
src\app\components\side-nav-menu\side-nav-menu.component.ts


February 14, 2025

### 1. Fixed issues for machines using non 1:1 screen resolution
   ### - Drop of image or stamp on pdf page page extent calculation issue.
   ### - Scaling of annotation on pdf page page extent calculation issue.
### 2. Fixed a problem with annotations being selected when swithcing user allowed annotation to be moved by non owning user.
### 3. Selection of annotation with negative widht or height now works.
### 4. RxCore.GUI_2DEntityInfoScreen and RxCore.GUI_2DEntityInfo callbacks now return whole block object instead of only the name.
### 5. Moved login to new position after logo.
### 6. Re-introduced signature panel should be hidden for now using "canSignature": false, in UIConfig.js.


Modified files
src\assets\scripts\rxcorefunctions.js
src\app\components\user\login\login.component.scss
src\app\app.component.ts
src\app\components\top-nav-menu\top-nav-menu.component.ts
src\app\components\signature\signature.component.ts
src\app\components\side-nav-menu\side-nav-menu.component.ts


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
