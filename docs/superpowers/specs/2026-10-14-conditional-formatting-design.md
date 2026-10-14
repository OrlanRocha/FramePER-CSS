# Especificação Técnica: Formatação Condicional e Alertas Visuais no FramePER Converter

## 1. Visão Geral
Este documento especifica o subsistema de **Formatação Condicional e Alertas Visuais** para o ecossistema FramePER (motor de dados `Converter` e interface de demonstração `demo/converter.html`).

O subsistema permite aos usuários configurar regras declarativas baseadas no conteúdo das células para alterar dinamicamente suas propriedades visuais (cor de fundo, cor de texto, tipografia em negrito e ícones/indicadores de alerta), com recálculo reativo em tempo real e preservação fiel nas exportações para **XLS**, **XLSX** e **PDF**.

---

## 2. Requisitos e Diretrizes Arquiteturais

1. **Zero Dependências Externas**: Implementação 100% nativa em JavaScript puro (Vanilla JS/ES6+) e CSS3, sem bibliotecas de terceiros.
2. **Zero Popups Nativos**: Proibição estrita de `window.alert`, `window.prompt` e `window.confirm`. O gerenciamento é feito exclusivamente através de modal FramePER interativo.
3. **Compatibilidade Total**: Preservação de 100% de retrocompatibilidade com todas as 10 suítes de testes existentes em `tests/`.
4. **Desacoplamento Core / UI**:
   - Toda a lógica de avaliação das regras reside no motor `Converter.evaluateConditionalFormatting`.
   - A interface do usuário consome a API do motor e atualiza a visualização em tempo real.
   - Os exportadores (`toXLS`, `toXLSX`, `toPDF`) recebem as regras ou o mapa de estilos e estilizam as células nos arquivos binários/vetoriais.

---

## 3. Modelo de Dados e Tipos de Regras

### 3.1 Estrutura de uma Regra (`FormattingRule`)
```typescript
interface FormattingRule {
  id: string;                      // Identificador único (ex: "rule_172893812")
  column: number | string;         // Índice da coluna, nome do cabeçalho ou "*" (todas)
  type: RuleType;                  // Tipo de condição
  value?: any;                     // Valor de corte, string de busca ou [min, max]
  style: {
    bg?: string;                   // Cor de fundo Hex (ex: "#dcfce7")
    color?: string;                // Cor do texto Hex (ex: "#15803d")
    bold?: boolean;                // Destacar em negrito
    icon?: string;                 // Indicador visual (ex: "▲", "▼", "⚠", "●")
  };
  enabled: boolean;                // Regra ativa ou pausada
}

type RuleType =
  // Relacionais Numéricos / Genéricos
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'equal_to'
  | 'not_equal'
  // Textuais
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'empty'
  | 'not_empty'
  // Estatísticos
  | 'above_average'
  | 'below_average'
  | 'top_n'
  | 'bottom_n'
  // Especiais de Conjunto
  | 'duplicates'
  | 'unique'
  // Escala de Calor
  | 'color_scale';
```

### 3.2 Paletas Pré-definidas
- **Sucesso / Positivo**: Fundo `#dcfce7`, Texto `#15803d`, Ícone `▲`.
- **Perigo / Crítico**: Fundo `#fee2e2`, Texto `#b91c1c`, Ícone `▼`.
- **Atenção / Alerta**: Fundo `#fef3c7`, Texto `#b45309`, Ícone `⚠`.
- **Informativo / Destaque**: Fundo `#dbeafe`, Texto `#1d4ed8`, Ícone `●`.
- **Roxo / Especial**: Fundo `#f3e8ff`, Texto `#6b21a8`, Ícone `★`.
- **Personalizado**: Fundo e texto livres via color pickers.

---

## 4. API do Motor (`FramePER.Converter`)

### 4.1 `Converter.evaluateConditionalFormatting(dataset, rules, options = {})`
- **Entrada**:
  - `dataset`: Objeto `{ headers, rows }` normalizado.
  - `rules`: Array de `FormattingRule`.
  - `options`: Opções adicionais (ex: `stopIfTrue`, `ignoreCase`).
- **Saída**:
  - Objeto `cellStylesMap` mapeado por coordenadas:
    ```javascript
    {
      [rowIdx]: {
        [colIdx]: {
          bg: '#dcfce7',
          color: '#15803d',
          bold: true,
          icon: '▲',
          ruleId: 'rule_1'
        }
      }
    }
    ```
- **Comportamento**:
  - Regras desativadas (`enabled === false`) são ignoradas.
  - Regras são avaliadas na ordem em que aparecem no array (ordem de prioridade).
  - Por padrão, a primeira regra coincidente aplica suas propriedades à célula (estilo cascata preservando propriedades não conflitantes).

---

## 5. Integração com os Geradores de Exportação

1. **`Converter.toCSV(dataset, options)`**:
   - CSV é formato texto plano RFC 4180; exporta os dados limpos sem ruído de tags.

2. **`Converter.toXLS(dataset, options)`**:
   - Suporta `options.formattingRules` ou `options.cellStyles`.
   - Gera dinamicamente estilos em `<Styles>`:
     ```xml
     <Style ss:ID="Cond_dcfce7_15803d">
       <Interior ss:Color="#dcfce7" ss:Pattern="Solid"/>
       <Font ss:Color="#15803d" ss:Bold="1"/>
     </Style>
     ```
   - Aplica `ss:StyleID` na célula `<Cell>` correspondente.

3. **`Converter.toXLSX(dataset, options)`**:
   - Extrai as cores de fundo únicas de `cellStyles`.
   - Insere as entradas correspondentes em `<fills>` e novos `<xf>` em `xl/styles.xml`.
   - Referencia o identificador de estilo `s="..."` correspondente em cada `<c>`.

4. **`Converter.toPDF(dataset, options)`**:
   - Na renderização de cada página:
     - Se a célula possui cor de fundo condicional, converte o Hex para RGB normalizado (`[0..1]`).
     - Renderiza o retângulo preenchido na coordenada exata da célula (`${r} ${g} ${b} rg ${curX} ${rowY} ${w} ${rowHeight} re f`).
     - Desenha o texto da célula com a cor de texto correspondente (ou padrão escuro de alto contraste).

---

## 6. Interface do Usuário (`demo/converter.html`)

1. **Botão na Barra de Ferramentas**:
   - Botão **"Formatação Condicional"** com badge indicativo de regras ativas.
   - Clicar abre o Modal Gerenciador de Regras.

2. **Modal Gerenciador de Regras**:
   - Layout elegante em duas colunas/painéis:
     - **Painel de Criação**: Seletor de Coluna, Tipo de Regra, Valores de Parâmetro, Seletor de Paleta / Cores Customizadas, Seleção de Ícone, Prévia ao Vivo e Botão "Adicionar Regra".
     - **Painel de Regras Ativas**: Lista de cards de regras cadastradas com badge de cor, interruptor para ligar/desligar, botões de mover para cima/baixo (prioridade), e botão de remoção.
3. **Reatividade em Tempo Real**:
   - Ao adicionar, alterar, ligar ou desligar uma regra, a tabela renderiza os novos estilos instantaneamente.
   - Edição de células (`focusout`) recalcula os estilos das células afetadas.
   - Filtros e ordenação mantêm os estilos mapeados corretamente aos valores correspondentes.

---

## 7. Estratégia de Testes Automatizados (TDD)

- Criação da suíte `tests/test-converter-formatting.js`:
  - **Teste 1**: Operadores relacionais numéricos (`greater_than`, `less_than`, `between`, `equal_to`).
  - **Teste 2**: Operadores de texto (`contains`, `starts_with`, `ends_with`, `empty`).
  - **Teste 3**: Estatísticas automáticas (`above_average`, `below_average`).
  - **Teste 4**: Identificação de duplicados e únicos (`duplicates`, `unique`).
  - **Teste 5**: Escala de calor (`color_scale` interpolando cores de mínimo a máximo).
  - **Teste 6**: Integração em `toXLS` com estilos gerados dinamicamente.
  - **Teste 7**: Integração em `toXLSX` e validação com `fromXLSX`.
  - **Teste 8**: Integração em `toPDF` com verificação de comandos gráficos de preenchimento.
  - **Teste 9**: Regras com prioridade e sobreposição.
