# Dessert menu standby
The 2026-11-06 archive contains the exact approved cartoon cake menu after Arabic spelling corrections: full PDF, published WebP, layout generator, fonts, illustration atlas, original classic menu, and website reference files. SHA256.json verifies every file.
Current site intentionally hides cakes and the CLASSICS heading until stock is available.
To restore later: extract the archive into a temporary folder, restore the full PDF and dessert WebP, switch only the dessert image/preload in dist/index.html to dessert-menu-approved-v2.webp with width 2160 and height 6540, and update the service worker cache version and image entry. Preserve unrelated site changes. Commit and push to main for automatic Vercel deployment.
