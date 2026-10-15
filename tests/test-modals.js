/**
 * Test Suite para FramePER.Modal e Variantes de Modal
 * Execução: node tests/test-modals.js
 */

const assert = require('assert');

// Mock DOM para ambiente Node.js
class MockClassList {
  constructor() {
    this._classes = new Set();
  }
  add(...classes) {
    classes.forEach(c => this._classes.add(c));
  }
  remove(...classes) {
    classes.forEach(c => this._classes.delete(c));
  }
  toggle(c, force) {
    if (typeof force !== 'undefined') {
      if (force) { this._classes.add(c); return true; }
      else { this._classes.delete(c); return false; }
    }
    if (this._classes.has(c)) {
      this._classes.delete(c);
      return false;
    } else {
      this._classes.add(c);
      return true;
    }
  }
  contains(c) {
    return this._classes.has(c);
  }
  toString() {
    return Array.from(this._classes).join(' ');
  }
}

class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.attributes = {};
    this.dataset = {};
    this.classList = new MockClassList();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.listeners = {};
    this.id = '';
  }

  getAttribute(name) {
    if (name === 'id') return this.id || null;
    return this.attributes[name] || null;
  }

  setAttribute(name, val) {
    if (name === 'id') this.id = String(val);
    this.attributes[name] = String(val);
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this.dataset[key] = String(val);
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      delete this.dataset[key];
    }
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
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
    event.target = this;
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(h => h(event));
    }
    return true;
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (matchesSelector(curr, selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  querySelector(selector) {
    return querySelectorAll(this, selector)[0] || null;
  }

  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }
}

function matchesSelector(el, sel) {
  if (!el || !el.tagName) return false;
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('.')) {
    const classes = sel.split('.').filter(Boolean);
    return classes.every(c => el.classList.contains(c));
  }
  if (sel.startsWith('[') && sel.endsWith(']')) {
    const inner = sel.slice(1, -1);
    if (inner.includes('=')) {
      const [attr, val] = inner.split('=').map(s => s.replace(/['"]/g, '').trim());
      return el.getAttribute(attr) === val;
    }
    return el.getAttribute(inner) !== null;
  }
  return el.tagName.toLowerCase() === sel.toLowerCase();
}

function querySelectorAll(root, selector) {
  const results = [];
  function traverse(node) {
    if (node !== root && matchesSelector(node, selector)) {
      results.push(node);
    }
    for (const child of node.children) {
      traverse(child);
    }
  }
  traverse(root);
  return results;
}

// Configurar ambiente global mock
const mockBody = new MockElement('body');
const elementsById = new Map();

global.window = global;
global.window.innerWidth = 1200;
global.window.innerHeight = 800;
global.window.addEventListener = () => {};

global.document = {
  body: mockBody,
  documentElement: new MockElement('html'),
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => elementsById.get(id) || null,
  querySelector: (sel) => {
    if (sel.startsWith('#')) return elementsById.get(sel.slice(1)) || null;
    return mockBody.querySelector(sel);
  },
  querySelectorAll: (sel) => {
    const list = mockBody.querySelectorAll(sel);
    return list;
  },
  addEventListener: (event, handler) => {
    mockBody.addEventListener(event, handler);
  },
  removeEventListener: (event, handler) => {
    mockBody.removeEventListener(event, handler);
  },
  dispatchEvent: (event) => mockBody.dispatchEvent(event)
};

global.CustomEvent = class CustomEvent {
  constructor(type, params = {}) {
    this.type = type;
    this.detail = params.detail || null;
    this.bubbles = Boolean(params.bubbles);
    this.cancelable = Boolean(params.cancelable);
    this.defaultPrevented = false;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
};

// Carregar FramePER Core
const FramePER = require('../src/js/framePER.js');

console.log('🧪 Iniciando Suíte de Testes para FramePER.Modal e Variantes...');

// Validação de Existência da API
assert(FramePER.Modal, 'FramePER.Modal deve estar definido no namespace FramePER');
assert.strictEqual(typeof FramePER.Modal.show, 'function', 'FramePER.Modal.show deve ser uma função');
assert.strictEqual(typeof FramePER.Modal.hide, 'function', 'FramePER.Modal.hide deve ser uma função');
assert.strictEqual(typeof FramePER.Modal.toggle, 'function', 'FramePER.Modal.toggle deve ser uma função');

console.log('✔ FramePER.Modal API exposta com sucesso.');

// Helper para criar modal no DOM
function createModal(id, extraClasses = '', datasetAttrs = {}) {
  const modal = new MockElement('div');
  modal.id = id;
  modal.classList.add('modal');
  if (extraClasses) {
    extraClasses.split(' ').filter(Boolean).forEach(c => modal.classList.add(c));
  }
  Object.entries(datasetAttrs).forEach(([k, v]) => {
    modal.setAttribute(`data-${k}`, v);
  });

  const content = new MockElement('div');
  content.classList.add('modal-content');
  modal.appendChild(content);

  elementsById.set(id, modal);
  mockBody.appendChild(modal);
  return modal;
}

// Teste 1: FramePER.Modal.show() abre modal e bloqueia scroll do body
{
  const modal1 = createModal('testModal1');
  FramePER.Modal.show('#testModal1');
  assert.strictEqual(modal1.classList.contains('show'), true, 'Modal deve ter classe .show após show()');
  assert.strictEqual(mockBody.style.overflow, 'hidden', 'document.body.style.overflow deve ser "hidden"');
  console.log('✔ Teste 1: FramePER.Modal.show() abre o modal e bloqueia overflow do body.');
}

// Teste 2: FramePER.Modal.hide() fecha modal e restaura scroll do body
{
  FramePER.Modal.hide('#testModal1');
  const modal1 = elementsById.get('testModal1');
  assert.strictEqual(modal1.classList.contains('show'), false, 'Modal não deve ter classe .show após hide()');
  assert.strictEqual(mockBody.style.overflow, '', 'document.body.style.overflow deve ser restaurado para ""');
  console.log('✔ Teste 2: FramePER.Modal.hide() fecha o modal e restaura overflow do body.');
}

// Teste 3: FramePER.Modal.toggle() alterna visibilidade
{
  const modalToggle = createModal('testModalToggle');
  assert.strictEqual(modalToggle.classList.contains('show'), false);
  FramePER.Modal.toggle(modalToggle);
  assert.strictEqual(modalToggle.classList.contains('show'), true, 'toggle() deve abrir quando fechado');
  assert.strictEqual(mockBody.style.overflow, 'hidden');
  FramePER.Modal.toggle(modalToggle);
  assert.strictEqual(modalToggle.classList.contains('show'), false, 'toggle() deve fechar quando aberto');
  assert.strictEqual(mockBody.style.overflow, '');
  console.log('✔ Teste 3: FramePER.Modal.toggle() alterna estados corretamente.');
}

// Teste 4: Backdrop estático com clique externo dispara shake e não fecha
{
  const modalStatic = createModal('testModalStatic', 'modal-static', { backdrop: 'static' });
  FramePER.Modal.show(modalStatic);
  assert.strictEqual(modalStatic.classList.contains('show'), true);

  // Simular clique no backdrop (target === modal)
  const clickEvent = {
    target: modalStatic,
    preventDefault: () => {}
  };

  // Disparar no mockBody (onde document listeners foram registrados)
  mockBody.listeners['click'].forEach(fn => fn(clickEvent));

  assert.strictEqual(modalStatic.classList.contains('show'), true, 'Modal estático NÃO deve fechar ao clicar no backdrop');
  assert.strictEqual(modalStatic.classList.contains('modal-shake'), true, 'Modal estático DEVE receber classe .modal-shake no backdrop click');

  FramePER.Modal.hide(modalStatic);
  console.log('✔ Teste 4: Backdrop estático aplica .modal-shake e preserva o modal aberto.');
}

// Teste 5: Eventos de ciclo de vida (modal:show, modal:shown, modal:hide, modal:hidden)
{
  const modalEvents = createModal('testModalEvents');
  const eventsFired = [];

  modalEvents.addEventListener('modal:show', () => eventsFired.push('show'));
  modalEvents.addEventListener('modal:shown', () => eventsFired.push('shown'));
  modalEvents.addEventListener('modal:hide', () => eventsFired.push('hide'));
  modalEvents.addEventListener('modal:hidden', () => eventsFired.push('hidden'));

  FramePER.Modal.show(modalEvents);
  assert(eventsFired.includes('show'), 'modal:show deve ser disparado');
  assert(eventsFired.includes('shown'), 'modal:shown deve ser disparado');

  FramePER.Modal.hide(modalEvents);
  assert(eventsFired.includes('hide'), 'modal:hide deve ser disparado');
  assert(eventsFired.includes('hidden'), 'modal:hidden deve ser disparado');

  assert.deepStrictEqual(eventsFired, ['show', 'shown', 'hide', 'hidden'], 'Eventos devem disparar na ordem correta');
  console.log('✔ Teste 5: Eventos de ciclo de vida modal:show, modal:shown, modal:hide, modal:hidden funcionam.');
}

// Teste 6: Tecla ESC fecha modal padrão, mas respeita data-keyboard="false"
{
  const modalNoEsc = createModal('testModalNoEsc', '', { keyboard: 'false' });
  FramePER.Modal.show(modalNoEsc);
  assert.strictEqual(modalNoEsc.classList.contains('show'), true);

  // Simular evento keydown de Escape
  const escEvent = {
    key: 'Escape',
    preventDefault: () => {}
  };
  mockBody.listeners['keydown'].forEach(fn => fn(escEvent));

  assert.strictEqual(modalNoEsc.classList.contains('show'), true, 'Modal com data-keyboard="false" NÃO deve fechar com ESC');

  FramePER.Modal.hide(modalNoEsc);

  // Agora testar modal comum fechando com ESC
  const modalRegular = createModal('testModalRegular');
  FramePER.Modal.show(modalRegular);
  assert.strictEqual(modalRegular.classList.contains('show'), true);
  mockBody.listeners['keydown'].forEach(fn => fn(escEvent));
  assert.strictEqual(modalRegular.classList.contains('show'), false, 'Modal comum DEVE fechar com ESC');
  console.log('✔ Teste 6: Tecla ESC fecha modal comum e respeita keyboard: false.');
}

// Teste 7: Acionamento declarativo via data-toggle="modal" e data-dismiss="modal"
{
  const modalDecl = createModal('testModalDecl');
  const triggerBtn = new MockElement('button');
  triggerBtn.setAttribute('data-toggle', 'modal');
  triggerBtn.setAttribute('data-target', '#testModalDecl');
  mockBody.appendChild(triggerBtn);

  const dismissBtn = new MockElement('button');
  dismissBtn.setAttribute('data-dismiss', 'modal');
  modalDecl.children[0].appendChild(dismissBtn);

  // Simular clique no botão de toggle
  mockBody.listeners['click'].forEach(fn => fn({
    target: triggerBtn,
    preventDefault: () => {}
  }));
  assert.strictEqual(modalDecl.classList.contains('show'), true, 'data-toggle="modal" deve abrir o modal');

  // Simular clique no botão de fechar
  mockBody.listeners['click'].forEach(fn => fn({
    target: dismissBtn,
    preventDefault: () => {}
  }));
  assert.strictEqual(modalDecl.classList.contains('show'), false, 'data-dismiss="modal" deve fechar o modal');
  console.log('✔ Teste 7: Acionamento declarativo por atributos HTML funciona com sucesso.');
}

console.log('----------------------------------------------------');
console.log('🎉 TODOS OS TESTES DE MODAL PASSARAM COM SUCESSO!');
