# Plano de Implementação: Ordenação Multi-Coluna e Popover de Filtro por Cabeçalho

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar motor nativo de ordenação multi-coluna inteligente (`Converter.sort`), extração de valores distintos (`Converter.getDistinctValues`) e filtragem avançada por condições e checklist (`Converter.filter`), integrando na interface da tabela (`demo/converter.html`) cabeçalhos interativos com ordenação ao clicar e um popover moderno de filtros estilo Excel.

**Architecture:** O `FramePER.Converter` recebe métodos puros que operam sobre o modelo `Dataset`. A ordenação detecta automaticamente se uma coluna é numérica, data ou texto para aplicar a comparação correta. A filtragem suporta operadores relacionais e conjuntos de valores selecionados (`operator: 'in'`). Na demo, os cabeçalhos das colunas exibem controles interativos de ordenação e popovers flutuantes estilizados com o design escuro do FramePER CSS.

**Tech Stack:** JavaScript Vanilla (ES6+), CSS/SCSS, DOM Events, HTML5. Zero bibliotecas externas.

**Spec:** Compatível com os padrões de ordenação e filtragem de DataGrids profissionais (como ag-Grid e Excel Data Filters).

## Global Constraints
- 100% Client-side e zero dependências externas.
- Zero popups nativos do navegador (`window.prompt`, `window.alert`, `window.confirm`). Usar exclusivamente modais/popovers FramePER.
- Compatibilidade com edições de células e alternância de múltiplas planilhas (Worksheets).
- Manter 100% de retrocompatibilidade com todas as 8 suítes de testes anteriores.

## Review Focus
1. Ordenação de colunas com valores monetários ou formatados (ex: `R$ 1.200,00` vs `R$ 450,00`).
2. Ordenação de colunas com células vazias ou nulas (devem ir para o final tanto em ASC quanto em DESC).
3. Filtragem de colunas combinando múltiplos critérios simultâneos (ex: Departamento = "Engenharia" E Salário > 10000).
4. Popover de filtro fechando adequadamente com clique fora ou tecla Esc sem vazar event listeners.
5. Sincronização em tempo real do gráfico e da barra de métricas quando filtros forem aplicados ou removidos.

---

### Task 1: Motor de Ordenação Inteligente Multi-Coluna (`Converter.sort`)

**Files:**
- Modify: `src/js/framePER.js`
- Create: `tests/test-converter-filtersort.js`

**Interfaces:**
- Produces:
  - `Converter.sort(dataset: Dataset, sortRules: Array|Object|string, options?: Object): Dataset`
  - `sortRules`: `[{ column: string|number, order: 'asc'|'desc' }]` ou `{ column, order }` ou `'Coluna'`

- [x] **Step 1: Escrever teste de ordenação inteligente**
  Em `tests/test-converter-filtersort.js`, criar testes para:
  1. Ordenação ascendente e descendente de números puros e formatados.
  2. Ordenação de textos respeitando acentuação e locale.
  3. Ordenação de datas em formato ISO (`YYYY-MM-DD`).
  4. Ordenação multi-coluna (ex: Cidade ASC, depois Valor DESC).
  5. Tratamento de valores vazios/nulos ordenados no final.

- [x] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter-filtersort.js`
  Expected: FAIL com `Converter.sort is not a function`.

- [x] **Step 3: Implementar `Converter.sort` em `src/js/framePER.js`**
  Implementar inferência de tipo por coluna (`_inferColumnType`), comparador multi-critério e método `sort`.

- [x] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter-filtersort.js`
  Expected: PASS nos testes de ordenação.

- [x] **Step 5: Commit**
  `git add tests/test-converter-filtersort.js src/js/framePER.js`
  `git commit -m "feat(converter): implementar ordenacao inteligente multi-coluna"`

---

### Task 2: Extração de Valores Únicos e Motor de Filtros (`Converter.getDistinctValues` e `Converter.filter`)

**Files:**
- Modify: `src/js/framePER.js`
- Test: `tests/test-converter-filtersort.js`

**Interfaces:**
- Produces:
  - `Converter.getDistinctValues(dataset: Dataset, column: string|number): Array<{ value: any, count: number }>`
  - `Converter.filter(dataset: Dataset, rules: Array|Object, options?: Object): Dataset`

- [x] **Step 1: Escrever testes de filtragem e valores distintos**
  Em `tests/test-converter-filtersort.js`, adicionar:
  1. `getDistinctValues` retornando valores únicos com suas frequências ordenados alfabeticamente/numericamente.
  2. `filter` com operador `'in'` (lista de valores selecionados).
  3. `filter` com operadores condicionais: `'contains'`, `'equals'`, `'greater_than'`, `'less_than'`, `'empty'`, `'not_empty'`.
  4. `filter` combinando regras em múltiplas colunas simultâneas (conjunção AND).

- [x] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter-filtersort.js`
  Expected: FAIL com métodos não definidos.

- [x] **Step 3: Implementar `getDistinctValues` e `filter` em `src/js/framePER.js`**
  Implementar extração de valores distintos e avaliador de operadores de filtro.

- [x] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter-filtersort.js`
  Expected: PASS em todos os testes unitários de filtros.

- [x] **Step 5: Commit**
  `git add tests/test-converter-filtersort.js src/js/framePER.js`
  `git commit -m "feat(converter): implementar getDistinctValues e motor de filtros por condicao e checklist"`

---

### Task 3: Estilização do Popover de Filtro e Indicadores nos Cabeçalhos

**Files:**
- Modify: `demo/converter.html`

**Interfaces:**
- Componentes CSS:
  - `.th-sort-btn`: botão com ícone de ordenação (três estados: neutro, asc, desc).
  - `.th-filter-btn`: botão com ícone de filtro (estado `.active` com destaque visual).
  - `.filter-popover`: popover suspenso posicionado abaixo do cabeçalho da coluna.
  - `.filter-pills-bar`: barra com pílulas dos filtros ativos.

- [x] **Step 1: Adicionar estilos CSS do Popover e Cabeçalhos em `demo/converter.html`**
  Adicionar regras CSS elegantes com o design escuro do FramePER para:
  - Popover flutuante com sombra suave, bordas arredondadas e backdrop.
  - Caixa de busca rápida dentro do popover.
  - Lista com scroll de checkboxes dos valores distintos da coluna.
  - Barra de ações do popover ("Selecionar Todos", "Limpar", "Aplicar").
  - Pílulas de filtros ativos no topo da tabela.

- [x] **Step 2: Commit**
  `git add demo/converter.html`
  `git commit -m "style(demo): adicionar estilos para popover de filtro e ordenacao nos cabecalhos"`

---

### Task 4: Integração Interativa na Tabela da Demo (`demo/converter.html`)

**Files:**
- Modify: `demo/converter.html`

**Interfaces:**
- Variáveis de estado na demo:
  - `activeSortRules`: array com `{ column, order }`.
  - `activeColumnFilters`: objeto `{ [colName]: { operator, value, values } }`.
- Funções:
  - `renderTableHeaders()`: renderiza botões de ordenação e filtro para cada coluna.
  - `openFilterPopover(colIdx, anchorEl)`: abre o popover com valores distintos da coluna.
  - `applyActiveFiltersAndSort()`: aplica filtros e ordenação, atualizando a exibição, paginação e gráfico.
  - `renderActiveFilterPills()`: renderiza tags com os filtros ativos e botão para remover cada um.

- [x] **Step 1: Conectar o clique do cabeçalho à ordenação rápida**
  Clique no cabeçalho alterna: Neutro -> ASC -> DESC -> Neutro.
  Atualiza ícone visual e reordena as linhas da tabela instantaneamente.

- [x] **Step 2: Conectar o botão de filtro ao Popover interativo**
  Clique no ícone de funil abre o popover carregando `Converter.getDistinctValues(currentDataset, colIdx)`:
  - Campo de busca para filtrar valores na lista.
  - Checkboxes para marcar/desmarcar valores.
  - Ao clicar em "Aplicar", atualiza `activeColumnFilters`, renderiza pílula ativa e filtra os dados.

- [x] **Step 3: Adicionar Barra de Pílulas de Filtros Ativos**
  Exibir abaixo da barra de busca global as pílulas dos filtros ativos (ex: `Status: Entregue (x)`).
  Botão "Limpar todos os filtros".

- [x] **Step 4: Sincronizar com Edição de Células, Adição de Linhas e Múltiplas Planilhas**
  Garantir que ao alternar de aba ou editar células os filtros e ordenações continuem coerentes.

- [x] **Step 5: Commit**
  `git add demo/converter.html`
  `git commit -m "feat(demo): integrar ordenacao nos cabecalhos e popover de filtro por coluna"`

---

### Task 5: Build Final, Validação de Todas as 9 Suítes e Deploy

**Files:**
- Modify: `dist/*`
- Test: Todos os 9 arquivos em `tests/`

- [x] **Step 1: Executar todas as 9 suítes de testes**
  `node tests/test-converter.js; node tests/test-datagrid-export.js; node tests/test-xlsx-reader.js; node tests/test-converter-editing.js; node tests/test-converter-charts.js; node tests/test-datagrid-import.js; node tests/test-converter-batch.js; node tests/test-converter-multisheet.js; node tests/test-converter-filtersort.js`
  Expected: Todos os testes passando com sucesso.

- [x] **Step 2: Executar build de produção**
  `npm run build`
  Expected: Bundles atualizados em `dist/`.

- [x] **Step 3: Commit e Push**
  `git add .`
  `git commit -m "feat(converter): consolidar ordenacao multi-coluna e popover de filtros interativos"`
  `git push origin main`
