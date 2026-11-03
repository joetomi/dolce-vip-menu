// Names follow the supplied printed menu. See CONTENT_REVIEW.md for uncertain matches.
const categories=[['main','الأطباق الرئيسية','MAIN COURSES','food'],['pasta','الباستا','PASTA','food'],['salad','السلطات','SALADS','food'],['dessert','الحلويات والبرانش','DESSERTS & BRUNCH','food']].concat(beverageCategories);
const items=[
['9507','ضلع بقري','Beef Rib','main'],['9508','سلمون بالزعفران','Saffron Salmon','main'],['9509','صدر دجاج بالزبدة','Butter Chicken Breast','main'],
['9515','باستا دجاج بالصوص الأبيض','Chicken Pasta · White Sauce','pasta'],['9516','باستا دجاج بالصوص الأحمر','Chicken Pasta · Red Sauce','pasta'],['9517','باستا بيستو الفستق بوراتا','Pistachio Pesto Burrata','pasta'],
['9576','سلطة بوراتا','Burrata Salad','salad'],['9573','تيراميسو إيطالي كلاسيكي','Classic Italian Tiramisu','dessert'],['9574','فرنش توست','French Toast','dessert'],['9575','أرض الشوكولاتة','Chocolate Earth','dessert']
].map(([id,name,en,category])=>({id,name,en,category,price:null,description:id==='9507'?'ضلع بقري على العظم، مع هريس ناعم وتشكيلة من الخضار.':null})).concat(beverageItems);
const featuredId='9507';
