# Dolce VIP — المنيو المعتمد

التشغيل من جذر المشروع:

    python -m http.server 8080 --bind 0.0.0.0 --directory dist

المعاينة: http://localhost:8080/

- dist/index.html: المنيو المعتمد وزر القائمة الجانبية أعلى اليسار.
- dist/menu/menu.js: عرض 17 طبقًا ومشروبًا بصورها وأسمائها، وقائمة جانبية وشريط أقسام ثابت ينتقلان بسلاسة إلى الاختيار. أبعاد الصور محفوظة لتثبيت مواقع الأقسام أثناء التحميل.
- dist/menu/menu.css: الإطارات المستقيمة والزوايا الأندلسية والفواصل، وتنسيق القائمة الجانبية.
- dist/menu/corner.svg وsection-rule.svg: زخارف متجهية بسيطة باللون الزيتوني.
- dist/floating-preview/preview.css: الخلفية الورقية والصور العائمة الأساسية.
- dist/data.js: البيانات الأصلية؛ الأسعار غير المؤكدة null. المشروبات ظاهرة ضمن الموهيتو والمشروبات الباردة.
- dist/assets/floating: خلفية Dolce المعتمدة وصور أصلية مشتقة بشفافية حقيقية.
- qa/approved-menu-navigation.md: نتائج تحقق التنقل وأسماء اللقطات.

المساران السابقان /menu-experiment/ و/floating-preview/ يحوّلان إلى المنيو المعتمد. الأصول الأصلية داخل items وlogo محفوظة، ولا توجد صور طعام مولدة أو أسعار مخترعة. العضوية والإدارة وPWA والربط بالكاشير مراحل لاحقة. الاستضافة ثابتة والمسارات نسبية لتناسب GitHub Pages.

Web delivery images: dist/assets/web. Optimized WebP with transparent cutouts, responsive 480px variants, a lossless logo and preloaded chef photo/background. Original assets retained. Full-size image total: 1,227,433 → 712,694 bytes (42% smaller). Background: 236,202 → 37,926 bytes. Rebuild with tools/optimize_web_images.py. Measurements: qa/image-optimization.json.

## Current menu navigation

The menu now shows one of four independent pages: main dishes (including pasta and the chef selection), starters (the supplied salad), desserts, and drinks. The main page opens by default. The category bar stays sticky; switching pages fades the current content out and the selected content in, with instant changes for reduced-motion preferences and no automatic scroll. Direct dish links reveal their page and beverage category before scrolling. The brand introduction contains the single English word Savour in Allura. Styles: dist/menu/book.css. The desktop tunnel shortcut remains unchanged.
