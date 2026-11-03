# Approved menu and drawer navigation

- Promoted the individual-dish design and straight Andalusian corner work into the main route. Previous experimental/preview URLs redirect to it.
- Top-left fixed hamburger opens a native modal dialog styled with the same paper, olive rules, fonts and corner ornaments. Ten real dish links are grouped under food categories; no drinks.
- Selecting a link closes the drawer, releases page scroll, updates the fragment and instantly scrolls to/focuses its matching article. All photos reserve their intrinsic aspect ratio so lazy loading cannot change target positions.
- Browser tested first and last links: dish-9507 reaches the top with 16 px spacing; dish-9575 is fully visible at the bottom of the document. Both close the drawer and restore scroll. Close button and Escape verified.
- Widths 360, 390, 430, 768 and 1280: drawer fits the viewport and no document horizontal overflow. Browser error log empty. JavaScript syntax check passes.
- Screenshots: approved-menu-toggle-390.jpg and approved-menu-drawer-390.jpg.

## Typography and motion refinement

- Main dish labels increased from 18 to 19.5 px on phones (27 to 28.5 px on larger screens); contrast strengthened. Chef label remains slightly larger as the featured dish.
- Sidebar item links all share 19.5 px, weight 400, the same color, no border and no underline. Section titles all share 22 px and a single rule beneath; larger spacing and a restrained olive tint distinguish groups.
- One toggle button moves into the dialog top layer during opening. Its three strokes transition into a cross, then return on closing; no duplicate static close icon. Drawer surface slides in over 320 ms with a fading backdrop. Reduced-motion preferences disable transitions.
- Observed intermediate transform matrices during opening and final +/-45 degree strokes afterward. Closing, Escape, rapid reversal and immediate dish navigation verified. Page scroll is restored, toggle returns to body, target dish receives focus.
- Larger labels checked at 360, 390, 430, 768, 1280 px: no document or text overflow.
- Latest captures: menu-clearer-type-390.jpg and menu-refined-drawer-390.jpg.

## Brand and chef arrival sequence

- Large original Dolce logo now heads an independent arrival area; MENU moved below that entire area and before the regular categories.
- Arrival minimum height is one small viewport height. At 390 x 844 the menu starts at document y=844, after the centered chef presentation. Logo width is about 226 px; MENU text width about 103 px.
- Chef selection remains the first dish, centered and larger than regular rows. Dedicated olive oval, fine outline, separate اختيار الشيف label and centered Andalusian name panel distinguish it. The featured dish still appears only once.
- Checked widths 360, 390, 430, 768, 1280: ten dishes, no horizontal overflow, photo center aligns with content center. Existing instant sidebar navigation to a regular item still closes the drawer and places its target at about 16 px from the top.
- Browser error log empty; JavaScript syntax passes. Captures: dolce-chef-intro-390.jpg, dolce-chef-intro-flow-390.jpg, dolce-chef-intro-desktop.jpg.

## Borderless drawer control

- Hamburger and animated X now have zero border, transparent background and no box shadow.
- Drawer content begins beneath the control: verified 17 px clearance at 360/390 px and 20 px at 1280 px. Removed the outer drawer frame/corner strokes for a simpler panel; section-title rules remain.
- No horizontal overflow at checked widths. Animated close still completes normally.
- Capture: menu-borderless-drawer-390.jpg. Stylesheet URL bumped to v4 for remote preview refreshes.
