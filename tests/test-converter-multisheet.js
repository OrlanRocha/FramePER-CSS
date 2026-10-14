// Testes de Suporte a Múltiplas Planilhas (Worksheets / Multi-Sheet) no FramePER.Converter
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
    querySelector(sel) {
        return new MockDOMElement('div');
    }
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

console.log('🧪 Iniciando Testes de Multi-Sheet (Worksheets) no FramePER.Converter...');

async function runTests() {
    // ----------------------------------------------------
    // Teste 1: Criação de Workbook e Métodos de Inspeção
    // ----------------------------------------------------
    console.log('▶ Teste 1: createWorkbook, getSheets e getSheetNames');
    const sheet1 = {
        title: 'Vendas',
        headers: ['ID', 'Produto', 'Valor'],
        rows: [
            [1, 'Notebook', 4500],
            [2, 'Monitor', 1800]
        ]
    };
    const sheet2 = {
        title: 'Custos',
        headers: ['Item', 'Custo'],
        rows: [
            ['Frete', 150],
            ['Embalagem', 40]
        ]
    };

    const wb = Converter.createWorkbook({
        'Vendas': sheet1,
        'Custos': sheet2
    });

    assert.strictEqual(typeof wb, 'object', 'Workbook deve ser um objeto Dataset');
    assert.ok(wb.sheets, 'Workbook deve conter objeto .sheets');
    assert.deepStrictEqual(wb.sheetNames, ['Vendas', 'Custos'], 'sheetNames deve conter os nomes das abas');
    assert.strictEqual(wb.activeSheet, 'Vendas', 'Aba ativa padrão deve ser a primeira');
    assert.deepStrictEqual(wb.headers, ['ID', 'Produto', 'Valor'], 'Headers da aba ativa devem ser refletidos');
    assert.strictEqual(wb.rows.length, 2, 'Linhas da aba ativa devem ser refletidas');

    const sheetNames = Converter.getSheetNames(wb);
    assert.deepStrictEqual(sheetNames, ['Vendas', 'Custos']);

    const allSheets = Converter.getSheets(wb);
    assert.ok(allSheets['Vendas'] && allSheets['Custos']);
    console.log('  ✓ Passou');

    // ----------------------------------------------------
    // Teste 2: Alternância de Aba (selectSheet)
    // ----------------------------------------------------
    console.log('▶ Teste 2: selectSheet');
    const selected = Converter.selectSheet(wb, 'Custos');
    assert.strictEqual(selected.activeSheet, 'Custos');
    assert.deepStrictEqual(selected.headers, ['Item', 'Custo']);
    assert.strictEqual(selected.rows.length, 2);
    assert.strictEqual(selected.rows[0][0], 'Frete');

    // Alternar por índice
    const selectedByIndex = Converter.selectSheet(wb, 0);
    assert.strictEqual(selectedByIndex.activeSheet, 'Vendas');
    assert.strictEqual(selectedByIndex.rows[0][1], 'Notebook');
    console.log('  ✓ Passou');

    // ----------------------------------------------------
    // Teste 3: Adição, Renomeação e Remoção de Abas
    // ----------------------------------------------------
    console.log('▶ Teste 3: addSheet, renameSheet e removeSheet');
    const sheet3 = {
        headers: ['Ano', 'Meta'],
        rows: [[2026, 100000]]
    };
    Converter.addSheet(wb, 'Metas', sheet3);
    assert.deepStrictEqual(Converter.getSheetNames(wb), ['Vendas', 'Custos', 'Metas']);
    assert.strictEqual(wb.sheets['Metas'].headers[0], 'Ano');

    // Renomear
    Converter.renameSheet(wb, 'Metas', 'Metas 2026');
    assert.deepStrictEqual(Converter.getSheetNames(wb), ['Vendas', 'Custos', 'Metas 2026']);
    assert.ok(!wb.sheets['Metas']);
    assert.ok(wb.sheets['Metas 2026']);

    // Remover
    Converter.removeSheet(wb, 'Custos');
    assert.deepStrictEqual(Converter.getSheetNames(wb), ['Vendas', 'Metas 2026']);
    assert.ok(!wb.sheets['Custos']);

    // Não deve permitir remover todas as abas
    assert.throws(() => {
        Converter.removeSheet(wb, 'Vendas');
        Converter.removeSheet(wb, 'Metas 2026');
    }, /Não é possível remover a única planilha restante/);
    console.log('  ✓ Passou');

    // ----------------------------------------------------
    // Teste 4: Geração de XLSX Multi-Aba (toXLSX)
    // ----------------------------------------------------
    console.log('▶ Teste 4: toXLSX com múltiplas planilhas');
    const multiWb = Converter.createWorkbook({
        'Produtos': {
            headers: ['Código', 'Nome'],
            rows: [['P01', 'Teclado'], ['P02', 'Mouse']]
        },
        'Estoque': {
            headers: ['Código', 'Saldo'],
            rows: [['P01', 50], ['P02', 120]]
        }
    });

    const xlsxBuffer = Converter.toXLSX(multiWb, { asBuffer: true });
    assert.ok(xlsxBuffer instanceof Uint8Array, 'Deve gerar Uint8Array binário');
    assert.ok(xlsxBuffer.length > 500, 'Tamanho do arquivo deve ser consistente');

    // Inspecionar arquivos descompactados do micro-zip
    const unzipped = await Converter._readZip(xlsxBuffer);
    assert.ok(unzipped['xl/worksheets/sheet1.xml'], 'Deve conter sheet1.xml');
    assert.ok(unzipped['xl/worksheets/sheet2.xml'], 'Deve conter sheet2.xml');
    assert.ok(unzipped['xl/workbook.xml'], 'Deve conter workbook.xml');

    const workbookXML = unzipped['xl/workbook.xml'];
    assert.ok(workbookXML.includes('name="Produtos"'), 'workbook.xml deve referenciar aba Produtos');
    assert.ok(workbookXML.includes('name="Estoque"'), 'workbook.xml deve referenciar aba Estoque');
    assert.ok(workbookXML.includes('sheetId="1"'), 'sheetId 1 presente');
    assert.ok(workbookXML.includes('sheetId="2"'), 'sheetId 2 presente');

    const contentTypesXML = unzipped['[Content_Types].xml'];
    assert.ok(contentTypesXML.includes('/xl/worksheets/sheet1.xml'), 'Content_Types deve registrar sheet1');
    assert.ok(contentTypesXML.includes('/xl/worksheets/sheet2.xml'), 'Content_Types deve registrar sheet2');
    console.log('  ✓ Passou');

    // ----------------------------------------------------
    // Teste 5: Leitura de XLSX Multi-Aba (fromXLSX) Round-Trip
    // ----------------------------------------------------
    console.log('▶ Teste 5: fromXLSX descobrindo dinamicamente múltiplas abas');
    const parsedWb = await Converter.fromXLSX(xlsxBuffer);

    assert.ok(parsedWb.sheets, 'Objeto .sheets deve estar preenchido');
    assert.deepStrictEqual(parsedWb.sheetNames, ['Produtos', 'Estoque'], 'sheetNames deve recuperar os nomes das abas');
    assert.strictEqual(parsedWb.activeSheet, 'Produtos', 'Aba ativa padrão');

    // Verificar dados da primeira aba
    assert.deepStrictEqual(parsedWb.headers, ['Código', 'Nome']);
    assert.strictEqual(parsedWb.rows.length, 2);
    assert.strictEqual(parsedWb.rows[0][1], 'Teclado');

    // Verificar dados da segunda aba via .sheets
    const estoqueSheet = parsedWb.sheets['Estoque'];
    assert.ok(estoqueSheet, 'Aba Estoque deve existir');
    assert.deepStrictEqual(estoqueSheet.headers, ['Código', 'Saldo']);
    assert.strictEqual(estoqueSheet.rows.length, 2);
    assert.strictEqual(estoqueSheet.rows[1][1], 120);

    // Testar leitura com sheetName específico
    const estoqueDirect = await Converter.fromXLSX(xlsxBuffer, { sheetName: 'Estoque' });
    assert.strictEqual(estoqueDirect.activeSheet, 'Estoque');
    assert.deepStrictEqual(estoqueDirect.headers, ['Código', 'Saldo']);
    assert.strictEqual(estoqueDirect.rows[0][1], 50);
    console.log('  ✓ Passou');

    // ----------------------------------------------------
    // Teste 6: Multi-Aba no XML Spreadsheet 2003 (toXLS)
    // ----------------------------------------------------
    console.log('▶ Teste 6: toXLS com múltiplos <Worksheet>');
    const xlsXML = Converter.toXLS(multiWb, { raw: true });
    assert.ok(xlsXML.includes('<Worksheet ss:Name="Produtos">'), 'Deve conter Worksheet Produtos');
    assert.ok(xlsXML.includes('<Worksheet ss:Name="Estoque">'), 'Deve conter Worksheet Estoque');
    console.log('  ✓ Passou');

    // ----------------------------------------------------
    // Teste 7: FramePER.Dialog API Interativa
    // ----------------------------------------------------
    console.log('▶ Teste 7: FramePER.Dialog (prompt, confirm, alert)');
    assert.ok(FramePER.Dialog, 'FramePER.Dialog deve existir');
    assert.strictEqual(typeof FramePER.Dialog.prompt, 'function');
    assert.strictEqual(typeof FramePER.Dialog.confirm, 'function');
    assert.strictEqual(typeof FramePER.Dialog.alert, 'function');
    console.log('  ✓ Passou');

    console.log('\n🎉 TODOS OS TESTES DE MULTI-SHEET E DIALOG PASSARAM COM SUCESSO!\n');
}

runTests().catch(err => {
    console.error('❌ Falha nos testes de Multi-Sheet:', err);
    process.exit(1);
});
