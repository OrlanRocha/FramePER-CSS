# 📊 Conversor Universal de Dados Tabulares (`FramePER.Converter`)

O módulo `FramePER.Converter` é um motor de processamento e conversão de dados tabulares construído **100% em Vanilla JavaScript**, executado integralmente no cliente (*browser-side*) e com **zero dependências externas**.

Ele permite importar, manipular e converter bidirecionalmente dados entre os 6 principais formatos do mercado:
* 📗 **XLSX** — Microsoft Excel moderno (OpenXML com compressão PKZIP nativa)
* 📊 **XLS** — Microsoft Excel clássico 97-2003 (XML Spreadsheet com estilos e cores)
* 📑 **CSV** — Formato tabular padronizado RFC 4180 com UTF-8 BOM e delimitadores customizáveis
* 📕 **PDF** — Documento impresso vetorial PDF 1.4 nativo com paginação automática multi-página
* 🔣 **JSON** — Coleção estruturada de objetos ou matriz bidimensional para APIs
* 🏷️ **XML** — Árvore semântica com entidades sanitizadas contra vulnerabilidades

---

## 🚀 Vantagens Principais

1. **Privacidade e Segurança Absolutas**: Os arquivos e dados nunca são enviados a servidores externos. Todo o processamento ocorre no motor V8 do próprio navegador.
2. **Zero Dependências Pesadas**: Sem SheetJS/xlsx (1.2MB), sem jsPDF (300KB), sem PapaParse. Economia drástica no bundle.
3. **Micro-Engine ZIP Integrada**: Gerador de arquivos ZIP em modo Store com cálculo de CRC-32 nativo para a criação de pastas de trabalho `.xlsx` válidas.
4. **Gerador Vetorial PDF 1.4**: Emissão direta de streams binários PDF com cabeçalho primário personalizável, linhas zebra, cálculo dinâmico de larguras de coluna e numeração de páginas (`Página X de Y`).
5. **Integração com o Design System**: Acoplamento perfeito com notificações (`FramePER.Notify`) e efeitos festivos de partículas (`FramePER.Confetti`).

---

## 🛠️ Instalação e Disponibilidade

O conversor é exportado automaticamente no namespace global:
```javascript
// Disponível em ambos os formatos:
const Converter = window.FramePER.Converter;
// ou
const Converter = window.FramePERConverter;
```

---

## 📂 Modelo de Dados Intermediário (`Dataset`)

O motor padroniza qualquer dado em um objeto `Dataset` previsível:

```typescript
interface Dataset {
  title?: string;           // Título da planilha / relatório
  headers: string[];        // Lista de títulos das colunas
  rows: any[][];           // Matriz bidimensional de valores das linhas
  metadata?: Record<string, any>;
}
```

---

## 📥 1. Métodos de Importação (Parsing)

### A. A partir de Arquivo (`File` do Navegador)
```javascript
const fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  
  // Lê e detecta automaticamente o formato pela extensão e conteúdo
  const dataset = await FramePER.Converter.readFile(file);
  console.log(`Carregado: ${dataset.rows.length} registros e ${dataset.headers.length} colunas.`);
});
```

### B. A partir de Objetos JavaScript
```javascript
const usuarios = [
  { id: 1, nome: 'Mariana Silva', cargo: 'Engenheira de Software', salario: 14500 },
  { id: 2, nome: 'Carlos Souza', cargo: 'Tech Lead', salario: 16200 }
];

const dataset = FramePER.Converter.normalize(usuarios, { title: 'Quadro de Colaboradores' });
```

### C. A partir de Matriz Bidimensional
```javascript
const matriz = [
  ['Produto', 'Quantidade', 'Preço Unitário'],
  ['Monitor Ultrawide 34', 2, 2800.00],
  ['Teclado Mecânico RGB', 5, 450.00]
];

const dataset = FramePER.Converter.fromArray(matriz, { title: 'Estoque' });
```

### D. A partir de Textos (CSV, JSON, XML)
```javascript
// CSV com auto-detecção de delimitador (, ou ;) e escape RFC 4180
const datasetCSV = FramePER.Converter.fromCSV(textoCSV);

// JSON string (aceita array de objetos ou matriz)
const datasetJSON = FramePER.Converter.fromJSON(textoJSON);

// XML string (usa DOMParser no navegador com fallback regex)
const datasetXML = FramePER.Converter.fromXML(textoXML);
```

### E. A partir de Planilhas Binárias Excel (`.xlsx`)
Motor nativo de leitura OpenXML com suporte a descompressão Deflate (Método 8) e tabela de strings compartilhadas (`xl/sharedStrings.xml`):
```javascript
// ArrayBuffer, Uint8Array ou Buffer
const datasetXLSX = await FramePER.Converter.fromXLSX(meuBuffer, { title: 'Vendas 2026' });

console.log(datasetXLSX.headers); // ['Código', 'Item', 'Preço Unitário']
console.log(datasetXLSX.rows);    // [[101, 'Monitor 4K', 2499.90], ...]
```

---

## 📤 2. Métodos de Exportação e Download

Todos os métodos de exportação aceitam a opção `download: true` para iniciar o download do arquivo automaticamente no navegador.

### 📗 Gerar Excel Moderno (`.xlsx`)
```javascript
FramePER.Converter.toXLSX(dataset, {
  filename: 'relatorio_vendas.xlsx',
  sheetName: 'Vendas 2026',
  download: true
});
```

### 📊 Gerar Excel 97-2003 Clássico (`.xls`)
```javascript
FramePER.Converter.toXLS(dataset, {
  filename: 'planilha_financeira.xls',
  download: true
});
```

### 📑 Gerar CSV Padronizado (`.csv`)
```javascript
FramePER.Converter.toCSV(dataset, {
  filename: 'export_dados.csv',
  delimiter: ';',  // Opcional: ';' ou ',' (padrão ',')
  bom: true,       // Inclui UTF-8 BOM (\uFEFF) para acentos no Excel
  download: true
});
```

### 📕 Gerar Documento PDF Vetorial (`.pdf`)
```javascript
FramePER.Converter.toPDF(dataset, {
  filename: 'relatorio_executivo.pdf',
  title: 'Demonstrativo Contábil Trimestral',
  download: true
});
```

### 🔣 Gerar JSON (`.json`)
```javascript
FramePER.Converter.toJSON(dataset, {
  filename: 'dados.json',
  asArrayOfObjects: true, // true para [{col: val}], false para 2D
  indent: 2,
  download: true
});
```

### 🏷️ Gerar XML Semântico (`.xml`)
```javascript
FramePER.Converter.toXML(dataset, {
  filename: 'dados.xml',
  rootTag: 'relatorio',
  rowTag: 'registro',
  download: true
});
```

---

## ⚡ 3. API Unificada `convert()`

Converte qualquer entrada diretamente para o formato de destino desejado em uma única instrução:

```javascript
// Converte um arquivo enviado diretamente para PDF
const resultado = await FramePER.Converter.convert(meuArquivo, 'pdf', {
  title: 'Exportação em PDF',
  download: true // Baixa automaticamente
});

console.log('MIME gerado:', resultado.mime);
console.log('Arquivo:', resultado.filename);
```

---

## 🖥️ Demonstração Interativa

O FramePER disponibiliza uma interface completa pronta para uso no caminho [`demo/converter.html`](https://orlanrocha.github.io/FramePER/demo/converter.html), contendo:
* Área tátil de Drag & Drop para arquivos locais.
* Editor de texto para colar dados brutos (CSV/JSON/XML).
* Datasets de exemplo prontos para teste imediato.
* Cartões de métricas (registros, colunas, tamanho).
* Tabela de pré-visualização dinâmica com filtro de busca e paginação.
* Grade de 6 cards de exportação rápida com disparo de partículas comemorativas (`FramePER.Confetti.burst()`).
