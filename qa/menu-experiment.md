# Menu experiment — individual dishes and Andalusian corners

- Trial only: /menu-experiment/. Approved routes / and /floating-preview/ are unchanged.
- Every food item has its matching original transparent image and its own name panel. Ten dishes, no drinks, chef selection appears once.
- Replaced wavy name outlines with straight olive borders and small geometric Andalusian corner ornaments. Category separators also use straight rules and a small geometric center ornament.
- Added six transparent derivatives from existing non-generative cutouts. French toast ceramic rim was retained using a source-pixel oval mask combined with the segmentation mask; source JPEGs remain untouched.
- Browser widths 360, 390, 430, 768, 1280 checked: all ten image alt labels match their dish heading; no horizontal document/text overflow. Browser error log empty.
- Captures: menu-experiment-andalusian-390.jpg (full page), menu-experiment-andalusian-detail.jpg (first three dish units).
- Await user acceptance before copying the trial into the approved menu.

Approved by the user. The live implementation is now dist/index.html with dist/menu/menu.css and menu.js; /menu-experiment/ redirects to it.
