# Verification — salmon and tiramisu reconstruction

- Pure two-section proof: /design-reference-test/. No header, navigation, search or icons. Uses original Dolce salmon and tiramisu photographs.
- Equal-width reference comparison: /design-comparison.html. Both panels are 390 px wide. Saved browser capture: reference-pair-comparison.jpg. Proof capture: salmon-tiramisu-proof-390.jpg.
- Photography now uses explicit source rectangles prepared by tools/prepare_print.py. Dark upper background is largely excluded. The source JPEGs are untouched. Brightness +3.5%, saturation -3%; no generated pixels or substitute food.
- Full menu uses print.css and the rebuilt renderer. Cream background extends across the viewport. Each category uses a single text column; pasta names are no longer scattered below the photograph. Ten food items use five selected photographs; seven drinks use two photographs.
- Full captures: dolce-print-menu-390.jpg, dolce-print-drinks-390.jpg, dolce-print-menu-desktop.jpg.
- Both groups checked at 360, 390, 430, 768, 1280 px: no document or dish-name horizontal overflow.
- Search for فستق returns the correct item; detail modal shows 9517.webp and matching title. Close works. Salad category returns one matching item. Browser error log empty.
- JavaScript syntax checks pass. Local static HTTP preview returns 200; no build step required.
- Differences from reference: actual restaurant dishes and camera angles differ. Arabic plus English names and grouped lists require taller areas than the five single-item English reference. No unverified prices are displayed.
