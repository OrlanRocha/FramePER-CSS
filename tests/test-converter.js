/**
 * Test Suite para FramePER.Converter
 * Execução: node tests/test-converter.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Simula ambiente de navegador para testes no Node.js
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.innerWidth = 1024;
global.window.innerHeight = 768;
global.document = {
  createElement: () => ({ style: {}, appendChild: () => {}, querySelectorAll: () => [] }),
  body: { appendChild: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null
};

// Requer o código fonte ou o objeto
const FramePER = require('../src/js/framePER.js');
const Converter = (FramePER && FramePER.Converter) ? FramePER.Converter : (global.FramePER ? global.FramePER.Converter : null);

console.log('🧪 Iniciando Testes de FramePER.Converter...');

assert(Converter, 'FramePER.Converter deve estar definido e exposto globalmente');

// --- Teste 1: Array de Objetos ---
console.log('▶ Teste 1: Normalização de Array de Objetos');
const arrData = [
  { id: 1, nome: 'Ana', cargo: 'Dev' },
  { id: 2, nome: 'Beto', cargo: 'Design' }
];
const ds1 = Converter.parse(arrData);
assert.deepStrictEqual(ds1.headers, ['id', 'nome', 'cargo'], 'Headers incorretos para Array de Objetos');
assert.strictEqual(ds1.rows.length, 2, 'Total de linhas incorreto');
assert.deepStrictEqual(ds1.rows[0], [1, 'Ana', 'Dev']);
console.log('  ✓ Passou');

// --- Teste 2: Matriz 2D ---
console.log('▶ Teste 2: Normalização de Matriz 2D');
const matrixData = [
  ['id', 'produto', 'preco'],
  [101, 'Teclado', 150.0],
  [102, 'Mouse', 80.0]
];
const ds2 = Converter.parse(matrixData);
assert.deepStrictEqual(ds2.headers, ['id', 'produto', 'preco']);
assert.strictEqual(ds2.rows.length, 2);
assert.deepStrictEqual(ds2.rows[1], [102, 'Mouse', 80.0]);
console.log('  ✓ Passou');

// --- Teste 3: String CSV ---
console.log('▶ Teste 3: Parsing de String CSV');
const csvString = 'id;nome;cidade\n1;"Silva, João";Recife\n2;Maria;São Paulo';
const ds3 = Converter.parse(csvString);
assert.deepStrictEqual(ds3.headers, ['id', 'nome', 'cidade']);
assert.strictEqual(ds3.rows.length, 2);
assert.strictEqual(ds3.rows[0][1], 'Silva, João', 'Aspas com vírgula dentro devem ser preservadas');
console.log('  ✓ Passou');

// --- Teste 4: String JSON ---
console.log('▶ Teste 4: Parsing de String JSON');
const jsonString = JSON.stringify([
  { sku: 'A1', qtd: 10 },
  { sku: 'B2', qtd: 25 }
]);
const ds4 = Converter.parse(jsonString);
assert.deepStrictEqual(ds4.headers, ['sku', 'qtd']);
assert.strictEqual(ds4.rows.length, 2);
console.log('  ✓ Passou');

// --- Teste 5: String XML ---
console.log('▶ Teste 5: Parsing de String XML');
const xmlString = `<tabela>
  <registro><codigo>001</codigo><item>Caderno</item></registro>
  <registro><codigo>002</codigo><item>Caneta</item></registro>
</tabela>`;
const ds5 = Converter.parse(xmlString);
assert.deepStrictEqual(ds5.headers, ['codigo', 'item']);
assert.strictEqual(ds5.rows.length, 2);
assert.deepStrictEqual(ds5.rows[0], ['001', 'Caderno']);
console.log('  ✓ Passou');

console.log('\n🎉 TODOS OS TESTES DA TASK 1 PASSARAM COM SUCESSO!\n');
