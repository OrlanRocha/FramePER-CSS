# Plano de Implementação: Conversor Universal de Dados (FramePER.Converter)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir do zero o subsistema `FramePER.Converter` para conversão e exportação tabular bidirecional entre XLSX, XLS, CSV, PDF, JSON e XML 100% nativo no navegador (zero dependências) acompanhado de uma interface web interativa em `demo/converter.html`.

**Architecture:** Implementação baseada em modelo intermediário único `Dataset { headers, rows, title, metadata }`. Parsers e geradores isolados para cada formato, incluindo micro-engine ZIP (Store mode) para `.xlsx`, gerador vetorial de `.pdf` nativo (especificação PDF 1.4), XML Spreadsheet 2003 para `.xls`, e RFC 4180 para `.csv`.

**Tech Stack:** JavaScript Vanilla (ES6+), ArrayBuffer, DataView, Uint8Array, DOMParser, Blob, URL.createObjectURL. Zero bibliotecas externas.

**Spec:** `docs/superpowers/specs/2026-10-14-universal-data-converter-design.md`

## Global Constraints
- Zero dependências de pacotes externos em runtime (sem SheetJS, sem jsPDF, sem Papaparse).
- Todos os arquivos `.xlsx` e `.pdf` devem ser Blobs binários válidos abertos por softwares oficiais (Excel, Acrobat, Sheets).
- Suporte a acentuação e caracteres PT-BR garantido via UTF-8 BOM em CSV e codificação padrão nos demais formatos.

## Review Focus
1. Caracteres especiais e aspas dentro de células CSV (vírgulas, ponto-e-vírgula, aspas duplas, quebras de linha).
2. Validade estrutural do arquivo ZIP do XLSX (cabeçalhos locais, diretório central e CRC32).
3. Paginação correta no gerador PDF 1.4 quando os dados ultrapassam a altura útil de uma página A4.
4. Robustez do parser de XML quando os registros contêm nós filhos variados ou atributos.
5. Download compatível em diferentes navegadores sem vazamento de memória (`URL.revokeObjectURL`).

---

### Task 1: Modelo Intermediário Dataset e Normalizadores de Entrada

**Files:**
- Modify: `src/js/framePER.js`
- Create: `tests/test-converter.js`

**Interfaces:**
- Produces: `FramePER.Converter.parse(input, options) -> Dataset`
- Dataset: `{ headers: string[], rows: (string|number)[][], title?: string, metadata: object }`

- [ ] **Step 1: Escrever teste de normalização de entradas**
  Em `tests/test-converter.js`, testar normalização de:
  1. Array de objetos: `[{ id: 1, nome: 'Ana' }, { id: 2, nome: 'Beto' }]` -> headers `['id', 'nome']`, 2 rows.
  2. Matriz 2D: `[['id', 'nome'], [1, 'Ana']]` -> headers `['id', 'nome']`, 1 row.
  3. String CSV: `"id,nome\n1,Ana\n2,Beto"` -> headers `['id', 'nome']`, 2 rows.
  4. String JSON: `'[{"id":1,"nome":"Ana"}]'` -> headers `['id', 'nome']`, 1 row.
  5. String XML: `'<root><row><id>1</id><nome>Ana</nome></row></root>'` -> headers `['id', 'nome']`, 1 row.

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter.js`
  Esperado: FAIL (FramePER.Converter não definido).

- [ ] **Step 3: Implementar `FramePER.Converter.parse()` e normalizadores em `src/js/framePER.js`**
  Implementar métodos auxiliares `_parseCSV(text)`, `_parseJSON(text)`, `_parseXML(text)`, `_fromArrayOfObjects(arr)`, `_from2DArray(matrix)` e método principal `parse(input, options)`.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter.js`
  Esperado: PASS (Todos os 5 formatos normalizados corretamente).

- [ ] **Step 5: Commit**
  `git add tests/test-converter.js src/js/framePER.js`
  `git commit -m "feat(converter): implement Dataset intermediate model and input parsers"`

---

### Task 2: Geradores de Texto (CSV, JSON, XML)

**Files:**
- Modify: `src/js/framePER.js`
- Modify: `tests/test-converter.js`

**Interfaces:**
- Consumes: `Dataset` de Task 1
- Produces:
  - `FramePER.Converter.toCSV(dataset, options) -> string`
  - `FramePER.Converter.toJSON(dataset, options) -> string`
  - `FramePER.Converter.toXML(dataset, options) -> string`

- [ ] **Step 1: Adicionar testes de geração CSV, JSON e XML**
  Em `tests/test-converter.js`, testar:
  - `toCSV`: inclusão de BOM `\uFEFF`, escape de aspas `""`, quebras de linha e delimitador personalizável.
  - `toJSON`: retorno de array de objetos identado.
  - `toXML`: tags válidas com escape de caracteres especiais (`&`, `<`, `>`, `"`).

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter.js`
  Esperado: FAIL (`toCSV`, `toJSON`, `toXML` não definidos).

- [ ] **Step 3: Implementar `toCSV`, `toJSON`, `toXML` em `src/js/framePER.js`**
  Implementar lógica de serialização RFC 4180, formatação de tags semânticas `<dataset><record>...` e JSON.stringify seguro.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter.js`
  Esperado: PASS.

- [ ] **Step 5: Commit**
  `git add tests/test-converter.js src/js/framePER.js`
  `git commit -m "feat(converter): implement toCSV, toJSON and toXML generators"`

---

### Task 3: Geradores de Planilhas (XLS e XLSX via Micro-ZIP Nativo)

**Files:**
- Modify: `src/js/framePER.js`
- Modify: `tests/test-converter.js`

**Interfaces:**
- Consumes: `Dataset` de Task 1
- Produces:
  - `FramePER.Converter.toXLS(dataset, options) -> string` (XML Spreadsheet 2003)
  - `FramePER.Converter._crc32(bytes) -> number`
  - `FramePER.Converter._createZip(files) -> Uint8Array`
  - `FramePER.Converter.toXLSX(dataset, options) -> Uint8Array | Blob`

- [ ] **Step 1: Adicionar testes para XLS, CRC32 e Micro-ZIP OpenXML**
  Em `tests/test-converter.js`:
  - Testar `toXLS`: presença de cabeçalho `<?xml ...><Workbook ...>` e namespaces do Excel.
  - Testar `_crc32`: cálculo correto de hash CRC32.
  - Testar `_createZip`: assinatura PK `0x04034b50` e estrutura de arquivo ZIP válida.
  - Testar `toXLSX`: retorno de buffer contendo arquivos OpenXML (`[Content_Types].xml`, `xl/workbook.xml`, `xl/worksheets/sheet1.xml`).

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter.js`
  Esperado: FAIL.

- [ ] **Step 3: Implementar `toXLS`, `_crc32`, `_createZip` e `toXLSX` em `src/js/framePER.js`**
  Implementar:
  1. Construtor XML Spreadsheet 2003 com estilos de células, cores e tipagem.
  2. Gerador PKZIP nativo em modo STORE com DataView/Uint8Array.
  3. Schemas OpenXML minimalistas para planilhas Excel modernas.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter.js`
  Esperado: PASS.

- [ ] **Step 5: Commit**
  `git add tests/test-converter.js src/js/framePER.js`
  `git commit -m "feat(converter): implement native toXLS and toXLSX via micro-zip engine"`

---

### Task 4: Motor Vetorial Nativo de PDF (PDF 1.4 Specification)

**Files:**
- Modify: `src/js/framePER.js`
- Modify: `tests/test-converter.js`

**Interfaces:**
- Consumes: `Dataset` de Task 1
- Produces:
  - `FramePER.Converter.toPDF(dataset, options) -> Uint8Array | Blob`

- [ ] **Step 1: Adicionar teste do gerador PDF 1.4**
  Em `tests/test-converter.js`:
  - Testar cabeçalho `%PDF-1.4`.
  - Testar presença de objetos `Catalog`, `Pages`, `Page`, `Font Helvetica`.
  - Testar presença de tabela `xref` e marcador `%%EOF`.
  - Testar paginação multi-página quando número de linhas ultrapassa a altura de 1 página.

- [ ] **Step 2: Executar teste para verificar falha**
  Executar: `node tests/test-converter.js`
  Esperado: FAIL.

- [ ] **Step 3: Implementar `toPDF` em `src/js/framePER.js`**
  Implementar motor PDF 1.4 nativo em Vanilla JS:
  - Criação de stream de páginas A4.
  - Cálculo proporcional de larguras de colunas.
  - Desenho vetorial de cabeçalho colorido, linhas zebra (`re f`), texto (`BT /F1 9 Tf ... Tj ET`), numeração `Página X de Y` e timestamp.
  - Montagem de tabela de referências cruzadas (`xref`) e trailer com `startxref`.

- [ ] **Step 4: Executar teste para verificar aprovação**
  Executar: `node tests/test-converter.js`
  Esperado: PASS.

- [ ] **Step 5: Commit**
  `git add tests/test-converter.js src/js/framePER.js`
  `git commit -m "feat(converter): implement native vector PDF 1.4 generator with multi-page support"`

---

### Task 5: Utilitários de Download, Leitura de Arquivos e API Unificada

**Files:**
- Modify: `src/js/framePER.js`
- Modify: `tests/test-converter.js`

**Interfaces:**
- Produces:
  - `FramePER.Converter.download(filename, content, mimeType)`
  - `FramePER.Converter.readFile(file) -> Promise<Dataset>`
  - `FramePER.Converter.convert(input, targetFormat, options) -> Promise<{ blob, filename, download }>`

- [ ] **Step 1: Adicionar testes de resolução de MIME types e API `convert`**
  Em `tests/test-converter.js`, testar mapeamento de extensões e despacho de conversões diretas.

- [ ] **Step 2: Implementar métodos em `src/js/framePER.js`**
  Implementar:
  - `download(filename, content, mimeType)` com `URL.createObjectURL` e limpeza automática via `setTimeout(URL.revokeObjectURL)`.
  - `readFile(file)` para leitura de arquivos `File` do navegador via `FileReader`.
  - `convert(input, targetFormat, options)` orquestrando parse e exportação.
  - Exposição em `window.FramePER.Converter` e `window.FramePERConverter`.

- [ ] **Step 3: Executar testes**
  Executar: `node tests/test-converter.js`
  Esperado: PASS.

- [ ] **Step 4: Commit**
  `git add tests/test-converter.js src/js/framePER.js`
  `git commit -m "feat(converter): add file reader, browser downloader and unified convert API"`

---

### Task 6: Interface Visual Dedicada (`demo/converter.html`)

**Files:**
- Create: `demo/converter.html`
- Modify: `demo/demo.js`
- Modify: `demo/index.html`

**Interfaces:**
- Consumes: `FramePER.Converter`, `FramePER.Confetti`, `FramePER.Notify`

- [ ] **Step 1: Criar estrutura HTML de `demo/converter.html`**
  - Header FramePER com alternância de Dark Mode.
  - Hero banner com selos `v2.26.0` e "100% Client-Side / Zero Dependências".
  - Zona interativa de Drag & Drop para arquivos (arrastar ou clicar para selecionar).
  - Abas para entrada: "Upload de Arquivo", "Colar Texto / Dados Brutos", "Carregar Exemplos Prontos" (Vendas, Clientes, Produtos).
  - Painel de métricas (registros, colunas, tamanho, tipo).
  - Preview interativo da tabela com paginação e busca instantânea.
  - Grade com 6 Cards de Exportação com 1 clique (`XLSX`, `XLS`, `CSV`, `PDF`, `JSON`, `XML`).

- [ ] **Step 2: Implementar interações em `demo/converter.html` e `demo/demo.js`**
  - Manipulação de eventos `dragover`, `dragleave`, `drop` com feedback visual.
  - Leitura assíncrona do arquivo com `FramePER.Converter.readFile()`.
  - Renderização fluida da tabela de preview.
  - Disparo de download em 1 clique com celebração comemorativa via `FramePER.Confetti.burst()`.
  - Toasts de notificação via `FramePER.Notify.success()`.

- [ ] **Step 3: Adicionar link para o conversor em `demo/index.html` e barra de navegação**
  Inserir card de destaque no catálogo de componentes e menu superior.

- [ ] **Step 4: Verificar no navegador e commit**
  `git add demo/converter.html demo/demo.js demo/index.html`
  `git commit -m "feat(converter): create interactive multi-format converter UI in demo/converter.html"`

---

### Task 7: Build, Documentação e Sincronização do GitHub Wiki

**Files:**
- Modify: `package.json`
- Modify: `wiki/Componentes-Avancados-JS.md`
- Modify: `wiki/_Sidebar.md`
- Run: `npm run build`
- Run: `npm run wiki:sync`

- [ ] **Step 1: Executar build completo de distribuição**
  Executar: `npm run build`
  Verificar se `dist/framePER.js`, `dist/framePER.min.js`, e CSS foram compilados com sucesso.

- [ ] **Step 2: Atualizar documentação técnica no Wiki**
  Documentar o módulo `FramePER.Converter` em `wiki/Componentes-Avancados-JS.md` com exemplos de código para todos os 6 formatos e atualizar `wiki/_Sidebar.md`.

- [ ] **Step 3: Sincronizar wiki com o repositório GitHub**
  Executar: `npm run wiki:sync`
  Verificar sincronização bem-sucedida.

- [ ] **Step 4: Commit e Push para origin main**
  `git add .`
  `git commit -m "docs(wiki): document FramePER.Converter multi-format engine and sync wiki"`
  `git push origin main`
