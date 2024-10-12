#!/bin/bash

# Path to the file to update
file_path="node_modules/ng2-pdf-viewer/src/app/pdf-viewer/pdf-viewer.component.d.ts"

# Check if the file exists
if [ -f "$file_path" ]; then
  # Read the file content into an array
  mapfile -t lines < "$file_path"
  
  # Get the index of the last line
  last_index=$((${#lines[@]} - 2))
  closing_braces_index=$((${#lines[@]} - 1))
  echo ${lines[$last_index]}
  # Check if the last line contains the expected content
  if [[ ${lines[$last_index]} == *"ɵɵComponentDeclaration"* ]]; then
    # Remove the last line
   unset lines[$closing_braces_index]   
   unset lines[$last_index]
	 
    
    # Add the new line
      lines+=('    static ɵcmp: i0.ɵɵComponentDeclaration<PdfViewerComponent, "pdf-viewer", never, { "src": "src"; "cMapsUrl": "c-maps-url"; "page": "page"; "renderText": "render-text"; "renderTextMode": "render-text-mode"; "originalSize": "original-size"; "showAll": "show-all"; "stickToPage": "stick-to-page"; "zoom": "zoom"; "zoomScale": "zoom-scale"; "rotation": "rotation"; "externalLinkTarget": "external-link-target"; "autoresize": "autoresize"; "fitToPage": "fit-to-page"; "showBorders": "show-borders"; }, { "afterLoadComplete": "after-load-complete"; "pageRendered": "page-rendered"; "pageInitialized": "pages-initialized"; "textLayerRendered": "text-layer-rendered"; "onError": "error"; "onProgress": "on-progress"; "pageChange": "pageChange"; }, never, never>;')
      lines+=('}');
    
    
    # Write the updated content back to the file
    printf "%s\n" "${lines[@]}" > "$file_path"
    
    #echo "File updated successfully."
  else
    echo "Last line does not contain the expected content. Skipping update."
  fi
else
  echo "File not found: $file_path"
fi
