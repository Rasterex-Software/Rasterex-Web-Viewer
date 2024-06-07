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
