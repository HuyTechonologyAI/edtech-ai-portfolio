const fs = require('fs');
let txt = fs.readFileSync('src/app/admincenter/page.tsx', 'utf8');

// The file might contain a broken character that looks like double quote
txt = txt.replace(/Đ\"ng/g, 'Động');
txt = txt.replace(/Đ\"ng/g, 'Động');
txt = txt.replace(/Từ Ch i/g, 'Từ Chối');

fs.writeFileSync('src/app/admincenter/page.tsx', txt, 'utf8');
console.log('Fixed syntax errors');
