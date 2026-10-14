# Especificação Técnica: Conversor Universal de Dados (FramePER.Converter)

**Data:** 14/10/2026  
**Status:** Aprovado para Planejamento  
**Escopo:** Sub-sistema completo de conversão e exportação tabular (XLSX, XLS, CSV, PDF, JSON, XML) e Interface Web Dedicada.

---

## 1. Visão Geral e Objetivos

O **FramePER.Converter** é um subsistema nativo do framework FramePER projetado para manipular, converter, formatar e exportar dados tabulares bidirecionalmente entre 6 formatos cruciais do ecossistema corporativo:
* **XLSX** (Microsoft Excel Moderno / OpenXML)
* **XLS** (Microsoft Excel Clássico / XML Spreadsheet 2003)
* **CSV** (Valores Separados por Vírgula / RFC 4180 com BOM UTF-8)
* **PDF** (Portable Document Format 1.4 Vetorial Nativo)
* **JSON** (JavaScript Object Notation estruturado e identado)
* **XML** (Extensible Markup Language hierárquico e semântico)

### Princípios Inegociáveis
1. **Zero Dependências:** 100% JavaScript Vanilla no navegador, sem uso de bibliotecas externas (SheetJS, jsPDF, PDFMake, Papaparse, etc.).
2. **Execução 100% Client-Side:** Privacidade e segurança absoluta dos dados do usuário, sem tráfego de dados para servidores backend.
3. **Downloads Binários Reais:** Arquivos `.xlsx` e `.pdf` baixados diretamente como Blobs válidos, abrindo em softwares nativos (Excel, Acrobat, Sheets, LibreOffice).

---

## 2. Arquitetura e Modelo Intermediário de Dados

Toda conversão é intermediada pelo objeto canônico **`Dataset`**:

```typescript
interface Dataset {
  title?: string;
  headers: string[];
  rows: (string | number | boolean | null)[][];
  metadata?: {
    totalRows: number;
    totalCols: number;
    detectedType?: string;
    sourceName?: string;
  };
}
```

### Normalizadores de Entrada
O `FramePER.Converter.from(input, formatHint?)` aceita:
1. **Array de Objetos:** `[{ id: 1, nome: "Ana" }, { id: 2, nome: "Carlos" }]`
2. **Matriz 2D:** `[["id", "nome"], [1, "Ana"], [2, "Carlos"]]`
3. **Strings de Texto:** Conteúdo textual bruto de arquivos CSV, JSON ou XML.
4. **Objetos File / Blob:** Lidos via `FileReader` nativo (`readAsText` ou `readAsArrayBuffer`).

---

## 3. Especificações Detalhadas por Formato

### 3.1. CSV (Comma-Separated Values)
* **Parser:** RFC 4180 completo. Suporta aspas duplas de escape (`""`), quebras de linha dentro de células citadas e auto-detecção de delimitador (`,`, `;`, `\t`, `|`).
* **Gerador:** Adiciona delimitador configurável, aspas automáticas em células contendo separadores ou quebras de linha e injeta o cabeçalho **UTF-8 BOM (`\uFEFF`)** para garantir abertura perfeita de caracteres acentuados (PT-BR) no Microsoft Excel.

### 3.2. JSON
* **Parser:** Parse seguro com validação de formato. Detecta listas de objetos, listas de arrays ou objetos com chaves aninhadas (com achatamento automático de 1 nível).
* **Gerador:** Serialização formatada com 2 espaços (`JSON.stringify(data, null, 2)`).

### 3.3. XML
* **Parser:** Utiliza o `DOMParser` nativo do navegador com `mimeType: 'application/xml'`. Localiza o nó raiz e itera por nós filhos repetidos ou pares atributo/valor gerando linhas tabulares.
* **Gerador:** Cria árvore semântica com `<dataset><record><coluna>valor</coluna>...</record></dataset>` com escape automático de caracteres XML (`&`, `<`, `>`, `"`, `'`).

### 3.4. XLS (Microsoft Excel 97-2003)
* **Gerador:** Implementa a especificação oficial **Microsoft XML Spreadsheet 2003** (`urn:schemas-microsoft-com:office:spreadsheet`).
* **Vantagens:** Abre diretamente no Excel sem aviso de corrupção, suporta formatação de cabeçalho (cor primária, negrito), tipos de dados explícitos (`Type="Number"` ou `Type="String"`), e dimensões de colunas.

### 3.5. XLSX (Office Open XML)
* **Micro-Engine ZIP Nativa:** Implementação pura em JS (~90 linhas) do padrão PKZIP com compressão STORE (método 0), construindo cabeçalhos locais, diretório central e registro final de diretório central, com gerador de tabela CRC-32 em tempo real.
* **Estrutura OpenXML Gerada:**
  - `[Content_Types].xml`
  - `_rels/.rels`
  - `xl/workbook.xml`
  - `xl/_rels/workbook.xml.rels`
  - `xl/worksheets/sheet1.xml` com células `<c r="A1" t="inlineStr"><is><t>Valor</t></is></c>` ou `<c r="B1"><v>123.45</v></c>`.
* **Compatibilidade:** Abre no Excel 2007+, Microsoft 365, Google Sheets, LibreOffice Calc e apps mobile de planilhas.

### 3.6. PDF (Portable Document Format 1.4)
* **Motor PDF 1.4 Puro:** Construtor binário/texto nativo da especificação PDF:
  - Header: `%PDF-1.4`
  - Objetos: Catalog, Pages, Page, Font Helvetica, Font Helvetica-Bold
  - Content Stream: Operadores vetoriais nativos de desenho e texto (`re`, `f`, `S`, `BT`, `Tf`, `Td`, `Tj`, `ET`).
* **Layout do Relatório:**
  - Margens padrão A4 (595.28 x 841.89 pt).
  - Cabeçalho elegante com barra de cor primária, título do documento e data/hora.
  - Tabela com colunas calculadas dinamicamente com base na largura do conteúdo.
  - Linhas com efeito zebra alternado (`#f8fafc` / `#ffffff`).
  - Paginação automática multi-páginas quando o número de linhas excede a altura útil da folha.
  - Rodapé fixo com numeração: `Página X de Y` e assinatura `Gerado via FramePER`.

---

## 4. API Pública do Módulo (`FramePER.Converter`)

```javascript
// Métodos Principais
FramePER.Converter.parse(input, options)       // Retorna Dataset normalizado
FramePER.Converter.toCSV(dataset, options)     // Retorna string CSV com BOM
FramePER.Converter.toJSON(dataset, options)    // Retorna string JSON
FramePER.Converter.toXML(dataset, options)     // Retorna string XML
FramePER.Converter.toXLS(dataset, options)     // Retorna string/Blob XLS XML Spreadsheet
FramePER.Converter.toXLSX(dataset, options)    // Retorna Blob binário .xlsx
FramePER.Converter.toPDF(dataset, options)     // Retorna Blob binário .pdf
FramePER.Converter.download(filename, content, mimeType) // Dispara download nativo

// Método Universal Direto
FramePER.Converter.convert(input, targetFormat, options) // Atalho para parse + generate + download
```

---

## 5. Interface Visual do Usuário (`demo/converter.html`)

A página de demonstração e ferramenta de produtividade incluirá:
1. **Barra de Navegação FramePER:** Com alternador de tema claro/escuro e links de retorno.
2. **Hero Header:** Título com badge animada `v2.26.0`, subtítulo explicativo e pilares de privacidade ("100% no seu navegador").
3. **Área de Drag & Drop (Dropzone):**
   - Suporte a arrastar arquivos `.xlsx`, `.xls`, `.csv`, `.json`, `.xml`.
   - Botão para selecionar arquivos do computador.
   - Botões de "Exemplos Prontos" (Ex: Vendas de E-commerce, Lista de Funcionários, Dados Financeiros).
   - Aba para colar texto diretamente (JSON/CSV bruto).
4. **Painel de Métricas do Arquivo:**
   - Total de registros, total de colunas, formato detectado e tamanho aproximado.
5. **Preview Interativo da Tabela:**
   - Tabela estilizada FramePER com busca instantânea e paginação.
6. **Central de Exportação em 1 Clique:**
   - 6 cards/botões de ação direta com ícones vetoriais:
     - `[Baixar XLSX]` (Verde Excel)
     - `[Baixar XLS]` (Verde Claro)
     - `[Baixar CSV]` (Azul Utilitário)
     - `[Baixar PDF]` (Vermelho Documento)
     - `[Baixar JSON]` (Amarelo Código)
     - `[Baixar XML]` (Roxo Estrutura)
   - Disparo de comemoração com Confetti Burst ao concluir a conversão!

---

## 6. Critérios de Sucesso e Verificação

1. **Testes Funcionais:**
   - Conversão de CSV para JSON, XML, XLS, XLSX e PDF.
   - Conversão de JSON para CSV, XLS, XLSX, XML e PDF.
   - Conversão de XML para os demais formatos.
2. **Verificação de Abertura:**
   - Arquivo `.xlsx` gerado deve abrir sem erros no Excel / Google Sheets.
   - Arquivo `.pdf` gerado deve abrir nativamente no navegador e leitores PDF com tabela legível e páginas ordenadas.
   - Arquivo `.csv` gerado deve abrir com acentuação correta no Excel sem corrupção de caracteres.
3. **Build e Bundle:**
   - `npm run build` deve compilar sem nenhum aviso ou quebra.
   - O tamanho do bundle permanece ultraleve e sem pacotes npm externos em runtime.
