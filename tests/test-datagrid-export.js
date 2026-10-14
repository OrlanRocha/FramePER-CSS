/**
 * Test Suite para FramePER.DataGrid + FramePER.Converter Export Integration
 * Execução: node tests/test-datagrid-export.js
 */

const assert = require('assert');

// Mock browser environment for Node.js
class MockDOMElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.attributes = {};
    this.children = [];
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c)
    };
    this.style = {};
    this.innerHTML = '';
    this.textContent = '';
    this.listeners = {};
  }
  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, val) { this.attributes[name] = String(val); }
  removeAttribute(name) { delete this.attributes[name]; }
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  remove() {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) this.parentNode.children.splice(idx, 1);
    }
  }
  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  removeEventListener(event, handler) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }
  }
  dispatchEvent(event) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(h => h(event));
    }
    return true;
  }
  querySelector(sel) {
    if (sel.includes('input')) return new MockDOMElement('input');
    if (sel.includes('select')) return new MockDOMElement('select');
    return new MockDOMElement('div');
  }
  querySelectorAll(sel) { return []; }
  closest(sel) { return null; }
}

global.window = global;
global.window.innerWidth = 1024;
global.window.innerHeight = 768;
global.window.addEventListener = () => {};
global.document = {
  createElement: (tag) => new MockDOMElement(tag),
  body: new MockDOMElement('body'),
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null
};
global.CustomEvent = class CustomEvent {
  constructor(type, params = {}) {
    this.type = type;
    this.detail = params.detail || null;
    this.bubbles = Boolean(params.bubbles);
  }
};

const FramePER = require('../src/js/framePER.js');

console.log('🧪 Iniciando Testes de Exportação do DataGrid com FramePER.Converter...');

assert(FramePER.DataGrid, 'FramePER.DataGrid deve existir');
assert(FramePER.Converter, 'FramePER.Converter deve existir');

// Dados de exemplo
const sampleData = [
  { id: 1, nome: 'Ana Costa', cargo: 'Dev Fullstack', salario: 12000 },
  { id: 2, nome: 'Bruno Lima', cargo: 'Tech Lead', salario: 15500 },
  { id: 3, nome: 'Carla Dias', cargo: 'Product Owner', salario: 14000 }
];

const container = new MockDOMElement('div');
container.setAttribute('data-title', 'Colaboradores Teste');

const grid = FramePER.DataGrid.create(container, {
  data: sampleData,
  exportable: true,
  selectable: true
});

assert(grid, 'Instância do DataGrid deve ser criada com sucesso');

// Teste 1: toDataset()
console.log('▶ Teste 1: grid.toDataset()');
assert(typeof grid.toDataset === 'function', 'grid.toDataset deve ser uma função');
const ds = grid.toDataset();
assert.strictEqual(ds.title, 'Colaboradores Teste', 'Título incorreto');
assert.deepStrictEqual(ds.headers, ['Id', 'Nome', 'Cargo', 'Salario'], 'Headers incorretos');
assert.strictEqual(ds.rows.length, 3, 'Deve conter 3 linhas');
assert.strictEqual(ds.rows[0][1], 'Ana Costa');
console.log('  ✓ Passou');

// Teste 2: toDataset(true) com linhas selecionadas
console.log('▶ Teste 2: grid.toDataset(true) com seleção de linhas');
grid.selectedIds = new Set(['row-2']); // Seleciona Bruno Lima
const dsSelected = grid.toDataset(true);
assert.strictEqual(dsSelected.rows.length, 1, 'Deve exportar apenas a linha selecionada');
assert.strictEqual(dsSelected.rows[0][1], 'Bruno Lima');
console.log('  ✓ Passou');

// Teste 3: grid.export('csv')
console.log('▶ Teste 3: grid.export("csv")');
let exportedEvent = null;
container.addEventListener('frameper:datagrid:export', (e) => {
  exportedEvent = e.detail;
});

const resCSV = grid.export('csv', { download: false });
assert(resCSV && resCSV.content, 'Deve retornar resultado de conversão CSV');
assert(resCSV.content.includes('Ana Costa'), 'Conteúdo CSV deve ter Ana Costa');
assert(resCSV.content.includes('\uFEFF'), 'CSV deve ter BOM UTF-8');
assert(exportedEvent, 'Deve disparar evento frameper:datagrid:export');
assert.strictEqual(exportedEvent.format, 'csv');
assert.strictEqual(exportedEvent.count, 3);
console.log('  ✓ Passou');

// Teste 4: grid.export('json')
console.log('▶ Teste 4: grid.export("json")');
const resJSON = grid.export('json', { download: false });
assert(resJSON && resJSON.content, 'Deve retornar resultado JSON');
const parsed = JSON.parse(resJSON.content);
assert.strictEqual(parsed.length, 3);
assert.strictEqual(parsed[0].Nome, 'Ana Costa');
console.log('  ✓ Passou');

// Teste 5: grid.exportXLSX() e grid.exportPDF()
console.log('▶ Teste 5: grid.exportXLSX() e grid.exportPDF()');
assert(typeof grid.exportXLSX === 'function', 'grid.exportXLSX deve existir');
assert(typeof grid.exportPDF === 'function', 'grid.exportPDF deve existir');

const resXLSX = grid.exportXLSX('teste.xlsx', { download: false, asBuffer: true });
assert(resXLSX && (resXLSX.content || resXLSX.blob), 'Deve gerar conteúdo XLSX');

const resPDF = grid.exportPDF('teste.pdf', { download: false, asBuffer: true });
assert(resPDF && (resPDF.content || resPDF.blob), 'Deve gerar conteúdo PDF');
console.log('  ✓ Passou');

console.log('\n🎉 TODOS OS TESTES DE EXPORTAÇÃO DO DATAGRID PASSARAM COM SUCESSO!\n');
