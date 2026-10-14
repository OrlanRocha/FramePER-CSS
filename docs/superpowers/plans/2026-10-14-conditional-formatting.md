# Formatação Condicional e Alertas Visuais no FramePER Converter - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar um motor completo de formatação condicional declarativa (`Converter.evaluateConditionalFormatting`), suporte a estilização de células nas exportações (XLS, XLSX, PDF), e um modal gerenciador interativo na interface de demonstração (`demo/converter.html`) com recálculo reativo em tempo real.

**Architecture:** O motor `Converter.evaluateConditionalFormatting` recebe um dataset e uma lista de regras declarativas (relacionais, textuais, estatísticas, duplicados e escala de cores), retornando um mapa indexado de estilos por célula `{ [rIdx]: { [cIdx]: { bg, color, bold, icon } } }`. Os exportadores (`toXLS`, `toXLSX`, `toPDF`) injetam esses estilos nativamente nos arquivos gerados, enquanto a interface `demo/converter.html` oferece um modal completo com paletas pré-configuradas e reatividade a cada edição ou filtro.

**Tech Stack:** JavaScript (ES6+ Vanilla, sem dependências), OpenXML para XLSX, SpreadsheetML para XLS, PDF 1.4 Vetorial binário, CSS3/FramePER.

**Spec:** [docs/superpowers/specs/2026-10-14-conditional-formatting-design.md](file:///c:/Codex/FramePER%20CSS/docs/superpowers/specs/2026-10-14-conditional-formatting-design.md)

## Global Constraints

- 100% Client-side, zero dependências externas ou bibliotecas NPM em tempo de execução.
- Estritamente ZERO diálogos nativos do navegador (`window.alert`, `window.prompt`, `window.confirm`). Exclusivamente modais nativos FramePER (`FramePER.Dialog`).
- 100% de compatibilidade retroativa com todas as 10 suítes de teste existentes em `tests/`.
- Suporte a colunas numéricas, monetárias (`R$`), percentuais (`%`) e cronológicas (datas ISO e pt-BR).
- Idioma padrão: Português (UI, mensagens de commit, testes e documentação).

## Review Focus

1. **Valores Nulos e Células Vazias**: Garantir que células vazias (`null`, `undefined`, `""`) não quebrem regras numéricas como `greater_than` ou `less_than`, avaliando como falso a menos que a regra seja `empty`.
2. **Escala de Cores com Valores Iguais**: Quando o valor mínimo e máximo de uma coluna forem idênticos (variação zero), a escala de calor deve aplicar a cor mediana sem divisão por zero (`NaN`).
3. **Múltiplas Regras Conflitantes**: Quando mais de uma regra se aplicar à mesma célula, a regra com maior prioridade (menor índice no array de regras) prevalece.
4. **Filtros e Ordenação Ativos**: As regras avaliadas em `renderTable` devem refletir a linha real do dataset mesmo quando a tabela estiver paginada, filtrada ou ordenada.
5. **Cores Hexadecimais no PDF**: A conversão de cores Hex (`#RRGGBB`) para componentes RGB normalizados do PDF (`[0..1]`) deve tratar corretamente formatos de 3 e 6 dígitos sem corromper o stream vetorial.

---

### Task 1: Motor de Avaliação de Regras (`Converter.evaluateConditionalFormatting`)

**Files:**
- Create: `tests/test-converter-formatting.js`
- Modify: `src/js/framePER.js:10940-11130`

**Interfaces:**
- Produces: `Converter.evaluateConditionalFormatting(dataset, rules, options)`
  - Retorna: `cellStylesMap` `{ [rowIdx]: { [colIdx]: { bg, color, bold, icon, ruleId } } }`
- Operadores suportados:
  - Relacionais: `greater_than`, `less_than`, `between`, `equal_to`, `not_equal`
  - Textuais: `contains`, `not_contains`, `starts_with`, `ends_with`, `empty`, `not_empty`
  - Estatísticos: `above_average`, `below_average`, `top_n`, `bottom_n`
  - Identificação: `duplicates`, `unique`
  - Escala de calor: `color_scale` (gradiente min -> max)

- [ ] **Step 1: Escrever os testes unitários para o motor de formatação condicional**
  Criar `tests/test-converter-formatting.js` com cenários para:
  1. Operadores numéricos (`greater_than`, `less_than`, `between`, `equal_to`).
  2. Operadores de texto (`contains`, `starts_with`, `empty`).
  3. Estatísticas automáticas (`above_average`, `below_average`).
  4. Detecção de duplicados e valores únicos.
  5. Escala de calor (`color_scale`).
  6. Resolução de conflitos de prioridade de regras.

- [ ] **Step 2: Executar teste para verificar falha (RED)**
  Executar: `node tests/test-converter-formatting.js`
  Expected: FAIL com `evaluateConditionalFormatting is not a function`.

- [ ] **Step 3: Implementar `Converter.evaluateConditionalFormatting` em `src/js/framePER.js`**
  Implementar:
  - Normalização do dataset com `this.parse`.
  - Tratamento de colunas por índice, nome ou `*`.
  - Pré-cálculo de métricas por coluna (médias, contagem de ocorrências para duplicados, min/max para escala).
  - Interpolação de cores Hex para gradientes de escala de calor.
  - Avaliação linha por linha e mesclagem de estilo por prioridade.

- [ ] **Step 4: Executar teste para verificar aprovação (GREEN)**
  Executar: `node tests/test-converter-formatting.js`
  Expected: PASS em todos os testes unitários do motor (Testes 1 a 6).

- [ ] **Step 5: Commit**
  `git add tests/test-converter-formatting.js src/js/framePER.js`
  `git commit -m "feat(converter): implementar motor de avaliacao de formatacao condicional"`

---

### Task 2: Propagação de Estilos Condicionais nas Exportações (XLS, XLSX e PDF)

**Files:**
- Modify: `src/js/framePER.js:9130-10170`
- Test: `tests/test-converter-formatting.js`

**Interfaces:**
- Consumes: `Converter.evaluateConditionalFormatting(dataset, rules)`
- Suportar em `toXLS`, `toXLSX`, `toPDF` e `convert`:
  - `options.formattingRules`: array de regras avaliadas durante a exportação.
  - `options.cellStyles`: mapa pré-avaliado de estilos `{ [rowIdx]: { [colIdx]: { bg, color, bold } } }`.

- [ ] **Step 1: Escrever testes de exportação com formatação condicional**
  Adicionar a `tests/test-converter-formatting.js`:
  - Teste 7: `toXLS` contendo estilos de cor gerados e aplicados com `<Interior ss:Color="...">`.
  - Teste 8: `toXLSX` contendo preenchimentos no `styles.xml` e células com `s="..."`.
  - Teste 9: `toPDF` contendo comandos vetoriais de preenchimento de retângulo (`re f`) com cores de alerta.

- [ ] **Step 2: Executar teste para verificar falha (RED)**
  Executar: `node tests/test-converter-formatting.js`
  Expected: FAIL nas asserções de exportação com estilos condicionais.

- [ ] **Step 3: Implementar suporte a formatação condicional nos geradores**
  Em `src/js/framePER.js`:
  - `toXLS`: criar estilos dinâmicos para cores customizadas em `<Styles>` e atribuir às células `<Cell>`.
  - `toXLSX`: registrar novas entradas `<fill>` e `<xf>` em `xl/styles.xml` e referenciar o estilo na tag `<c>`.
  - `toPDF`: desenhar retângulos coloridos de fundo nas células formatadas antes do texto e renderizar texto com contraste adequado.

- [ ] **Step 4: Executar teste para verificar aprovação (GREEN)**
  Executar: `node tests/test-converter-formatting.js`
  Expected: PASS em todos os testes (Testes 1 a 9).

- [ ] **Step 5: Commit**
  `git add tests/test-converter-formatting.js src/js/framePER.js`
  `git commit -m "feat(converter): adicionar suporte a formatacao condicional nas exportacoes XLS, XLSX e PDF"`

---

### Task 3: Estilização do Modal Gerenciador e Destaques Visuais na Demo

**Files:**
- Modify: `demo/converter.html`

**Interfaces:**
- Componentes CSS:
  - `#modal-formatting-rules`: overlay e container de diálogo para gerenciamento de regras.
  - `.formatting-rule-item`: card de regra ativa com chip de cor, switch e botões de reordenação.
  - `.color-palette-btn`: botão seletor de paleta rápida (Sucesso, Crítico, Atenção, Destaque).
  - `.cell-cond-formatted`: classe para células estilizadas na tabela com suporte a badges/ícones.
  - `.rule-icon-badge`: indicador visual dentro da célula.

- [x] **Step 1: Adicionar estilos CSS do modal e das células condicionais em `demo/converter.html`**
  Garantir suporte completo a modo escuro elegante, contraste visual nítido e responsividade.

- [x] **Step 2: Commit**
  `git add demo/converter.html`
  `git commit -m "style(demo): adicionar estilos para modal de formatacao condicional e celulas destacadas"`

---

### Task 4: Integração Interativa e Reativa na Demo (`demo/converter.html`)

**Files:**
- Modify: `demo/converter.html`

**Interfaces:**
- Variáveis de estado:
  - `activeFormattingRules = []`: lista de regras ativas.
  - `activeCellStylesMap = {}`: mapa de estilos calculado sobre o dataset ativo.
- Funções:
  - `renderFormattingRulesModal()`: abre e renderiza o formulário de criação e lista de regras.
  - `applyFormattingRules()`: chama `Converter.evaluateConditionalFormatting` e renderiza a tabela.
  - Sincronização com `renderTable()` para aplicar estilos inline e ícones.
  - Sincronização com os botões de exportação para incluir `formattingRules`.

- [x] **Step 1: Adicionar botão "Formatação Condicional" na barra de ferramentas**
  Incluir botão com ícone de filtros/ajustes e badge contador de regras ativas.

- [x] **Step 2: Implementar estrutura HTML e lógica do Modal Gerenciador**
  Permitir:
  - Selecionar coluna, tipo de regra, valores de corte e paleta ou cores personalizadas.
  - Visualizar prévia instantânea da regra antes de salvar.
  - Listar regras cadastradas com alternância (ligar/desligar), reordenação de prioridade e exclusão.

- [x] **Step 3: Conectar avaliação e aplicação reativa das regras na tabela**
  - Aplicar estilos de fundo, texto, negrito e ícones em `renderTable()`.
  - Recalcular estilos automaticamente ao editar células (`focusout`), aplicar filtros de coluna ou mudar de aba de planilha.

- [x] **Step 4: Repassar regras ativas para os manipuladores de exportação**
  Garantir que as exportações gerem arquivos formatados respeitando as regras ativas na demo.

- [x] **Step 5: Commit**
  `git add demo/converter.html`
  `git commit -m "feat(demo): integrar modal gerenciador e formatacao condicional reativa na tabela e exportacoes"`

---

### Task 5: Build Final, Validação de Todas as 11 Suítes e Deploy

**Files:**
- Modify: `dist/*`
- Test: Todas as 11 suítes em `tests/`

- [x] **Step 1: Executar todas as 11 suítes de testes**
  Executar:
  `node tests/test-converter.js; node tests/test-datagrid-export.js; node tests/test-xlsx-reader.js; node tests/test-converter-editing.js; node tests/test-converter-charts.js; node tests/test-datagrid-import.js; node tests/test-converter-batch.js; node tests/test-converter-multisheet.js; node tests/test-converter-filtersort.js; node tests/test-converter-summary.js; node tests/test-converter-formatting.js`
  Expected: Todos os testes passando com sucesso.

- [x] **Step 2: Executar build de produção**
  `npm run build`
  Expected: Arquivos minificados atualizados em `dist/`.

- [x] **Step 3: Commit e Push**
  `git add .`
  `git commit -m "feat(converter): consolidar formatacao condicional e alertas visuais no ecossistema FramePER"`
  `git push origin main`
