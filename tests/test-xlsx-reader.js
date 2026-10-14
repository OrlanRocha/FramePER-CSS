/**
 * Test Suite para Leitor Nativo de XLSX (FramePER.Converter.fromXLSX)
 * Execução: node tests/test-xlsx-reader.js
 */

const assert = require('assert');

// Mock browser environment for Node.js
global.window = global;
global.window.innerWidth = 1024;
global.window.innerHeight = 768;
global.window.addEventListener = () => {};
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

async function runTests() {
  console.log('🧪 Iniciando Testes do Leitor Nativo de XLSX (FramePER.Converter.fromXLSX)...');

  assert(Converter, 'FramePER.Converter deve estar definido');
  assert(typeof Converter.fromXLSX === 'function', 'Converter.fromXLSX deve ser uma função');

  // Teste 1: Parser de Coordenadas de Células Excel (A1, B2, AA10)
  console.log('▶ Teste 1: Utilitário de Coordenadas Excel (coluna/linha)');
  assert(typeof Converter._parseCellRef === 'function', 'Converter._parseCellRef deve existir');
  assert.deepStrictEqual(Converter._parseCellRef('A1'), { col: 0, row: 0 });
  assert.deepStrictEqual(Converter._parseCellRef('B3'), { col: 1, row: 2 });
  assert.deepStrictEqual(Converter._parseCellRef('C5'), { col: 2, row: 4 });
  assert.deepStrictEqual(Converter._parseCellRef('Z1'), { col: 25, row: 0 });
  assert.deepStrictEqual(Converter._parseCellRef('AA1'), { col: 26, row: 0 });
  assert.deepStrictEqual(Converter._parseCellRef('AB12'), { col: 27, row: 11 });
  console.log('  ✓ Passou');

  // Teste 2: Round-Trip toXLSX -> fromXLSX
  console.log('▶ Teste 2: Round-Trip (toXLSX -> fromXLSX)');
  const originalDS = {
    title: 'Estoque de Produtos',
    headers: ['Código', 'Item', 'Preço Unitário', 'Disponível'],
    rows: [
      [101, 'Monitor 4K 27 pol', 2499.90, 'Sim'],
      [102, 'Teclado Mecânico RGB', 349.50, 'Não'],
      [103, 'Mouse Óptico Gamer', 189.00, 'Sim']
    ]
  };

  const xlsxBuffer = Converter.toXLSX(originalDS, { asBuffer: true });
  assert(xlsxBuffer instanceof Uint8Array || Buffer.isBuffer(xlsxBuffer), 'Deve gerar Uint8Array');

  const parsedDS = await Converter.fromXLSX(xlsxBuffer);
  assert(parsedDS, 'Deve retornar um Dataset válido');
  assert.deepStrictEqual(parsedDS.headers, ['Código', 'Item', 'Preço Unitário', 'Disponível'], 'Headers devem coincidir');
  assert.strictEqual(parsedDS.rows.length, 3, 'Deve conter 3 linhas');
  assert.strictEqual(parsedDS.rows[0][0], 101);
  assert.strictEqual(parsedDS.rows[0][1], 'Monitor 4K 27 pol');
  assert.strictEqual(parsedDS.rows[0][2], 2499.90);
  assert.strictEqual(parsedDS.rows[0][3], 'Sim');
  console.log('  ✓ Passou');

  // Teste 3: Leitura de Células com Shared Strings (t="s")
  console.log('▶ Teste 3: OpenXML com Shared Strings (t="s")');
  // Cria XML de shared strings
  const sharedStringsXML = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="3" uniqueCount="3">' +
      '<si><t>ID</t></si>' +
      '<si><t>Nome</t></si>' +
      '<si><t>São Paulo</t></si>' +
    '</sst>';

  // Cria XML de planilha com referências de índice para shared strings
  const sheetXML = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetData>' +
        '<row r="1">' +
          '<c r="A1" t="s"><v>0</v></c>' +
          '<c r="B1" t="s"><v>1</v></c>' +
        '</row>' +
        '<row r="2">' +
          '<c r="A2"><v>500</v></c>' +
          '<c r="B2" t="s"><v>2</v></c>' +
        '</row>' +
      '</sheetData>' +
    '</worksheet>';

  const files = [
    { name: '[Content_Types].xml', data: '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>' },
    { name: 'xl/sharedStrings.xml', data: sharedStringsXML },
    { name: 'xl/worksheets/sheet1.xml', data: sheetXML }
  ];

  const zipWithSharedStrings = Converter._createZip(files);
  const dsShared = await Converter.fromXLSX(zipWithSharedStrings);

  assert.deepStrictEqual(dsShared.headers, ['ID', 'Nome']);
  assert.strictEqual(dsShared.rows.length, 1);
  assert.strictEqual(dsShared.rows[0][0], 500);
  assert.strictEqual(dsShared.rows[0][1], 'São Paulo');
  console.log('  ✓ Passou');

  // Teste 4: Células esparsas / vazias intercaladas (A1, C1 sem B1)
  console.log('▶ Teste 4: Preservação de colunas com células vazias intercaladas');
  const sparseSheetXML = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetData>' +
        '<row r="1">' +
          '<c r="A1" t="inlineStr"><is><t>Coluna A</t></is></c>' +
          '<c r="B1" t="inlineStr"><is><t>Coluna B</t></is></c>' +
          '<c r="C1" t="inlineStr"><is><t>Coluna C</t></is></c>' +
        '</row>' +
        '<row r="2">' +
          '<c r="A2"><v>10</v></c>' +
          '<!-- Célula B2 ausente -->' +
          '<c r="C2"><v>30</v></c>' +
        '</row>' +
      '</sheetData>' +
    '</worksheet>';

  const sparseZip = Converter._createZip([
    { name: 'xl/worksheets/sheet1.xml', data: sparseSheetXML }
  ]);
  const dsSparse = await Converter.fromXLSX(sparseZip);

  assert.deepStrictEqual(dsSparse.headers, ['Coluna A', 'Coluna B', 'Coluna C']);
  assert.strictEqual(dsSparse.rows[0][0], 10);
  assert.strictEqual(dsSparse.rows[0][1], '', 'B2 deve ser string vazia');
  assert.strictEqual(dsSparse.rows[0][2], 30);
  console.log('  ✓ Passou');

  // Teste 5: Descompressão Deflate (Método 8 - Padrão do Microsoft Excel)
  console.log('▶ Teste 5: Descompressão Deflate (Método 8 - padrão MS Excel)');
  const zlib = require('zlib');
  const deflateSheetXML = Buffer.from(sparseSheetXML, 'utf-8');
  const compressedData = zlib.deflateRawSync(deflateSheetXML);
  const fnBytes = Buffer.from('xl/worksheets/sheet1.xml', 'utf-8');

  // Constrói um ZIP com método 8 (Deflate) manualmente
  const zipBuf = Buffer.alloc(30 + fnBytes.length + compressedData.length + 46 + fnBytes.length + 22);
  let o = 0;
  // Local header
  zipBuf.writeUInt32LE(0x04034b50, o); o += 4;
  zipBuf.writeUInt16LE(20, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(8, o); o += 2; // Method 8: Deflate!
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt32LE(0, o); o += 4; // CRC
  zipBuf.writeUInt32LE(compressedData.length, o); o += 4; // Comp size
  zipBuf.writeUInt32LE(deflateSheetXML.length, o); o += 4; // Uncomp size
  zipBuf.writeUInt16LE(fnBytes.length, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  fnBytes.copy(zipBuf, o); o += fnBytes.length;
  compressedData.copy(zipBuf, o); o += compressedData.length;

  const cdStart = o;
  // Central Directory
  zipBuf.writeUInt32LE(0x02014b50, o); o += 4;
  zipBuf.writeUInt16LE(20, o); o += 2;
  zipBuf.writeUInt16LE(20, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(8, o); o += 2; // Method 8!
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt32LE(0, o); o += 4;
  zipBuf.writeUInt32LE(compressedData.length, o); o += 4;
  zipBuf.writeUInt32LE(deflateSheetXML.length, o); o += 4;
  zipBuf.writeUInt16LE(fnBytes.length, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt32LE(0, o); o += 4;
  zipBuf.writeUInt32LE(0, o); o += 4; // LH offset = 0
  fnBytes.copy(zipBuf, o); o += fnBytes.length;

  const cdSize = o - cdStart;
  // EOCD
  zipBuf.writeUInt32LE(0x06054b50, o); o += 4;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(0, o); o += 2;
  zipBuf.writeUInt16LE(1, o); o += 2;
  zipBuf.writeUInt16LE(1, o); o += 2;
  zipBuf.writeUInt32LE(cdSize, o); o += 4;
  zipBuf.writeUInt32LE(cdStart, o); o += 4;
  zipBuf.writeUInt16LE(0, o); o += 2;

  const dsDeflate = await Converter.fromXLSX(zipBuf.subarray(0, o));
  assert.deepStrictEqual(dsDeflate.headers, ['Coluna A', 'Coluna B', 'Coluna C']);
  assert.strictEqual(dsDeflate.rows[0][0], 10);
  assert.strictEqual(dsDeflate.rows[0][2], 30);
  console.log('  ✓ Passou');

  console.log('\n🎉 TODOS OS TESTES DO LEITOR DE XLSX PASSARAM COM SUCESSO!\n');
}

runTests().catch(err => {
  console.error('\n❌ Erro no teste:', err);
  process.exit(1);
});
