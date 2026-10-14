# Plano de Implementação: Linha de Totais e Agregações no Rodapé da Tabela (Footer Summary Row)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar motor nativo de agregações estatísticas por coluna (`Converter.aggregate`), linha de rodapé interativa (`tfoot`) na tabela do conversor (`demo/converter.html`) com alternância dinâmica de cálculos (`Soma`, `Média`, `Mín`, `Máx`, `Contagem`) em tempo real com os filtros ativos, e suporte à exportação da linha de resumo nos 6 formatos (XLSX, XLS, CSV, PDF, JSON, XML).

**Architecture:** O `FramePER.Converter` recebe o método puro `aggregate(dataset, config, options)`, que analisa colunas numéricas, monetárias ou datas, calcula as métricas estatísticas e formata os resultados preservando máscaras locais (`R$`, decimais, percentuais). Na interface da tabela, um elemento `tfoot` fixado exibe os totais calculados sobre `filteredRows`, permitindo ao usuário alterar o tipo de agregação por coluna através de controles táteis rápidos.

**Tech Stack:** JavaScript Vanilla (ES6+), CSS/SCSS, HTML5, OpenXML (XLSX), Micro-Zip, PDF 1.4 Vetorial. Zero dependências externas.

**Spec:** Compatível com os padrões de resumo de DataGrids profissionais (como ag-Grid Grand Total Footer e Excel Table Total Row).

## Global Constraints
- 100% Client-side e zero dependências externas.
- Zero popups nativos do navegador (`window.prompt`, `window.alert`, `window.confirm`). Usar exclusivamente modais/popovers FramePER.
- Compatibilidade total com filtros ativos, ordenação multi-coluna, edição de células e múltiplas abas (Worksheets).
- Manter 100% de retrocompatibilidade com todas as 9 suítes de testes anteriores.
- Textos, documentação e mensagens em português.

## Review Focus
1. Agregação correta de colunas com valores monetários ou formatados (ex: `R$ 1.250,50`, `R$ 80,00`).
2. Cálculo de média ignorando células nulas/vazias sem distorcer o divisor.
3. Formatação do resultado herdando automaticamente a máscara da coluna (ex: prefixo `R$`, 2 casas decimais e pontuação brasileira).
4. Sincronização reativa instantânea dos totais ao aplicar filtros, ordenar ou editar células inline.
5. Inclusão da linha de totais nas exportações (CSV, XLSX, XLS e PDF) mantendo a estrutura tabular íntegra.

---

### Task 1: Motor de Agregações de Dataset (`Converter.aggregate`)

**Files:**
- Modify: `src/js/framePER.js`
- Create: `tests/test-converter-summary.js`

**Interfaces:**
- Produces:
  - `Converter.aggregate(dataset: Dataset, config: Object|Array, options?: Object): Object`
  - Retorno: `{ [colIdxOrName]: { type, value, formatted, count } }`
  - Tipos suportados: `'sum'`, `'avg'`, `'min'`, `'max'`, `'count'`, `'count_distinct'`

- [ ] **Step 1: Escrever teste de unidade para `Converter.aggregate`**
  Em `tests/test-converter-summary.js`, criar testes para:
  1. Soma e média de números puros e moedas formatadas (`R$ 1.500,00`).
  2. Mínimo e máximo para números e datas.
  3. Contagem de valores não vazios e contagem distinta.
  4. Detecção e herança automática de formatação (formato monetário brasileiro).
  5. Tratamento de valores nulos e strings vazias sem quebrar o cálculo.

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter-summary.js`
  Expected: FAIL com `Converter.aggregate is not a function`.

- [ ] **Step 3: Implementar `Converter.aggregate` e `_formatAggregateValue` em `src/js/framePER.js`**
  Implementar extração de valores numéricos, acumuladores estatísticos e formatador de saída.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter-summary.js`
  Expected: PASS em todos os testes de agregação.

- [ ] **Step 5: Commit**
  `git add tests/test-converter-summary.js src/js/framePER.js`
  `git commit -m "feat(converter): implementar motor de agregacoes estatisticas por coluna"`

---

### Task 2: Suporte a Linha de Resumo nas Exportações (CSV, XLSX, XLS, PDF)

**Files:**
- Modify: `src/js/framePER.js`
- Test: `tests/test-converter-summary.js`

**Interfaces:**
- Suportar em `toCSV`, `toXLSX`, `toXLS` e `toPDF`:
  - `options.summaryRow`: array ou objeto com os valores formatados do rodapé
  - `options.includeSummary`: booleano para incluir automaticamente a linha agregada

- [ ] **Step 1: Escrever testes para exportação com linha de totais**
  Em `tests/test-converter-summary.js`, testar:
  1. `toCSV` contendo a linha final com totais e rótulo "Total / Resumo".
  2. `toXLS` contendo linha estilizada de rodapé.
  3. `toXLSX` contendo linha final de resumo.
  4. `toPDF` contendo rodapé destacado na tabela.

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter-summary.js`
  Expected: FAIL nas asserções de exportação com summaryRow.

- [ ] **Step 3: Implementar suporte a summaryRow nos geradores em `src/js/framePER.js`**
  Adicionar a linha agregada nos geradores de saída respeitando a formatação de cada formato.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter-summary.js`
  Expected: PASS em todos os testes de exportação com resumo.

- [ ] **Step 5: Commit**
  `git add tests/test-converter-summary.js src/js/framePER.js`
  `git commit -m "feat(converter): adicionar suporte a linha de resumo nas exportacoes CSV, XLS, XLSX e PDF"`

---

### Task 3: Estilização do Rodapé da Tabela (`tfoot`) na Demo

**Files:**
- Modify: `demo/converter.html`

**Interfaces:**
- Componentes CSS:
  - `#preview-tfoot`: rodapé fixado na base do scroll da tabela (`position: sticky; bottom: 0`).
  - `.tfoot-cell`: célula estilizada com fundo destacado e borda superior reforçada.
  - `.summary-badge`: badge interativo com o tipo de agregação (`SOMA`, `MÉDIA`, etc.).
  - `.summary-val`: valor numérico em destaque semibold.
  - `.btn-toggle-summary`: botão na barra de ferramentas para ligar/desligar a linha de rodapé.

- [ ] **Step 1: Adicionar estilos CSS do `tfoot` e controles em `demo/converter.html`**
  Estilizar a linha de resumo com design escuro elegante do FramePER, garantindo visibilidade fixa no scroll horizontal/vertical.

- [ ] **Step 2: Commit**
  `git add demo/converter.html`
  `git commit -m "style(demo): adicionar estilos para linha de resumo e totais no rodape da tabela"`

---

### Task 4: Integração Interativa e Reativa na Demo (`demo/converter.html`)

**Files:**
- Modify: `demo/converter.html`

**Interfaces:**
- Variáveis de estado na demo:
  - `showSummaryRow`: boolean (padrão true quando houver colunas numéricas).
  - `columnAggregations`: objeto `{ [colIdx]: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'none' }`.
- Funções:
  - `renderTableSummary()`: calcula e renderiza o conteúdo do `tfoot` baseado nas linhas filtradas ativas (`filteredRows`).
  - `cycleColumnAggregation(colIdx)`: alterna ciclicamente a agregação da coluna ao clicar no badge.
  - Sincronização com o modal de exportação para incluir totais quando solicitado.

- [ ] **Step 1: Adicionar botão de alternância "Linha de Totais" na barra de ferramentas**
  Permitir ao usuário ocultar ou exibir a linha de resumo com um clique.

- [ ] **Step 2: Renderizar `tfoot` dinâmico em `renderTable`**
  Calcular agregações em tempo real sobre `filteredRows` e renderizar valores formatados com o tipo de cálculo.

- [ ] **Step 3: Conectar clique no badge do rodapé para alternar agregação**
  Permitir alternar entre: `Soma` -> `Média` -> `Mínimo` -> `Máximo` -> `Contagem` -> `Ocultar`.

- [ ] **Step 4: Sincronizar com Edição de Células, Filtros e Abas de Planilhas**
  Recalcular automaticamente o rodapé ao digitar em células, aplicar filtros ou mudar de aba.

- [ ] **Step 5: Integrar nas opções de exportação da demo**
  Passar `summaryRow` para `Converter.convert` / botões de exportação quando a linha de totais estiver visível.

- [ ] **Step 6: Commit**
  `git add demo/converter.html`
  `git commit -m "feat(demo): integrar linha de totais interativa no rodape da tabela e nas exportacoes"`

---

### Task 5: Build Final, Validação de Todas as 10 Suítes e Deploy

**Files:**
- Modify: `dist/*`
- Test: Todos os 10 arquivos em `tests/`

- [ ] **Step 1: Executar todas as 10 suítes de testes**
  `node tests/test-converter.js; node tests/test-datagrid-export.js; node tests/test-xlsx-reader.js; node tests/test-converter-editing.js; node tests/test-converter-charts.js; node tests/test-datagrid-import.js; node tests/test-converter-batch.js; node tests/test-converter-multisheet.js; node tests/test-converter-filtersort.js; node tests/test-converter-summary.js`
  Expected: Todos os testes passando com sucesso.

- [ ] **Step 2: Executar build de produção**
  `npm run build`
  Expected: Bundles atualizados em `dist/`.

- [ ] **Step 3: Commit e Push**
  `git add .`
  `git commit -m "feat(converter): consolidar linha de totais e agregacoes estatisticas no rodape da tabela"`
  `git push origin main`
