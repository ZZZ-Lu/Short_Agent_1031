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

fs.writeFileSync('src/components/ProjectScriptBible.tsx', code, 'utf-8');
console.log('Patch script executed successfully');
