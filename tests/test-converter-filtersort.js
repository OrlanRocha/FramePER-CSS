// Testes de Ordenação Multi-Coluna e Motor de Filtros no FramePER.Converter
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

console.log('🧪 Iniciando Testes de Ordenação e Filtros no FramePER.Converter...');

async function runTests() {
    // Dataset base para testes de ordenação
    const sampleData = {
        headers: ['ID', 'Nome', 'Departamento', 'Salario', 'DataAdmissao'],
        rows: [
            [1, 'Carlos Eduardo', 'TI', 7500.50, '2023-03-15'],
            [2, 'Ágata Souza', 'Vendas', 12000.00, '2021-08-01'],
            [3, 'Bruno Silva', 'TI', 5200.00, '2024-01-10'],
            [4, 'Daniela Ramos', 'Vendas', 8500.00, '2022-11-20'],
            [5, 'Álvaro Pereira', 'TI', 12000.00, '2020-05-30'],
            [6, 'Zilda Ferreira', 'RH', null, ''],
            [7, 'Beatriz Lima', 'RH', 4300.00, '2025-02-14']
        ]
    };

    // ▶ Teste 1: Ordenação Numérica Pura e Formatada
    console.log('▶ Teste 1: Converter.sort - Ordenação Numérica ASC e DESC');
    const sortedNumAsc = Converter.sort(sampleData, { column: 'Salario', order: 'asc' });
    assert.strictEqual(sortedNumAsc.rows[0][0], 7, 'Menor salário deve ser Beatriz (4300)');
    assert.strictEqual(sortedNumAsc.rows[1][0], 3, 'Segundo menor salário deve ser Bruno (5200)');
    // O valor null deve ir para o fim
    assert.strictEqual(sortedNumAsc.rows[sortedNumAsc.rows.length - 1][0], 6, 'Salário nulo deve ficar no final em ASC');

    const sortedNumDesc = Converter.sort(sampleData, { column: 'Salario', order: 'desc' });
    assert.ok(sortedNumDesc.rows[0][3] === 12000.00, 'Maior salário deve estar no topo em DESC');
    assert.strictEqual(sortedNumDesc.rows[sortedNumDesc.rows.length - 1][0], 6, 'Salário nulo deve ficar no final em DESC');
    console.log('  ✓ Passou');

    // ▶ Teste 2: Ordenação por Moeda Formatada (ex: R$ 1.500,00 vs R$ 80,00)
    console.log('▶ Teste 2: Converter.sort - Moedas e Números Formatados em String');
    const currencyData = {
        headers: ['Produto', 'Preco'],
        rows: [
            ['Teclado Mecânico', 'R$ 350,00'],
            ['Mouse Gamer', 'R$ 80,50'],
            ['Monitor 4K', 'R$ 2.450,00'],
            ['Notebook Pro', 'R$ 8.900,99']
        ]
    };
    const sortedCurrencyAsc = Converter.sort(currencyData, { column: 'Preco', order: 'asc' });
    assert.strictEqual(sortedCurrencyAsc.rows[0][0], 'Mouse Gamer', 'Menor preço deve ser Mouse (80,50)');
    assert.strictEqual(sortedCurrencyAsc.rows[1][0], 'Teclado Mecânico', 'Segundo deve ser Teclado (350,00)');
    assert.strictEqual(sortedCurrencyAsc.rows[3][0], 'Notebook Pro', 'Maior preço deve ser Notebook');
    console.log('  ✓ Passou');

    // ▶ Teste 3: Ordenação de Textos com Acentos e Locale
    console.log('▶ Teste 3: Converter.sort - Textos com Acentuação e Case-Insensitive');
    const sortedNamesAsc = Converter.sort(sampleData, { column: 'Nome', order: 'asc' });
    // Ágata, Álvaro devem vir antes de Bruno / Carlos respeitando locale pt-BR
    assert.strictEqual(sortedNamesAsc.rows[0][1], 'Ágata Souza', 'Ágata deve ser a primeira');
    assert.strictEqual(sortedNamesAsc.rows[1][1], 'Álvaro Pereira', 'Álvaro deve ser o segundo');
    assert.strictEqual(sortedNamesAsc.rows[2][1], 'Beatriz Lima', 'Beatriz deve ser a terceira');
    console.log('  ✓ Passou');

    // ▶ Teste 4: Ordenação por Datas (ISO e formato brasileiro)
    console.log('▶ Teste 4: Converter.sort - Datas (ISO e PT-BR)');
    const sortedDatesAsc = Converter.sort(sampleData, { column: 'DataAdmissao', order: 'asc' });
    assert.strictEqual(sortedDatesAsc.rows[0][1], 'Álvaro Pereira', 'Álvaro (2020-05-30) é a data mais antiga');
    assert.strictEqual(sortedDatesAsc.rows[sortedDatesAsc.rows.length - 1][1], 'Zilda Ferreira', 'Data vazia deve ir para o final');

    const brDatesData = {
        headers: ['Evento', 'Data'],
        rows: [
            ['Conferência', '25/12/2026'],
            ['Workshop', '05/01/2026'],
            ['Hackathon', '18/06/2026']
        ]
    };
    const sortedBrDates = Converter.sort(brDatesData, { column: 'Data', order: 'asc' });
    assert.strictEqual(sortedBrDates.rows[0][0], 'Workshop', '05/01/2026 é o primeiro evento');
    assert.strictEqual(sortedBrDates.rows[2][0], 'Conferência', '25/12/2026 é o último evento');
    console.log('  ✓ Passou');

    // ▶ Teste 5: Ordenação Multi-Coluna (Ex: Departamento ASC, Salário DESC)
    console.log('▶ Teste 5: Converter.sort - Múltiplas Colunas');
    const multiSorted = Converter.sort(sampleData, [
        { column: 'Departamento', order: 'asc' },
        { column: 'Salario', order: 'desc' }
    ]);
    // Departamentos: RH (Beatriz 4300, Zilda null), TI (Álvaro 12000, Carlos 7500.5, Bruno 5200), Vendas (Ágata 12000, Daniela 8500)
    assert.strictEqual(multiSorted.rows[0][2], 'RH');
    assert.strictEqual(multiSorted.rows[0][1], 'Beatriz Lima');
    assert.strictEqual(multiSorted.rows[1][1], 'Zilda Ferreira');

    assert.strictEqual(multiSorted.rows[2][2], 'TI');
    assert.strictEqual(multiSorted.rows[2][1], 'Álvaro Pereira'); // TI 12000
    assert.strictEqual(multiSorted.rows[3][1], 'Carlos Eduardo'); // TI 7500.5
    assert.strictEqual(multiSorted.rows[4][1], 'Bruno Silva');    // TI 5200

    assert.strictEqual(multiSorted.rows[5][2], 'Vendas');
    assert.strictEqual(multiSorted.rows[5][1], 'Ágata Souza');   // Vendas 12000
    assert.strictEqual(multiSorted.rows[6][1], 'Daniela Ramos'); // Vendas 8500
    console.log('  ✓ Passou');

    // ▶ Teste 6: Imutabilidade do Dataset Original
    console.log('▶ Teste 6: Converter.sort - Imutabilidade');
    assert.strictEqual(sampleData.rows[0][0], 1, 'Dataset original não deve ser modificado');
    console.log('  ✓ Passou');

    console.log('\n🎉 TODOS OS TESTES DE ORDENAÇÃO PASSARAM COM SUCESSO!\n');
}

runTests().catch(err => {
    console.error('❌ Falha nos testes de ordenação e filtros:', err);
    process.exit(1);
});
