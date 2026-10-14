/**
 * Test Suite para FramePER.Converter Batch Converter & toZip
 * Execução: node tests/test-converter-batch.js
 */

const assert = require('assert');

// Mock browser environment for Node.js
global.window = global;
global.window.innerWidth = 1024;
global.window.innerHeight = 768;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.document = {
  createElement: () => ({ style: {}, appendChild: () => {}, querySelectorAll: () => [] }),
  body: { appendChild: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null
};

const FramePER = require('../src/js/framePER.js');
const Converter = FramePER.Converter;

console.log('🧪 Iniciando Testes de FramePER.Converter Batch & toZip...');

assert(Converter, 'FramePER.Converter deve estar definido');

async function runTests() {
  // --- Teste 1: Converter.toZip ---
  console.log('▶ Teste 1: Converter.toZip com múltiplos arquivos');
  const filesToZip = [
    { name: 'documento1.csv', data: 'ID,Nome\n1,Carlos\n2,Mariana' },
    { name: 'documento2.json', data: JSON.stringify([{ item: 'Mesa', qtd: 4 }]) }
  ];

  const zipResult = Converter.toZip(filesToZip, { filename: 'teste_pacote.zip', autoDownload: false });
  assert(zipResult, 'toZip deve retornar um resultado válido');
  assert.strictEqual(zipResult.filename, 'teste_pacote.zip');
  assert.strictEqual(zipResult.mime, 'application/zip');
  assert(zipResult.content instanceof Uint8Array || Buffer.isBuffer(zipResult.content), 'Conteúdo deve ser binário');

  // Verifica assinatura PKZIP: 0x50 0x4B 0x03 0x04 ("PK\x03\x04")
  const bytes = new Uint8Array(zipResult.content);
  assert.strictEqual(bytes[0], 0x50);
  assert.strictEqual(bytes[1], 0x4B);
  assert.strictEqual(bytes[2], 0x03);
  assert.strictEqual(bytes[3], 0x04);
  console.log('  ✓ Passou');

  // --- Teste 2: Converter.convertBatch ---
  console.log('▶ Teste 2: Converter.convertBatch (conversão em lote de CSV para JSON)');
  const csvFiles = [
    {
      name: 'vendas_janeiro.csv',
      text: async () => 'Dia,Valor\n01,500\n02,750'
    },
    {
      name: 'vendas_fevereiro.csv',
      text: async () => 'Dia,Valor\n01,600\n02,820'
    }
  ];

  let progressCalls = 0;
  const batchResult = await Converter.convertBatch(csvFiles, 'json', {
    zipFilename: 'vendas_json.zip',
    autoDownload: false,
    onProgress: (p) => {
      progressCalls++;
      assert(p.current <= p.total);
    }
  });

  assert(batchResult, 'convertBatch deve retornar resultado');
  assert.strictEqual(batchResult.results.length, 2, 'Deve conter 2 arquivos convertidos');
  assert.strictEqual(batchResult.results[0].filename, 'vendas_janeiro.json');
  assert.strictEqual(batchResult.results[1].filename, 'vendas_fevereiro.json');

  // Verifica conteúdo JSON do primeiro arquivo
  const parsed1 = JSON.parse(batchResult.results[0].content);
  assert.strictEqual(parsed1.length, 2);
  assert.strictEqual(parsed1[0].Dia, '01');
  assert.strictEqual(parsed1[0].Valor, 500);

  // Verifica o pacote ZIP gerado
  assert(batchResult.zip, 'Deve gerar objeto zip');
  assert.strictEqual(batchResult.zip.filename, 'vendas_json.zip');
  assert(progressCalls >= 2, 'onProgress deve ser chamado para cada arquivo');
  console.log('  ✓ Passou');

  // --- Teste 3: Converter.convertBatch para XLSX ---
  console.log('▶ Teste 3: Converter.convertBatch (conversão em lote para XLSX)');
  const jsonFiles = [
    {
      name: 'equipe_a.json',
      text: async () => JSON.stringify([{ id: 1, nome: 'Lucas' }])
    },
    {
      name: 'equipe_b.json',
      text: async () => JSON.stringify([{ id: 2, nome: 'Beatriz' }])
    }
  ];

  const xlsxBatch = await Converter.convertBatch(jsonFiles, 'xlsx', { autoDownload: false });
  assert.strictEqual(xlsxBatch.results.length, 2);
  assert.strictEqual(xlsxBatch.results[0].filename, 'equipe_a.xlsx');
  assert.strictEqual(xlsxBatch.results[1].filename, 'equipe_b.xlsx');
  assert(xlsxBatch.zip.content.length > 0);
  console.log('  ✓ Passou');

  console.log('\n🎉 TODOS OS TESTES DE BATCH CONVERTER PASSARAM COM SUCESSO!\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
