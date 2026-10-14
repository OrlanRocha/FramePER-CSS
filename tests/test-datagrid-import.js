/**
 * Test Suite para FramePER.DataGrid Import Integration (loadDataset & importFile)
 * Execução: node tests/test-datagrid-import.js
 */

const assert = require('assert');

// Mock DOM Environment
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
    this.parentNode = null;
  }
  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, val) { this.attributes[name] = String(val); }
  removeAttribute(name) { delete this.attributes[name]; }
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  insertBefore(newNode, refNode) {
    const idx = this.children.indexOf(refNode);
    if (idx !== -1) {
      this.children.splice(idx, 0, newNode);
    } else {
      this.children.push(newNode);
    }
    newNode.parentNode = this;
    return newNode;
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
global.window.removeEventListener = () => {};
global.window.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail || {};
  }
};
global.CustomEvent = global.window.CustomEvent;
global.document = {
  createElement: (tag) => new MockDOMElement(tag),
  body: new MockDOMElement('body'),
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null
};

const FramePER = require('../src/js/framePER.js');
const DataGrid = FramePER.DataGrid;
const Converter = FramePER.Converter;

console.log('🧪 Iniciando Testes de Importação no DataGrid (loadDataset & importFile)...');

assert(DataGrid, 'FramePER.DataGrid deve estar definido');
assert(Converter, 'FramePER.Converter deve estar definido');

// Helper para instanciar DataGrid
function createTestGrid() {
  const container = new MockDOMElement('div');
  container.setAttribute('data-searchable', 'true');
  container.setAttribute('data-exportable', 'true');
  container.setAttribute('data-importable', 'true');

  const initialData = [
    { id: 1, nome: 'Ana', cargo: 'Dev' },
    { id: 2, nome: 'Beto', cargo: 'Design' }
  ];

  return FramePER.DataGrid.create(container, {
    data: initialData,
    columns: [
      { key: 'id', title: 'ID' },
      { key: 'nome', title: 'Nome' },
      { key: 'cargo', title: 'Cargo' }
    ]
  });
}

// --- Teste 1: grid.loadDataset no modo replace ---
console.log('▶ Teste 1: grid.loadDataset(dataset, { mode: "replace" })');
const grid1 = createTestGrid();
assert.strictEqual(grid1.allData.length, 2);

const newDataset = {
  title: 'Produtos Novos',
  headers: ['Codigo', 'Descricao', 'Preco'],
  rows: [
    ['PRD-01', 'Teclado', 250.0],
    ['PRD-02', 'Mouse', 120.0],
    ['PRD-03', 'Monitor', 1100.0]
  ]
};

let eventFired = false;
let eventDetail = null;
grid1.container.addEventListener('frameper:datagrid:import', (e) => {
  eventFired = true;
  eventDetail = e.detail;
});

grid1.loadDataset(newDataset);

assert.strictEqual(grid1.allData.length, 3, 'Deve substituir todos os registros');
assert.strictEqual(grid1.columns.length, 3, 'Deve substituir as colunas');
assert.strictEqual(grid1.columns[0].key, 'Codigo');
assert.strictEqual(grid1.columns[1].key, 'Descricao');
assert.strictEqual(grid1.columns[2].key, 'Preco');
assert.strictEqual(grid1.allData[0].Codigo, 'PRD-01');
assert.strictEqual(grid1.allData[0].Descricao, 'Teclado');
assert.strictEqual(grid1.allData[2].Descricao, 'Monitor');
assert.strictEqual(grid1.currentPage, 1);
assert.strictEqual(eventFired, true, 'Deve disparar evento frameper:datagrid:import');
assert.strictEqual(eventDetail.count, 3);
assert.strictEqual(eventDetail.mode, 'replace');
console.log('  ✓ Passou');

// --- Teste 2: grid.loadDataset no modo append ---
console.log('▶ Teste 2: grid.loadDataset(dataset, { mode: "append" })');
const grid2 = createTestGrid();
assert.strictEqual(grid2.allData.length, 2);

const appendDataset = {
  headers: ['ID', 'Nome', 'Cargo'],
  rows: [
    [3, 'Carla', 'Tech Lead'],
    [4, 'Diego', 'Product Manager']
  ]
};

grid2.loadDataset(appendDataset, { mode: 'append' });
assert.strictEqual(grid2.allData.length, 4, 'Deve conter 2 registros originais + 2 anexados');
assert.strictEqual(grid2.allData[0].nome, 'Ana');
assert.strictEqual(grid2.allData[2].Nome || grid2.allData[2].nome, 'Carla');
console.log('  ✓ Passou');

// --- Teste 3: grid.importFile com mock de arquivo ---
console.log('▶ Teste 3: grid.importFile(file) assíncrono');
(async () => {
  const grid3 = createTestGrid();

  // Mock de objeto File CSV
  const csvContent = 'SKU,Item,Valor\r\nA100,Cadeira,450\r\nA200,Mesa,890';
  const mockFile = {
    name: 'catalogo.csv',
    size: csvContent.length,
    type: 'text/csv',
    text: async () => csvContent
  };

  const imported = await grid3.importFile(mockFile, { notify: false, confetti: false });
  assert(imported, 'importFile deve retornar o dataset importado');
  assert.strictEqual(grid3.allData.length, 2, 'Grid deve ter 2 registros carregados do arquivo');
  assert.strictEqual(grid3.columns[0].key, 'SKU');
  assert.strictEqual(grid3.allData[0].Item, 'Cadeira');
  assert.strictEqual(grid3.allData[1].Valor, 890);

  console.log('  ✓ Passou');
  console.log('\n🎉 TODOS OS TESTES DE IMPORTAÇÃO DO DATAGRID PASSARAM COM SUCESSO!\n');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
