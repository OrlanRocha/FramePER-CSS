# Plano de Implementação: Suporte a Múltiplas Planilhas no XLSX (Multi-Sheet / Worksheets)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar suporte completo a múltiplas planilhas (Worksheets) em `FramePER.Converter` (leitura, escrita, manipulação e exportação em `.xlsx` e `.xls`), integrando um navegador de abas estilo Excel na interface interativa da demo (`demo/converter.html`).

**Architecture:** O modelo `Dataset` do FramePER é estendido de maneira não-destrutiva para suportar estrutura de pasta de trabalho (Workbook): um dataset pode conter `.sheets` (dicionário `{ [nomeAba]: Dataset }`), `.sheetNames` (lista ordenada de nomes) e `.activeSheet` (nome da aba ativa). Métodos `toXLSX` e `toXLS` empacotam múltiplos nós de worksheet no OpenXML ZIP e no SpreadsheetML. O leitor `fromXLSX` extrai a lista de planilhas a partir de `xl/workbook.xml` e `xl/_rels/workbook.xml.rels`. A demo ganha uma barra de abas interativa no rodapé da tabela com criação, troca, renomeação e exclusão de abas.

**Tech Stack:** JavaScript Vanilla (ES6+), ArrayBuffer, DataView, Uint8Array, OpenXML SpreadsheetML, DOMParser, SCSS, HTML5. Zero bibliotecas externas.

**Spec:** Baseado na especificação OpenXML ISO/IEC 29500-1 e Microsoft XML Spreadsheet 2003.

## Global Constraints
- Zero dependências de pacotes externos em runtime (sem SheetJS, sem exceljs).
- Retrocompatibilidade estrita: datasets de aba única continuam funcionando exatamente como antes em todas as funções existentes (`convert`, `toCSV`, `toJSON`, `toPDF`, `toChartData`, `DataGrid`).
- Preservação da integridade estrutural do micro-ZIP (cabeçalhos locais, CRC32 por arquivo, diretório central e `[Content_Types].xml`).
- Nomes de abas sanitizados (escape de caracteres XML inválidos e limite de caracteres do Excel).

## Review Focus
1. Arquivos `.xlsx` com relacionamentos fora de ordem ou nomes de abas com acentuação e espaços (ex: "Planilha de Preços 2026").
2. Arquivos `.xlsx` que possuem abas ocultas ou arquivos de folha adicionais sem quebrar a ordenação dos `sheetId`.
3. Alternância entre abas no preview sem perda das edições feitas nas outras abas.
4. Exportação `.xlsx` contendo abas com diferentes quantidades de colunas e linhas.
5. Exportação de formatos que não suportam abas nativamente (como `.csv`, `.json`, `.pdf`): exportar a aba ativa atual ou oferecer contexto claro.

---

### Task 1: API de Gerenciamento de Worksheets no FramePER.Converter

**Files:**
- Modify: `src/js/framePER.js:9000-9200`
- Create: `tests/test-converter-multisheet.js`

**Interfaces:**
- Produces:
  - `Converter.createWorkbook(sheets: Object|Array): Dataset`
  - `Converter.getSheets(dataset: Dataset): Object<string, Dataset>`
  - `Converter.getSheetNames(dataset: Dataset): string[]`
  - `Converter.selectSheet(dataset: Dataset, sheetNameOrIndex: string|number): Dataset`
  - `Converter.addSheet(dataset: Dataset, name: string, data?: any): Dataset`
  - `Converter.removeSheet(dataset: Dataset, name: string): Dataset`
  - `Converter.renameSheet(dataset: Dataset, oldName: string, newName: string): Dataset`

- [ ] **Step 1: Escrever os testes de gerenciamento de Worksheets**
  Em `tests/test-converter-multisheet.js`, testar:
  1. Criação de workbook com `createWorkbook({ 'Vendas': ds1, 'Custos': ds2 })`.
  2. Obtenção de abas com `getSheets` e `getSheetNames`.
  3. Alternância de aba com `selectSheet('Custos')`, verificando que `activeSheet` atualiza e os dados da aba ativa são exibidos.
  4. Adição de nova aba com `addSheet('Metas', ds3)`.
  5. Renomeação de aba com `renameSheet('Metas', 'Metas 2026')`.
  6. Remoção de aba com `removeSheet('Custos')`, impedindo remover a última aba existente.

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter-multisheet.js`
  Expected: FAIL com métodos não definidos.

- [ ] **Step 3: Implementar métodos de gerenciamento de Worksheets em `src/js/framePER.js`**
  Implementar `createWorkbook`, `getSheets`, `getSheetNames`, `selectSheet`, `addSheet`, `removeSheet`, `renameSheet` com validações robustas.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter-multisheet.js`
  Expected: PASS para os testes de gerenciamento de abas.

- [ ] **Step 5: Commit**
  `git add tests/test-converter-multisheet.js src/js/framePER.js`
  `git commit -m "feat(converter): implementar API de gerenciamento de múltiplas planilhas (worksheets)"`

---

### Task 2: Gerador OpenXML Multi-Aba (`toXLSX` e `toXLS`)

**Files:**
- Modify: `src/js/framePER.js:8800-9318`
- Test: `tests/test-converter-multisheet.js`

**Interfaces:**
- Consumes: `Converter.getSheets(dataset)`, `Converter.getSheetNames(dataset)`
- Modifies: `toXLSX(dataset, options)`, `toXLS(dataset, options)`

- [ ] **Step 1: Escrever testes de exportação multi-aba**
  Em `tests/test-converter-multisheet.js`, adicionar:
  1. Teste `toXLSX` recebendo dataset com múltiplas abas (`.sheets`).
  2. Verificar que o ZIP gerado contém `xl/worksheets/sheet1.xml`, `xl/worksheets/sheet2.xml`, etc.
  3. Verificar que `xl/workbook.xml` lista todas as abas com seus respectivos nomes e `sheetId`.
  4. Verificar que `[Content_Types].xml` e `xl/_rels/workbook.xml.rels` contêm os nós necessários para cada aba.
  5. Teste `toXLS` gerando múltiplos `<Worksheet ss:Name="...">` dentro do XML Spreadsheet 2003.

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter-multisheet.js`
  Expected: FAIL (apenas 1 folha é gerada atualmente).

- [ ] **Step 3: Atualizar `toXLSX` e `toXLS` em `src/js/framePER.js`**
  - Em `toXLSX`:
    - Extrair mapa de planilhas via `Converter.getSheets(dataset)`.
    - Se houver mais de uma aba (ou se for workbook), gerar um arquivo `xl/worksheets/sheet${i+1}.xml` para cada aba.
    - Montar `workbook.xml` com `<sheet name="${name}" sheetId="${i+1}" r:id="rId${i+1}"/>`.
    - Atualizar `[Content_Types].xml` com `<Override>` para cada folha gerada.
    - Atualizar `workbook.xml.rels` mapeando cada `rId${i+1}` para seu `worksheets/sheet${i+1}.xml`.
  - Em `toXLS`:
    - Iterar pelas planilhas e gerar um elemento `<Worksheet ss:Name="${escapeXML(name)}"><Table>...</Table></Worksheet>` para cada aba.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter-multisheet.js`
  Expected: PASS para a geração de XLSX e XLS multi-aba.

- [ ] **Step 5: Commit**
  `git add tests/test-converter-multisheet.js src/js/framePER.js`
  `git commit -m "feat(converter): adicionar gerador multi-planilhas para toXLSX e toXLS"`

---

### Task 3: Leitor OpenXML Multi-Aba (`fromXLSX`) com Descoberta Dinâmica de Folhas

**Files:**
- Modify: `src/js/framePER.js:9080-9196`
- Test: `tests/test-converter-multisheet.js`

**Interfaces:**
- Modifies: `fromXLSX(buffer, options): Promise<Dataset>`
- Produces: Dataset da aba ativa com propriedades `.sheets`, `.sheetNames`, `.activeSheet`.

- [ ] **Step 1: Escrever teste de round-trip de leitura multi-aba**
  Em `tests/test-converter-multisheet.js`, adicionar:
  1. Criar workbook com 3 abas ("Resumo", "Detalhes", "Config").
  2. Gerar buffer XLSX via `Converter.toXLSX(wb, { asBuffer: true })`.
  3. Ler o buffer de volta via `Converter.fromXLSX(buffer)`.
  4. Assegurar que `result.sheetNames` é `['Resumo', 'Detalhes', 'Config']`.
  5. Assegurar que `result.sheets['Resumo']`, `result.sheets['Detalhes']` e `result.sheets['Config']` possuem os dados corretos de cabeçalho e linhas.
  6. Testar opção `options.sheetName: 'Detalhes'` retornando diretamente 'Detalhes' como aba ativa.

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter-multisheet.js`
  Expected: FAIL (`fromXLSX` lê apenas a primeira planilha e ignora abas adicionais).

- [ ] **Step 3: Atualizar `fromXLSX` em `src/js/framePER.js`**
  - Parsear `xl/workbook.xml` para encontrar todos os `<sheet name="..." sheetId="..." r:id="..."/>`.
  - Parsear `xl/_rels/workbook.xml.rels` para resolver o `rId` para o caminho correto do arquivo XML (`worksheets/sheetX.xml`).
  - Ler cada arquivo XML de worksheet e construir o grid retangular para cada folha.
  - Criar um objeto de datasets `{ [sheetName]: dataset }`.
  - Definir a aba ativa (`options.sheetName` || `options.sheetIndex` || primeira aba).
  - Anexar `.sheets`, `.sheetNames` e `.activeSheet` ao dataset retornado.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter-multisheet.js`
  Expected: PASS em todos os testes unitários de multi-sheet.

- [ ] **Step 5: Commit**
  `git add tests/test-converter-multisheet.js src/js/framePER.js`
  `git commit -m "feat(converter): implementar leitura e extração multi-planilhas em fromXLSX"`

---

### Task 4: Barra de Abas Interativa (Worksheet Tabs UI) na Demo

**Files:**
- Modify: `demo/converter.html`
- Modify: `src/scss/components/_data-grid.scss` ou estilos em `demo/converter.html`

**Interfaces:**
- Elementos:
  - Container: `#worksheet-tabs-container`
  - Lista de Abas: `#worksheet-tabs-list`
  - Botão Adicionar: `#btn-add-worksheet`
- Eventos:
  - Clique na aba: seleciona a aba via `Converter.selectSheet`, atualiza a tabela, paginação e gráfico.
  - Duplo clique na aba: input inline para renomear a aba.
  - Botão fechar (x) na aba: remove a aba após confirmação.
  - Botão adicionar (+): solicita nome e cria nova aba limpa.

- [ ] **Step 1: Inserir a estrutura HTML e estilos da barra de abas em `demo/converter.html`**
  Adicionar a barra de navegação de planilhas logo abaixo da tabela de preview com visual moderno inspirado no Excel/Google Sheets:
  - Abas em formato de pílula/aba com bordas suaves, aba ativa destacada com badge ou cor primária, indicador do número de linhas por aba.

- [ ] **Step 2: Implementar a lógica de sincronização de abas no script da demo**
  - Função `renderWorksheetTabs()`:
    - Renderiza uma aba para cada entrada de `currentDataset.sheetNames`.
    - Destaca a aba ativa `currentDataset.activeSheet`.
    - Ao clicar em uma aba, invoca `Converter.selectSheet(currentDataset, name)` e re-renderiza a tabela (`renderTable()`) e o gráfico (`renderConverterChart()`).
  - Manipulação de abas:
    - Botão "Nova Aba": insere nova planilha vazia no workbook (`Converter.addSheet`).
    - Botão "Excluir Aba": remove a aba ativa e seleciona a adjacente.
    - Edição inline ou prompt para renomear aba ativa.
  - Sincronização de edições:
    - Todas as adições de linhas, colunas e edição de células feitas no preview são salvas diretamente na aba ativa do `currentDataset`.
  - Exportação:
    - Quando o usuário clica em exportar XLSX, todas as abas criadas ou editadas são empacotadas no mesmo `.xlsx` baixado.

- [ ] **Step 3: Verificar funcionalidade visual e interativa**
  - Compilar os bundles (`npm run build`).
  - Executar os testes em `tests/` e certificar de que todos os 8 arquivos de testes passam 100%.

- [ ] **Step 4: Commit**
  `git add demo/converter.html src/scss/ dist/`
  `git commit -m "feat(demo): adicionar barra de abas interativa multi-planilhas estilo Excel no preview"`

---

### Task 5: Validação Completa, Testes de Regressão e Build Final

**Files:**
- Modify: `dist/*`
- Test: Todos os 8 arquivos em `tests/`

- [ ] **Step 1: Executar todos os testes da suíte completa**
  `node tests/test-converter.js; node tests/test-datagrid-export.js; node tests/test-xlsx-reader.js; node tests/test-converter-editing.js; node tests/test-converter-charts.js; node tests/test-datagrid-import.js; node tests/test-converter-batch.js; node tests/test-converter-multisheet.js`
  Expected: Todos os testes passando sem erros.

- [ ] **Step 2: Executar build de produção**
  `npm run build`
  Expected: Exit code 0, bundles unificados e minificados gerados em `dist/`.

- [ ] **Step 3: Commit e Push**
  `git add .`
  `git commit -m "feat(converter): consolidar suporte a múltiplas planilhas no ecossistema FramePER"`
  `git push origin main`
