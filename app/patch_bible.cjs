const fs = require('fs');
let code = fs.readFileSync('src/components/ProjectScriptBible.tsx', 'utf-8');

// 1. Update Tab 2 asset container
code = code.replace(
  /<div\s+onScroll=\{\(\) => setAssetContextMenu\(null\)\}\s+className="flex-1 overflow-y-auto p-3 space-y-3"\s*>/,
  `<div\n                ref={assetListContainerRef}\n                onScroll={() => setAssetContextMenu(null)}\n                onMouseDown={(e) => handleContainerMouseDown(e, assetListContainerRef)}\n                className="flex-1 overflow-y-auto p-3 space-y-3 relative"\n              >\n                {boxSelection && boxSelection.isDragging && (\n                  <div\n                    className="absolute pointer-events-none z-50 bg-blue-500/15 border border-blue-500/50 rounded-lg"\n                    style={{\n                      left: Math.min(boxSelection.startX, boxSelection.currentX),\n                      top: Math.min(boxSelection.startY, boxSelection.currentY),\n                      width: Math.abs(boxSelection.currentX - boxSelection.startX),\n                      height: Math.abs(boxSelection.currentY - boxSelection.startY),\n                    }}\n                  />\n                )}`
);

// 2. Update side panel asset container
code = code.replace(
  /<div\s+ref=\{sidePanelContentRef\}\s+data-agent-target=\{[^}]+\}\s+onScroll=\{handleSidePanelScroll\}\s+style=\{\{ overflowAnchor: 'none' \}\}\s+className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0"\s*>/,
  `<div\n                ref={sidePanelContentRef}\n                data-agent-target={visualDock.sidePanel === 'assets' ? 'assets.panel' : visualDock.sidePanel === 'universe' ? 'universe.panel' : 'cards.panel'}\n                onScroll={handleSidePanelScroll}\n                onMouseDown={(e) => handleContainerMouseDown(e, sidePanelContentRef)}\n                style={{ overflowAnchor: 'none' }}\n                className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 relative"\n              >\n                {boxSelection && boxSelection.isDragging && (\n                  <div\n                    className="absolute pointer-events-none z-50 bg-blue-500/15 border border-blue-500/50 rounded-lg"\n                    style={{\n                      left: Math.min(boxSelection.startX, boxSelection.currentX),\n                      top: Math.min(boxSelection.startY, boxSelection.currentY),\n                      width: Math.abs(boxSelection.currentX - boxSelection.startX),\n                      height: Math.abs(boxSelection.currentY - boxSelection.startY),\n                    }}\n                  />\n                )}`
);

// 3. Replace multi-select onClick and add data-asset-id across character, location, prop rows (both Tab 2 and side panel)
// Character main
code = code.replace(
  /data-asset-item="true"\s+data-asset-version="false"\s+data-agent-target=\{([^}]+)\}\s+data-selection-border-mode=\{([^}]+)\}\s+onClick=\{\(e\)\s*=>\s*\{[^}]+\}\}\s+onContextMenu/g,
  `data-asset-item="true"\n                              data-asset-version="false"\n                              data-asset-id={char.id}\n                              data-agent-target={$1}\n                              data-selection-border-mode={$2}\n                              onClick={(e) => handleAssetRowClick(char.id, 'character', char, e)}\n                              onContextMenu`
);

// Character version
code = code.replace(
  /data-asset-item="true"\s+data-asset-version="true"\s+data-agent-target=\{([^}]+)\}\s+data-selection-border-mode=\{([^}]+)\}\s+onClick=\{\(e\)\s*=>\s*\{[^}]+\}\}\s+onContextMenu/g,
  `data-asset-item="true"\n                                      data-asset-version="true"\n                                      data-asset-id={ver.id}\n                                      data-agent-target={$1}\n                                      data-selection-border-mode={$2}\n                                      onClick={(e) => handleAssetRowClick(ver.id, 'character', ver, e, false, char.name)}\n                                      onContextMenu`
);

// Location main
code = code.replace(
  /data-asset-item="true"\s+data-asset-version="false"\s+data-agent-target=\{([^}]+)\}\s+data-selection-border-mode=\{([^}]+)\}\s+onClick=\{\(e\)\s*=>\s*\{[^}]+\}\}\s+onContextMenu/g,
  `data-asset-item="true"\n                                data-asset-version="false"\n                                data-asset-id={loc.id}\n                                data-agent-target={$1}\n                                data-selection-border-mode={$2}\n                                onClick={(e) => handleAssetRowClick(loc.id, 'location', loc, e)}\n                                onContextMenu`
);

// Location version
code = code.replace(
  /data-asset-item="true"\s+data-asset-version="true"\s+data-agent-target=\{([^}]+)\}\s+data-selection-border-mode=\{([^}]+)\}\s+onClick=\{\(e\)\s*=>\s*\{[^}]+\}\}\s+onContextMenu/g,
  `data-asset-item="true"\n                                        data-asset-version="true"\n                                        data-asset-id={ver.id}\n                                        data-agent-target={$1}\n                                        data-selection-border-mode={$2}\n                                        onClick={(e) => handleAssetRowClick(ver.id, 'location', ver, e, false, loc.name)}\n                                        onContextMenu`
);

// Prop main
code = code.replace(
  /data-asset-item="true"\s+data-asset-version="false"\s+data-agent-target=\{([^}]+)\}\s+data-selection-border-mode=\{([^}]+)\}\s+onClick=\{\(e\)\s*=>\s*\{[^}]+\}\}\s+onContextMenu/g,
  `data-asset-item="true"\n                                data-asset-version="false"\n                                data-asset-id={prop.id}\n                                data-agent-target={$1}\n                                data-selection-border-mode={$2}\n                                onClick={(e) => handleAssetRowClick(prop.id, 'prop', prop, e)}\n                                onContextMenu`
);

// Prop version
code = code.replace(
  /data-asset-item="true"\s+data-asset-version="true"\s+data-agent-target=\{([^}]+)\}\s+data-selection-border-mode=\{([^}]+)\}\s+onClick=\{\(e\)\s*=>\s*\{[^}]+\}\}\s+onContextMenu/g,
  `data-asset-item="true"\n                                        data-asset-version="true"\n                                        data-asset-id={ver.id}\n                                        data-agent-target={$1}\n                                        data-selection-border-mode={$2}\n                                        onClick={(e) => handleAssetRowClick(ver.id, 'prop', ver, e, false, prop.name)}\n                                        onContextMenu`
);

// 4. Clean up multi-select ternary block inside main asset rows: replace {isMultiSelectMode ? (...) : (...)} with the non-multi-select icon div
// We can replace chunks like:
// {isMultiSelectMode ? (...) : (<div className="text-blue-500 ...">...</div>)}
// Let's do regex replacement for the left icon container wrapper.

fs.writeFileSync('src/components/ProjectScriptBible.tsx', code, 'utf-8');
console.log('Patch script executed successfully');
