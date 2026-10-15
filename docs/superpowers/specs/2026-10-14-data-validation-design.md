# Especificação Técnica: Validação de Dados, Máscaras de Entrada e Auditoria de Integridade

- **Data:** 14 de Outubro de 2026
- **Status:** Aprovado para Planejamento
- **Módulo:** `FramePER.Converter` & `DataGrid`
- **Ambiente:** Client-Side Puro (Navegador & Node.js)
- **Zero Dependências:** 100% Vanilla JS sem pacotes externos

---

## 1. Visão Geral e Objetivos

O objetivo deste subsistema é dotar o motor de conversão e manipulação tabular do FramePER (`FramePER.Converter`) de capacidades completas de **validação declarativa de dados**, **máscaras dinâmicas de digitação**, **auditoria de integridade** e **inferência automática de tipos de colunas**.

### Principais Pilares:
1. **Modo Híbrido Flexível:** Células que violem o padrão esperado são destacadas com borda sutil, ícone de alerta e mensagem explicativa (tooltip), sem travar a digitação ou impedir o fluxo de trabalho do usuário.
2. **Guarda de Exportação Segura:** Ao acionar qualquer exportador (XLSX, XLS, CSV, PDF, JSON, XML), se existirem inconsistências, o sistema exibe um diálogo assíncrono interativo (`FramePER.Dialog.confirm`) permitindo prosseguir ou cancelar para revisão.
3. **Máscaras de Entrada em Tempo Real:** Formatação e sanitização enquanto o usuário digita nos campos editáveis da tabela (CPF, CNPJ, Telefone, CEP, Datas, Moedas).
4. **Auto-Inferência Inteligente de Tipos:** Análise probabilística das linhas iniciais para sugerir automaticamente regras adequadas para cada coluna ao carregar um novo dataset.
5. **Zero Diálogos Nativos do Navegador:** Todo o feedback visual e de confirmação utiliza exclusivamente os componentes estilizados do FramePER (`FramePER.Dialog`, `FramePER.Notify`).

---

## 2. Tipos de Validação e Regras Suportadas

Cada coluna do dataset pode possuir uma ou mais regras de validação associadas em seu schema:

| Tipo (`type`) | Descrição e Critério | Parâmetros Opcionais | Exemplo Válido | Exemplo Inválido |
| :--- | :--- | :--- | :--- | :--- |
| `currency` | Valores monetários com símbolo ou numéricos | `min`, `max` | `R$ 1.250,50`, `1250.50` | `abc`, `R$ -50` (se min >= 0) |
| `date` | Datas no calendário com checagem de dias reais do mês | `format`: `'pt-br'`, `'iso'`, `'any'` | `14/10/2026`, `2026-10-14` | `31/02/2026`, `32/13/2026` |
| `integer` | Números inteiros | `min`, `max` | `42`, `-10` | `3.14`, `dez` |
| `decimal` | Números com casas decimais ou inteiros | `min`, `max`, `precision` | `10.5`, `10,5` | `10.555` (se precision: 2) |
| `email` | Endereço de correio eletrônico em padrão RFC | — | `contato@frameper.dev` | `contato@`, `@dev` |
| `phone` | Telefones fixos e celulares com DDD (10 ou 11 dígitos) | — | `(11) 98765-4321`, `11987654321` | `12345`, `telefone` |
| `cpf` | Cadastro de Pessoa Física com cálculo algorítmico de 11 dígitos | — | `123.456.789-09` (dígitos válidos) | `111.111.111-11`, dígitos inválidos |
| `cnpj` | Cadastro Nacional de PJ com cálculo algorítmico de 14 dígitos | — | `12.345.678/0001-95` (dígitos válidos) | `00.000.000/0000-00`, dígitos inválidos |
| `cep` | Código de Endereçamento Postal brasileiro (8 dígitos) | — | `01310-100`, `01310100` | `123`, `cep-invalido` |
| `enum` | Restrito a uma lista explícita de valores permitidos | `options`: `['A', 'B', ...]` | `'Entregue'`, `'Enviado'` | `'Cancelado'` (se fora da lista) |
| `regex` | Expressão regular personalizada configurada pelo usuário | `pattern`: `string` / `RegExp` | `^[A-Z]{3}-\d{4}$` (Placa) | `123-ABCD` |
| `required` | Impede valores nulos, indefinidos ou strings vazias | — | `'Qualquer texto'`, `0` | `''`, `null`, `undefined` |

---

## 3. Máscaras de Entrada Suportadas (`Converter.applyMask`)

As máscaras formatam o valor enquanto o usuário digita nos campos editáveis da tabela:
- **`cpf`**: `000.000.000-00`
- **`cnpj`**: `00.000.000/0000-00`
- **`phone`**: `(00) 0000-0000` ou `(00) 00000-0000` dinâmico (ajusta 10 ou 11 dígitos)
- **`cep`**: `00000-000`
- **`date`**: `00/00/0000`
- **`currency`**: `R$ #.##0,00`

---

## 4. API Pública do Módulo (`FramePER.Converter`)

### 4.1. `Converter.validateValue(value, rule)`
Avalia um valor individual contra uma regra específica:
```javascript
const result = Converter.validateValue('123.456.789-09', { type: 'cpf', required: true });
// Retorno: { valid: true }
// ou: { valid: false, message: 'Dígitos verificadores do CPF inválidos' }
```

### 4.2. `Converter.validateDataset(dataset, schema, options)`
Avalia todas as células do dataset e retorna o relatório estruturado de auditoria:
```javascript
const schema = {
  "Status": { type: "enum", options: ["Entregue", "Enviado", "Processando"], required: true },
  "Total": { type: "currency", min: 0 },
  "Data": { type: "date", format: "pt-br" },
  "Cliente": { type: "required" }
};

const audit = Converter.validateDataset(dataset, schema);
// Retorno:
// {
//   totalCells: 48,
//   validCells: 46,
//   invalidCells: 2,
//   healthScore: 95.83, // porcentagem 0-100
//   errorsByCell: {
//     "3,1": { row: 3, col: 1, column: "Data", value: "31/02/2026", rule: "date", message: "Data inexistente no calendário" }
//   },
//   errorsByColumn: {
//     "Data": 1,
//     "Status": 1
//   }
// }
```

### 4.3. `Converter.applyMask(value, maskType)`
Aplica máscara visual sem destruir caracteres base:
```javascript
Converter.applyMask('12345678909', 'cpf'); // '123.456.789-09'
Converter.applyMask('11987654321', 'phone'); // '(11) 98765-4321'
```

### 4.4. `Converter.inferSchema(dataset, options)`
Analisa os dados existentes e sugere o schema inicial para as colunas:
```javascript
const inferredSchema = Converter.inferSchema(dataset);
// Retorno: Mapa { [columnName]: { type, required, options... } }
```

---

## 5. Interface com o Usuário e Integração na Tabela (`demo/converter.html`)

### 5.1. Barra de Ferramentas
- Botão **"Integridade de Dados"** (`#btn-data-validation`):
  - Exibe ícone de escudo / verificação e badge dinâmico:
    - `100% Válido` (verde com ícone de check) se não houver erros.
    - `X Inconsistências` (amarelo ou vermelho) com a contagem de falhas.

### 5.2. Células na Tabela
- Células que apresentem erro de validação recebem a classe CSS `.cell-invalid`:
  - Contorno vermelho sutil com transição suave.
  - Indicador de alerta `⚠` e tooltip com o diagnóstico detalhado da regra.
- Durante a edição da célula, se a coluna possuir máscara configurada, a digitação aplica a máscara progressiva.
- Ao perder o foco (`focusout`), a validação da célula e as métricas de integridade são recalculadas reativamente.

### 5.3. Modal Gerenciador de Validação (`#modal-data-validation`)
- Tabela de colunas do dataset com:
  - Nome da coluna.
  - Tipo de Dado / Regra (dropdown com todos os 11 tipos suportados).
  - Checkbox "Obrigatório" (não nulo / não vazio).
  - Configurações complementares dinâmicas (faixa mín/máx, opções enum, padrão regex).
  - Máscara associada de digitação.
  - Botão de "Inferir Automaticamente" para sugerir configurações por amostragem.
  - Botão "Salvar e Aplicar Validações".

### 5.4. Diálogo de Confirmação na Exportação
Ao acionar qualquer exportador:
- Se houver `invalidCells > 0`, um diálogo `FramePER.Dialog.confirm` alerta:
  > *"Existem X células com inconsistências nos dados. Deseja exportar o arquivo mesmo assim ou prefere revisar a tabela?"*
- Botões: *"Exportar Mesmo Assim"* (prossegue normalmente) e *"Revisar Tabela"* (cancela a exportação e foca na tabela).

---

## 6. Estratégia de Testes

Criar o arquivo de testes `tests/test-converter-validation.js` contendo:
1. Validação de tipos numéricos (`currency`, `integer`, `decimal`, limites mín/máx).
2. Validação de datas reais (ISO e PT-BR, meses com 30/31 dias, anos bissextos).
3. Validação de e-mails e telefones.
4. Validação matemática de CPF e CNPJ (dígitos verificadores e sequências inválidas).
5. Validação de enum e regex customizado.
6. Máscaras de entrada (`applyMask`) para CPF, CNPJ, Telefone, CEP e Data.
7. Inferência automática de schema (`inferSchema`).
8. Cálculo de métricas e relatório de integridade (`validateDataset`).
9. Preservação de 100% dos testes existentes das 11 suítes anteriores.
