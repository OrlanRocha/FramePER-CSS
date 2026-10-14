// Testes de Agregações de Dataset e Linha de Totais no FramePER.Converter
const assert = require('assert');

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
    querySelector(sel) { return new MockDOMElement('div'); }
    querySelectorAll(sel) { return []; }
    closest(sel) { return null; }
}

global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.CustomEvent = class CustomEvent {
    constructor(event, params) {
        this.type = event;
        this.detail = params ? params.detail : null;
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
const Converter = FramePER.Converter;

console.log('🧪 Iniciando Testes de Agregações e Linha de Totais no FramePER.Converter...');

async function runTests() {
    const sampleData = {
        headers: ['ID', 'Produto', 'Categoria', 'Preco', 'Estoque', 'Data'],
        rows: [
            [1, 'Teclado Mecânico', 'Hardware', 'R$ 350,00', 10, '2026-01-10'],
            [2, 'Mouse Gamer', 'Hardware', 'R$ 80,50', 25, '2026-02-15'],
            [3, 'Monitor 4K', 'Periféricos', 'R$ 2.450,00', 5, '2026-03-20'],
            [4, 'Cabo USB-C', 'Acessórios', null, 0, ''],
            [5, 'Notebook Pro', 'Hardware', 'R$ 8.900,99', 8, '2026-04-05']
        ]
    };

    // ▶ Teste 1: Converter.aggregate - SOMA (Sum) em números e moeda formatada
    console.log('▶ Teste 1: Converter.aggregate - SOMA com formato monetário e numérico');
    const aggSum = Converter.aggregate(sampleData, {
        Preco: 'sum',
        Estoque: 'sum'
    });
    // 350 + 80.50 + 2450 + 8900.99 = 11781.49
    assert.ok(Math.abs(aggSum['Preco'].value - 11781.49) < 0.01, 'Valor numérico de Preco deve ser 11781.49');
    assert.strictEqual(aggSum['Preco'].type, 'sum');
    assert.ok(aggSum['Preco'].formatted.includes('11.781,49'), 'Deve conter valor formatado com pontuação brasileira');
    assert.ok(aggSum['Preco'].formatted.includes('R$'), 'Deve preservar símbolo monetário R$');

    // Estoque: 10 + 25 + 5 + 0 + 8 = 48
    assert.strictEqual(aggSum['Estoque'].value, 48);
    assert.strictEqual(aggSum['Estoque'].formatted, '48');
    console.log('  ✓ Passou');

    // ▶ Teste 2: Converter.aggregate - MÉDIA (Average) ignorando nulos no divisor
    console.log('▶ Teste 2: Converter.aggregate - MÉDIA (avg)');
    const aggAvg = Converter.aggregate(sampleData, {
        Preco: 'avg',
        Estoque: 'avg'
    });
    // Preco tem 4 números válidos (null ignorado): 11781.49 / 4 = 2945.3725
    assert.ok(Math.abs(aggAvg['Preco'].value - 2945.37) < 0.01);
    assert.ok(aggAvg['Preco'].formatted.includes('2.945,37'));
    assert.ok(aggAvg['Preco'].formatted.includes('R$'));

    // Estoque tem 5 valores (incluindo 0): 48 / 5 = 9.6
    assert.strictEqual(aggAvg['Estoque'].value, 9.6);
    console.log('  ✓ Passou');

    // ▶ Teste 3: Converter.aggregate - MÍNIMO e MÁXIMO (min / max)
    console.log('▶ Teste 3: Converter.aggregate - MÍNIMO e MÁXIMO');
    const aggMinMax = Converter.aggregate(sampleData, {
        Preco: 'min',
        Estoque: 'max',
        Data: 'min'
    });
    assert.strictEqual(aggMinMax['Preco'].value, 80.50);
    assert.ok(aggMinMax['Preco'].formatted.includes('80,50'));

    assert.strictEqual(aggMinMax['Estoque'].value, 25);
    assert.strictEqual(aggMinMax['Estoque'].formatted, '25');

    // Data mínima deve ser 2026-01-10 (ignorando string vazia)
    assert.strictEqual(aggMinMax['Data'].formatted, '2026-01-10');
    console.log('  ✓ Passou');

    // ▶ Teste 4: Converter.aggregate - CONTAGEM e CONTAGEM DISTINTA
    console.log('▶ Teste 4: Converter.aggregate - Contagem (count e count_distinct)');
    const aggCount = Converter.aggregate(sampleData, {
        Produto: 'count',
        Categoria: 'count_distinct'
    });
    assert.strictEqual(aggCount['Produto'].value, 5, 'Produto tem 5 itens não vazios');
    assert.strictEqual(aggCount['Categoria'].value, 3, 'Categoria tem 3 valores distintos (Hardware, Periféricos, Acessórios)');
    console.log('  ✓ Passou');

    // ▶ Teste 5: Suporte a array de regras ou índices numéricos de coluna
    console.log('▶ Teste 5: Converter.aggregate - Configuração por índices numéricos');
    const aggByColIdx = Converter.aggregate(sampleData, [
        { column: 3, type: 'sum' }, // Preco
        { column: 4, type: 'avg' }  // Estoque
    ]);
    const precoRes = aggByColIdx[3] || aggByColIdx['Preco'];
    assert.ok(Math.abs(precoRes.value - 11781.49) < 0.01);
    console.log('  ✓ Passou');

    // ▶ Teste 6: toCSV com summaryRow
    console.log('▶ Teste 6: Converter.toCSV com summaryRow');
    const summaryList = ['Total', '', '', 'R$ 11.781,49', 48, ''];
    const csvWithSummary = Converter.toCSV(sampleData, { summaryRow: summaryList });
    assert.ok(csvWithSummary.includes('Total'), 'CSV deve conter linha de Total');
    assert.ok(csvWithSummary.includes('R$ 11.781,49'), 'CSV deve conter valor formatado de Preco');
    assert.ok(csvWithSummary.includes('48'), 'CSV deve conter total de Estoque');
    console.log('  ✓ Passou');

    // ▶ Teste 7: toXLS com summaryRow
    console.log('▶ Teste 7: Converter.toXLS com summaryRow');
    const xlsWithSummary = Converter.toXLS(sampleData, { summaryRow: summaryList });
    assert.ok(xlsWithSummary.includes('Total'), 'XLS XML deve conter célula de Total');
    assert.ok(xlsWithSummary.includes('11.781,49'), 'XLS XML deve conter valor total');
    console.log('  ✓ Passou');

    // ▶ Teste 8: toXLSX com summaryRow e leitura via fromXLSX
    console.log('▶ Teste 8: Converter.toXLSX com summaryRow');
    const xlsxBlob = Converter.toXLSX(sampleData, { summaryRow: summaryList, asBlob: false });
    assert.ok(xlsxBlob instanceof Uint8Array, 'Deve retornar buffer binário');
    // Ler de volta com fromXLSX
    const readBack = await Converter.fromXLSX(xlsxBlob);
    assert.strictEqual(readBack.rows.length, sampleData.rows.length + 1, 'Deve conter 1 linha extra de resumo no XLSX');
    const lastRow = readBack.rows[readBack.rows.length - 1];
    assert.strictEqual(lastRow[0], 'Total');
    console.log('  ✓ Passou');

    // ▶ Teste 9: toPDF com summaryRow
    console.log('▶ Teste 9: Converter.toPDF com summaryRow');
    const pdfBlob = Converter.toPDF(sampleData, { summaryRow: summaryList, asBuffer: true });
    assert.ok(pdfBlob instanceof Uint8Array, 'PDF deve retornar Uint8Array válido');
    const pdfText = Buffer.from(pdfBlob).toString('latin1');
    assert.ok(pdfText.includes('%PDF-1.4'), 'PDF deve ter cabeçalho PDF 1.4');
    assert.ok(pdfText.includes('Total'), 'PDF deve incluir texto do resumo Total');
    console.log('  ✓ Passou');

    console.log('\n🎉 TODOS OS TESTES DE AGREGAÇÃO E EXPORTAÇÃO PASSARAM COM SUCESSO!\n');
}

runTests().catch(err => {
    console.error('❌ Falha nos testes de agregação:', err);
    process.exit(1);
});

