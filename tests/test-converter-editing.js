/**
 * Test Suite para Manipulação e Edição de Dataset em FramePER.Converter
 * Execução: node tests/test-converter-editing.js
 */

const assert = require('assert');

// Simula ambiente mínimo de navegador para testes no Node.js
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

const FramePER = require('../src/js/framePER.js');
const Converter = (FramePER && FramePER.Converter) ? FramePER.Converter : (global.FramePER ? global.FramePER.Converter : null);

console.log('🧪 Iniciando Testes de Manipulação e Edição de Dataset (FramePER.Converter)...');

assert(Converter, 'FramePER.Converter deve estar definido');

// Helper para dataset de teste
function createSampleDataset() {
  return {
    headers: ['ID', 'Produto', 'Preço', 'Estoque'],
    rows: [
      [101, 'Teclado Mecânico', 299.90, 15],
      [102, 'Mouse Sem Fio', 149.50, 42],
      [103, 'Monitor 27"', 1299.00, 8]
    ]
  };
}

// --- Teste 1: updateCell ---
console.log('▶ Teste 1: Converter.updateCell');
const ds1 = createSampleDataset();
Converter.updateCell(ds1, 1, 2, 169.90); // Altera Preço do Mouse
assert.strictEqual(ds1.rows[1][2], 169.90, 'O preço da linha 1 deve ter sido atualizado');
Converter.updateCell(ds1, 0, 1, 'Teclado RGB');
assert.strictEqual(ds1.rows[0][1], 'Teclado RGB', 'O nome do produto da linha 0 deve ter sido atualizado');
console.log('  ✓ Passou');

// --- Teste 2: addRow ---
console.log('▶ Teste 2: Converter.addRow');
const ds2 = createSampleDataset();
Converter.addRow(ds2, [104, 'Headset Gamer', 350.00, 20]);
assert.strictEqual(ds2.rows.length, 4, 'O dataset deve ter 4 linhas');
assert.deepStrictEqual(ds2.rows[3], [104, 'Headset Gamer', 350.00, 20], 'Nova linha deve corresponder aos valores');

// Teste preenchimento quando faltam valores
Converter.addRow(ds2, [105, 'Webcam']);
assert.strictEqual(ds2.rows.length, 5);
assert.deepStrictEqual(ds2.rows[4], [105, 'Webcam', '', ''], 'Linha incompleta deve ser preenchida com strings vazias');
console.log('  ✓ Passou');

// --- Teste 3: removeRow ---
console.log('▶ Teste 3: Converter.removeRow');
const ds3 = createSampleDataset();
Converter.removeRow(ds3, 1); // Remove Mouse
assert.strictEqual(ds3.rows.length, 2, 'Dataset deve ficar com 2 linhas');
assert.strictEqual(ds3.rows[0][1], 'Teclado Mecânico');
assert.strictEqual(ds3.rows[1][1], 'Monitor 27"');
console.log('  ✓ Passou');

// --- Teste 4: addColumn ---
console.log('▶ Teste 4: Converter.addColumn');
const ds4 = createSampleDataset();
Converter.addColumn(ds4, 'Categoria', 'Informática');
assert.strictEqual(ds4.headers.length, 5);
assert.strictEqual(ds4.headers[4], 'Categoria');
assert.strictEqual(ds4.rows[0][4], 'Informática');
assert.strictEqual(ds4.rows[1][4], 'Informática');
assert.strictEqual(ds4.rows[2][4], 'Informática');
console.log('  ✓ Passou');

// --- Teste 5: removeColumn ---
console.log('▶ Teste 5: Converter.removeColumn');
const ds5 = createSampleDataset();
// Remove por nome
Converter.removeColumn(ds5, 'Preço');
assert.deepStrictEqual(ds5.headers, ['ID', 'Produto', 'Estoque']);
assert.deepStrictEqual(ds5.rows[0], [101, 'Teclado Mecânico', 15]);
assert.deepStrictEqual(ds5.rows[1], [102, 'Mouse Sem Fio', 42]);

// Remove por índice
Converter.removeColumn(ds5, 0); // Remove 'ID'
assert.deepStrictEqual(ds5.headers, ['Produto', 'Estoque']);
assert.deepStrictEqual(ds5.rows[0], ['Teclado Mecânico', 15]);
console.log('  ✓ Passou');

// --- Teste 6: renameColumn ---
console.log('▶ Teste 6: Converter.renameColumn');
const ds6 = createSampleDataset();
Converter.renameColumn(ds6, 'Produto', 'Descrição');
assert.strictEqual(ds6.headers[1], 'Descrição');
Converter.renameColumn(ds6, 2, 'Preço Unitário');
assert.strictEqual(ds6.headers[2], 'Preço Unitário');
console.log('  ✓ Passou');

// --- Teste 7: Integridade com Exportações (toCSV e toJSON) ---
console.log('▶ Teste 7: Integridade de Exportações após Edição');
const ds7 = createSampleDataset();
Converter.renameColumn(ds7, 'ID', 'Código');
Converter.addRow(ds7, [999, 'Item Teste', 10.0, 99]);
Converter.updateCell(ds7, 0, 1, 'Teclado Customizado');
Converter.removeRow(ds7, 1);

const csvOut = Converter.toCSV(ds7);
assert(csvOut.includes('Código,Produto,Preço,Estoque'), 'CSV deve conter cabeçalho alterado');
assert(csvOut.includes('Teclado Customizado'), 'CSV deve conter célula editada');
assert(!csvOut.includes('Mouse Sem Fio'), 'CSV não deve conter linha excluída');
assert(csvOut.includes('Item Teste'), 'CSV deve conter nova linha adicionada');

const jsonOut = JSON.parse(Converter.toJSON(ds7));
assert.strictEqual(jsonOut.length, 3);
assert.strictEqual(jsonOut[0]['Código'], 101);
assert.strictEqual(jsonOut[0]['Produto'], 'Teclado Customizado');
assert.strictEqual(jsonOut[2]['Produto'], 'Item Teste');

console.log('  ✓ Passou');

console.log('\n🎉 TODOS OS TESTES DE MANIPULAÇÃO E EDIÇÃO PASSARAM COM SUCESSO!\n');
