const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Testando Sistema de Designers de Paginação FramePER ---');

// 1. Verificar SCSS de Paginação
const scssPath = path.join(__dirname, '..', 'src', 'scss', 'components', '_pagination.scss');
assert(fs.existsSync(scssPath), '_pagination.scss deve existir');
const scssContent = fs.readFileSync(scssPath, 'utf8');

const requiredClasses = [
  'pagination',
  'page-link',
  'pagination-primary',
  'pagination-pills',
  'pagination-bordered',
  'pagination-ghost',
  'pagination-dots',
  'pagination-sm',
  'pagination-lg',
  'pager',
  'pagination-bar'
];

requiredClasses.forEach(cls => {
  assert(scssContent.includes(cls), `_pagination.scss deve definir a classe ou variante '${cls}'`);
});
console.log('✔ Todas as variantes SCSS de paginação estão definidas no código-fonte.');

// 2. Verificar CSS Compilado
const distCssPath = path.join(__dirname, '..', 'dist', 'framePER.css');
assert(fs.existsSync(distCssPath), 'dist/framePER.css deve existir');
const distCss = fs.readFileSync(distCssPath, 'utf8');

['pagination-primary', 'pagination-pills', 'pagination-bordered', 'pagination-ghost', 'pagination-bar', 'pager'].forEach(cls => {
  assert(distCss.includes(cls), `dist/framePER.css deve conter a classe compilada '${cls}'`);
});
console.log('✔ Todas as classes foram compiladas com sucesso para dist/framePER.css.');

// 3. Verificar Vitrine em demo/components.html
const compHtmlPath = path.join(__dirname, '..', 'demo', 'components.html');
const compHtml = fs.readFileSync(compHtmlPath, 'utf8');
assert(compHtml.includes('id="sec-pagination"'), 'demo/components.html deve conter a seção id="sec-pagination"');
assert(compHtml.includes('href="#sec-pagination"'), 'demo/components.html deve conter o link no docs-nav');
assert(compHtml.includes('pagination-primary'), 'demo/components.html deve demonstrar pagination-primary');
assert(compHtml.includes('pagination-pills'), 'demo/components.html deve demonstrar pagination-pills');
assert(compHtml.includes('pagination-bordered'), 'demo/components.html deve demonstrar pagination-bordered');
assert(compHtml.includes('pagination-dots'), 'demo/components.html deve demonstrar pagination-dots');
assert(compHtml.includes('pagination-bar'), 'demo/components.html deve demonstrar pagination-bar');
console.log('✔ Seção completa de paginação documentada com exemplos ao vivo em demo/components.html.');

// 4. Verificar Aplicação no Dashboard (demo/users.html e demo/reports.html)
const usersHtml = fs.readFileSync(path.join(__dirname, '..', 'demo', 'users.html'), 'utf8');
assert(usersHtml.includes('class="pagination-bar"'), 'demo/users.html deve utilizar .pagination-bar');
assert(usersHtml.includes('pagination-primary'), 'demo/users.html deve utilizar .pagination-primary');

const reportsHtml = fs.readFileSync(path.join(__dirname, '..', 'demo', 'reports.html'), 'utf8');
assert(reportsHtml.includes('class="pagination-bar"'), 'demo/reports.html deve utilizar .pagination-bar');
assert(reportsHtml.includes('pagination-primary'), 'demo/reports.html deve utilizar .pagination-primary');
console.log('✔ Rodapés de tabelas do Dashboard atualizados com o componente .pagination-bar.');

console.log('----------------------------------------------------');
console.log('🎉 TODOS OS TESTES DE PAGINAÇÃO PASSARAM COM SUCESSO!');
