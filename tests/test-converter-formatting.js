/**
 * Testes Automatizados para Formatação Condicional no FramePER.Converter
 * Validação de operadores relacionais, textuais, estatísticos, duplicados e escala de cores.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Carregar FramePER
const framePerPath = path.resolve(__dirname, '../src/js/framePER.js');
const framePerCode = fs.readFileSync(framePerPath, 'utf8');

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

console.log('🧪 Iniciando Testes de Formatação Condicional no FramePER.Converter...\n');

const sampleData = {
    title: 'Produtos_Estoque',
    headers: ['ID', 'Produto', 'Categoria', 'Preco', 'Estoque', 'Status'],
    rows: [
        [101, 'Notebook Pro', 'Eletrônicos', 4500.00, 15, 'Disponível'],
        [102, 'Mouse Sem Fio', 'Acessórios', 89.90, 42, 'Disponível'],
        [103, 'Teclado Mecânico', 'Acessórios', 299.90, 0, 'Esgotado'],
        [104, 'Monitor 27', 'Eletrônicos', 1899.00, 8, 'Disponível'],
        [105, 'Cadeira Ergonômica', 'Móveis', 1200.00, 12, 'Pendente'],
        [106, 'Hub USB-C', 'Acessórios', 89.90, 30, 'Disponível'], // Preço duplicado com linha 102
        [107, 'Smartphone', 'Eletrônicos', 3692.69, 5, 'Disponível']
    ]
};

async function runTests() {
    // ▶ Teste 1: Operadores Relacionais Numéricos (greater_than, less_than, between, equal_to)
    console.log('▶ Teste 1: Converter.evaluateConditionalFormatting - Operadores Relacionais Numéricos');
    const relRules = [
        {
            id: 'rule_gt',
            column: 'Preco',
            type: 'greater_than',
            value: 2000,
            style: { bg: '#fee2e2', color: '#b91c1c', bold: true, icon: '▲' },
            enabled: true
        },
        {
            id: 'rule_zero',
            column: 4, // Estoque
            type: 'equal_to',
            value: 0,
            style: { bg: '#fef3c7', color: '#b45309', bold: true, icon: '⚠' },
            enabled: true
        },
        {
            id: 'rule_between',
            column: 'Estoque',
            type: 'between',
            value: [10, 20],
            style: { bg: '#dcfce7', color: '#15803d' },
            enabled: true
        }
    ];

    const styles1 = Converter.evaluateConditionalFormatting(sampleData, relRules);
    assert.ok(styles1, 'Deve retornar mapa de estilos');

    // Linha 0: Preco 4500 > 2000 -> deve ter rule_gt na col 3
    assert.ok(styles1[0] && styles1[0][3], 'Linha 0 Coluna Preco deve ter estilo aplicado');
    assert.strictEqual(styles1[0][3].bg, '#fee2e2');
    assert.strictEqual(styles1[0][3].icon, '▲');

    // Linha 2: Estoque 0 == 0 -> deve ter rule_zero na col 4
    assert.ok(styles1[2] && styles1[2][4], 'Linha 2 Coluna Estoque deve ter alerta de zerado');
    assert.strictEqual(styles1[2][4].icon, '⚠');

    // Linha 0: Estoque 15 between [10, 20] -> deve ter rule_between na col 4
    assert.ok(styles1[0] && styles1[0][4], 'Linha 0 Coluna Estoque deve estar entre 10 e 20');
    assert.strictEqual(styles1[0][4].bg, '#dcfce7');
    console.log('  ✓ Passou');

    // ▶ Teste 2: Operadores de Texto (contains, starts_with, empty)
    console.log('▶ Teste 2: Converter.evaluateConditionalFormatting - Operadores de Texto');
    const textRules = [
        {
            id: 'rule_text_esgotado',
            column: 'Status',
            type: 'contains',
            value: 'Esgotado',
            style: { bg: '#ef4444', color: '#ffffff', bold: true },
            enabled: true
        },
        {
            id: 'rule_cat_eletro',
            column: 'Categoria',
            type: 'starts_with',
            value: 'Eletrô',
            style: { bg: '#dbeafe', color: '#1d4ed8' },
            enabled: true
        }
    ];

    const styles2 = Converter.evaluateConditionalFormatting(sampleData, textRules);
    assert.strictEqual(styles2[2][5].bg, '#ef4444', 'Status Esgotado deve ter fundo vermelho');
    assert.strictEqual(styles2[0][2].bg, '#dbeafe', 'Categoria Eletrônicos deve ter fundo azul');
    console.log('  ✓ Passou');

    // ▶ Teste 3: Operadores Estatísticos (above_average, below_average, top_n)
    console.log('▶ Teste 3: Converter.evaluateConditionalFormatting - Estatísticas (above/below average, top_n)');
    // Média de Preco = (4500 + 89.9 + 299.9 + 1899 + 1200 + 89.9 + 3692.69) / 7 = 1681.64
    const statRules = [
        {
            id: 'rule_above_avg',
            column: 'Preco',
            type: 'above_average',
            style: { bg: '#dcfce7', color: '#15803d', bold: true },
            enabled: true
        },
        {
            id: 'rule_top2_estoque',
            column: 'Estoque',
            type: 'top_n',
            value: 2, // 2 maiores: 42 (Mouse) e 30 (Hub)
            style: { bg: '#f3e8ff', color: '#6b21a8', icon: '★' },
            enabled: true
        }
    ];

    const styles3 = Converter.evaluateConditionalFormatting(sampleData, statRules);
    // Linha 0 (Preco 4500) e Linha 6 (Preco 3692.69) e Linha 3 (1899) estão acima da média (1681.64)
    assert.ok(styles3[0] && styles3[0][3], '4500 deve estar acima da média');
    assert.ok(styles3[6] && styles3[6][3], '3692.69 deve estar acima da média');
    assert.ok(!styles3[1]?.[3], '89.90 não deve estar acima da média');

    // Top 2 estoque: Linha 1 (42) e Linha 5 (30)
    assert.strictEqual(styles3[1][4].icon, '★', 'Estoque 42 deve estar no top 2');
    assert.strictEqual(styles3[5][4].icon, '★', 'Estoque 30 deve estar no top 2');
    console.log('  ✓ Passou');

    // ▶ Teste 4: Identificação de Duplicados e Únicos
    console.log('▶ Teste 4: Converter.evaluateConditionalFormatting - Duplicados e Únicos');
    const dupRules = [
        {
            id: 'rule_dup_preco',
            column: 'Preco',
            type: 'duplicates',
            style: { bg: '#fef3c7', color: '#b45309', icon: '●' },
            enabled: true
        }
    ];

    const styles4 = Converter.evaluateConditionalFormatting(sampleData, dupRules);
    // Linhas 1 e 5 possuem Preco 89.90 (duplicado)
    assert.ok(styles4[1] && styles4[1][3], 'Preço 89.90 da linha 1 deve ser marcado como duplicado');
    assert.ok(styles4[5] && styles4[5][3], 'Preço 89.90 da linha 5 deve ser marcado como duplicado');
    assert.ok(!styles4[0]?.[3], 'Preço 4500 é único, não deve ser marcado como duplicado');
    console.log('  ✓ Passou');

    // ▶ Teste 5: Escala de Cores (Heatmap / color_scale)
    console.log('▶ Teste 5: Converter.evaluateConditionalFormatting - Escala de Cores (color_scale)');
    const scaleRules = [
        {
            id: 'rule_scale_estoque',
            column: 'Estoque',
            type: 'color_scale',
            style: {
                minColor: '#ef4444', // Vermelho para menor estoque (0)
                midColor: '#fef3c7', // Amarelo para mediano
                maxColor: '#22c55e'  // Verde para maior estoque (42)
            },
            enabled: true
        }
    ];

    const styles5 = Converter.evaluateConditionalFormatting(sampleData, scaleRules);
    // Linha 2 (Estoque 0 - mínimo) deve ter tom vermelho
    assert.ok(styles5[2] && styles5[2][4], 'Mínimo deve ter cor gerada');
    assert.strictEqual(styles5[2][4].bg.toLowerCase(), '#ef4444');
    // Linha 1 (Estoque 42 - máximo) deve ter tom verde
    assert.ok(styles5[1] && styles5[1][4], 'Máximo deve ter cor gerada');
    assert.strictEqual(styles5[1][4].bg.toLowerCase(), '#22c55e');
    console.log('  ✓ Passou');

    // ▶ Teste 6: Prioridade de Regras e Regra Desativada (enabled: false)
    console.log('▶ Teste 6: Converter.evaluateConditionalFormatting - Prioridade e Regras Inativas');
    const priorityRules = [
        {
            id: 'rule_inactive',
            column: 'Status',
            type: 'contains',
            value: 'Disponível',
            style: { bg: '#111111' },
            enabled: false // Desativada!
        },
        {
            id: 'rule_high_priority',
            column: 'Status',
            type: 'equal_to',
            value: 'Disponível',
            style: { bg: '#22c55e', color: '#ffffff' },
            enabled: true
        },
        {
            id: 'rule_lower_priority',
            column: 'Status',
            type: 'contains',
            value: 'Disponível',
            style: { bg: '#3b82f6', color: '#ffffff' },
            enabled: true
        }
    ];

    const styles6 = Converter.evaluateConditionalFormatting(sampleData, priorityRules);
    assert.strictEqual(styles6[0][5].bg, '#22c55e', 'Regra de maior prioridade deve vencer');
    assert.notStrictEqual(styles6[0][5].bg, '#111111', 'Regra inativa não deve ser aplicada');
    console.log('  ✓ Passou');

    console.log('\n🎉 TODOS OS TESTES DA TASK 1 PASSARAM COM SUCESSO!\n');

    // ▶ Teste 7: toXLS com formattingRules / cellStyles
    console.log('▶ Teste 7: Converter.toXLS com formatação condicional');
    const exportRules = [
        {
            id: 'r_esgotado',
            column: 'Status',
            type: 'equal_to',
            value: 'Esgotado',
            style: { bg: '#fee2e2', color: '#b91c1c', bold: true },
            enabled: true
        }
    ];
    const xlsOutput = Converter.toXLS(sampleData, { formattingRules: exportRules });
    assert.ok(xlsOutput.includes('#fee2e2') || xlsOutput.includes('#FEE2E2'), 'XLS deve conter cor de fundo da regra em Styles');
    assert.ok(xlsOutput.includes('Esgotado'), 'XLS deve conter a célula com Status Esgotado');
    console.log('  ✓ Passou');

    // ▶ Teste 8: toXLSX com formattingRules / cellStyles e round-trip com fromXLSX
    console.log('▶ Teste 8: Converter.toXLSX com formatação condicional');
    const xlsxBuffer = Converter.toXLSX(sampleData, { formattingRules: exportRules, asBlob: false });
    assert.ok(xlsxBuffer instanceof Uint8Array, 'Deve retornar buffer XLSX válido');
    const readBack = await Converter.fromXLSX(xlsxBuffer);
    assert.strictEqual(readBack.rows.length, sampleData.rows.length, 'XLSX lido de volta deve ter mesmo número de linhas');
    console.log('  ✓ Passou');

    // ▶ Teste 9: toPDF com formattingRules / cellStyles
    console.log('▶ Teste 9: Converter.toPDF com formatação condicional');
    const pdfBytes = Converter.toPDF(sampleData, { formattingRules: exportRules, asBuffer: true });
    assert.ok(pdfBytes instanceof Uint8Array, 'Deve retornar buffer PDF válido');
    const pdfText = Buffer.from(pdfBytes).toString('latin1');
    assert.ok(pdfText.includes('%PDF-1.4'), 'PDF deve ter cabeçalho 1.4');
    // #fee2e2 em RGB normalizado: 254/255 = 0.996, 226/255 = 0.886, 226/255 = 0.886
    assert.ok(pdfText.includes('0.996 0.886 0.886 rg'), 'PDF deve conter comando de preenchimento com a cor da regra (#fee2e2)');
    console.log('  ✓ Passou');

    console.log('\n🎉 TODOS OS TESTES DE FORMATAÇÃO E EXPORTAÇÃO PASSARAM COM SUCESSO!\n');
}

runTests().catch(err => {
    console.error('❌ Falha nos testes de formatação condicional:', err);
    process.exit(1);
});
