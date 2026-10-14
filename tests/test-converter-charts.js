/**
 * Test Suite para FramePER.Converter.toChartData
 * Execução: node tests/test-converter-charts.js
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

console.log('🧪 Iniciando Testes de FramePER.Converter.toChartData...');

assert(Converter, 'FramePER.Converter deve estar definido');

// Dataset de Teste (Vendas e Categorias)
const salesDataset = {
  headers: ['Mês', 'Categoria', 'Vendas', 'Despesas'],
  rows: [
    ['Janeiro', 'Eletrônicos', 15000, 4200],
    ['Fevereiro', 'Eletrônicos', 18000, 5100],
    ['Março', 'Eletrônicos', 14000, 3900],
    ['Abril', 'Móveis', 8000, 2100],
    ['Maio', 'Móveis', 9500, 2300]
  ]
};

// --- Teste 1: Detecção Automática (aggregation: none) ---
console.log('▶ Teste 1: Detecção automática de rótulos e colunas numéricas');
const chartData1 = Converter.toChartData(salesDataset);
assert(chartData1, 'toChartData deve retornar um objeto válido');
assert.deepStrictEqual(chartData1.labels, ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio'], 'Rótulos padrão devem vir da 1ª coluna textual');
assert.strictEqual(chartData1.series.length, 2, 'Deve identificar 2 séries numéricas (Vendas e Despesas)');
assert.strictEqual(chartData1.series[0].name, 'Vendas');
assert.deepStrictEqual(chartData1.series[0].data, [15000, 18000, 14000, 8000, 9500]);
assert.strictEqual(chartData1.series[1].name, 'Despesas');
assert.deepStrictEqual(chartData1.series[1].data, [4200, 5100, 3900, 2100, 2300]);
console.log('  ✓ Passou');

// --- Teste 2: Seleção Customizada de Colunas ---
console.log('▶ Teste 2: Seleção customizada de labelColumn e seriesColumns');
const chartData2 = Converter.toChartData(salesDataset, {
  labelColumn: 'Mês',
  seriesColumns: ['Vendas']
});
assert.strictEqual(chartData2.series.length, 1);
assert.strictEqual(chartData2.series[0].name, 'Vendas');
assert.deepStrictEqual(chartData2.series[0].data, [15000, 18000, 14000, 8000, 9500]);
console.log('  ✓ Passou');

// --- Teste 3: Agrupamento por Categoria com Soma (aggregation: sum) ---
console.log('▶ Teste 3: Agrupamento por categoria com soma (aggregation: sum)');
const chartData3 = Converter.toChartData(salesDataset, {
  labelColumn: 'Categoria',
  valueColumn: 'Vendas',
  aggregation: 'sum'
});
assert.deepStrictEqual(chartData3.labels, ['Eletrônicos', 'Móveis']);
assert.strictEqual(chartData3.series.length, 1);
// Eletrônicos: 15000 + 18000 + 14000 = 47000
// Móveis: 8000 + 9500 = 17500
assert.deepStrictEqual(chartData3.series[0].data, [47000, 17500]);
// Formato para gráfico de Pizza/Donut
assert(Array.isArray(chartData3.pieSeries), 'Deve gerar pieSeries para gráficos circulares');
assert.strictEqual(chartData3.pieSeries[0].value, 47000);
assert.strictEqual(chartData3.pieSeries[1].value, 17500);
console.log('  ✓ Passou');

// --- Teste 4: Agrupamento com Contagem (aggregation: count) ---
console.log('▶ Teste 4: Agrupamento por categoria com contagem (aggregation: count)');
const chartData4 = Converter.toChartData(salesDataset, {
  labelColumn: 'Categoria',
  aggregation: 'count'
});
assert.deepStrictEqual(chartData4.labels, ['Eletrônicos', 'Móveis']);
assert.deepStrictEqual(chartData4.series[0].data, [3, 2]);
console.log('  ✓ Passou');

// --- Teste 5: Tratamento de strings com símbolos monetários (ex: R$ 1.500,00 ou 1500.50) ---
console.log('▶ Teste 5: Conversão de valores formatados como texto em números');
const formattedDataset = {
  headers: ['Item', 'Preço'],
  rows: [
    ['Mouse', 'R$ 150,50'],
    ['Teclado', 'R$ 300,00'],
    ['Monitor', '1.250,90']
  ]
};
const chartData5 = Converter.toChartData(formattedDataset);
assert.deepStrictEqual(chartData5.labels, ['Mouse', 'Teclado', 'Monitor']);
assert.strictEqual(chartData5.series[0].data[0], 150.50);
assert.strictEqual(chartData5.series[0].data[1], 300.00);
assert.strictEqual(chartData5.series[0].data[2], 1250.90);
console.log('  ✓ Passou');

// --- Teste 6: Limite de Itens (maxItems) ---
console.log('▶ Teste 6: Limite de itens com maxItems');
const chartData6 = Converter.toChartData(salesDataset, { maxItems: 3 });
assert.strictEqual(chartData6.labels.length, 3);
assert.strictEqual(chartData6.series[0].data.length, 3);
console.log('  ✓ Passou');

console.log('\n🎉 TODOS OS TESTES DE toChartData PASSARAM COM SUCESSO!\n');
