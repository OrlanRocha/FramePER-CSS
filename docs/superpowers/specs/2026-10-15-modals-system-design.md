# Especificação Técnica: Sistema Completo de Modais FramePER

- **Data:** 15 de Outubro de 2026
- **Status:** Aprovado para Planejamento
- **Módulos:** SCSS (`src/scss/components/_modals.scss`), JS Core (`src/js/framePER.js`), Demo (`demo/components.html`)
- **Ambiente:** Client-Side Puro (Navegador & Node.js)
- **Zero Dependências:** 100% Vanilla JS e CSS moderno sem pacotes externos

---

## 1. Visão Geral e Objetivos

Expandir a biblioteca de componentes visuais e interativos do FramePER com um **sistema universal e versátil de modais e overlays**. O objetivo é oferecer suporte nativo a todas as variações de posicionamento, comportamento, animação e controle programático exigidas em aplicações web modernas:

1. **Variações Estruturais:** Modal Central Clássico (com escalas de tamanho), Side Modals (Drawers Laterais Esquerda/Direita), Header Modals (Top Banners), Footer Modals (Bottom Sheets), Modais Flutuantes (Floating / Flutter Cards) e Sticky Modals (com cabeçalho/rodapé fixos e corpo com scroll).
2. **Comportamento Estático (`Static Modal`):** Capacidade de impedir fechamento acidental ao clicar fora (`data-backdrop="static"`), disparando feedback visual de pulso/sacudida elástica (`modal-shake`).
3. **API Programática em JavaScript:** Módulo `FramePER.Modal` com métodos `.show()`, `.hide()`, `.toggle()` e emissão de eventos customizados de ciclo de vida (`modal:show`, `modal:shown`, `modal:hide`, `modal:hidden`).
4. **Acionamento Declarativo HTML:** Atributos `data-toggle="modal"`, `data-target="#id"`, `data-dismiss="modal"`, `data-backdrop="static"`, `data-keyboard="false"`.
5. **Showcase Interativo:** Painel completo na página de documentação (`demo/components.html`) para disparar ao vivo cada um dos tipos de modal e visualizar seus códigos.

---

## 2. Tipos e Variantes de Modal

### 2.1. Modal Central e Escala de Tamanhos
- `.modal`: Container base com backdrop em desfoque (`backdrop-filter: blur(4px)`).
- `.modal-sm .modal-content`: Largura máxima de `24rem` (384px) - ideal para diálogos de confirmação simples.
- Padrão: Largura máxima de `32rem` (512px).
- `.modal-lg .modal-content`: Largura máxima de `44rem` (704px) - ideal para formulários médios.
- `.modal-xl .modal-content`: Largura máxima de `56rem` (896px) - ideal para tabelas e assistentes com abas.
- `.modal-fullscreen .modal-content`: Ocupa `100vw` e `100vh`, sem bordas arredondadas e sem margem externa.

### 2.2. Side Modals / Drawers (Gavetas Laterais)
- `.modal.modal-side-right`: O painel desliza da borda direita da viewport (`translateX(100%)` -> `0`), ocupando `100vh` de altura e largura máxima configurável (`28rem` a `34rem`).
- `.modal.modal-side-left`: O painel desliza da borda esquerda da viewport (`translateX(-100%)` -> `0`).
- Ideal para: Carrinhos de compra, filtros avançados, feeds de atividade e painéis de configuração.

### 2.3. Header Modal / Top Banner (`.modal.modal-top`)
- O painel fica ancorado na borda superior da viewport, centralizado horizontalmente ou estendido em 100% de largura.
- Animação de entrada deslizando para baixo (`translateY(-100%)` -> `0`).
- Ideal para: Banners de manutenção, avisos urgentes, barras de cookies e confirmações do topo.

### 2.4. Footer Modal / Bottom Sheet (`.modal.modal-bottom`)
- O painel fica ancorado na base da viewport, centralizado horizontalmente com cantos superiores arredondados (`border-radius: var(--radius-lg) var(--radius-lg) 0 0`).
- Animação de entrada subindo da base (`translateY(100%)` -> `0`).
- Altura adaptável até `85vh` com rolagem interna no corpo.
- Ideal para: Experiências mobile-first, menus de contexto e ações rápidas.

### 2.5. Floating / Flutter Modal (`.modal.modal-float-bottom-right` e `.modal-float-bottom-left`)
- O painel flutua nos cantos inferiores da viewport (`bottom: 1.5rem; right: 1.5rem`), com cantos arredondados, sombra profunda (`box-shadow: var(--shadow-xl)`) e largura compacta (`24rem` a `28rem`).
- Não bloqueia a visão central da página.
- Ideal para: Widgets de atendimento, chat flutuante, mini players e cards flutuantes inspirados em Flutter.

### 2.6. Sticky Modal (`.modal.modal-sticky`)
- O container `.modal-content` possui altura definida (ex: `75vh`).
- `.modal-header`: Fixo no topo, com linha divisória sutil e sombra suave quando o conteúdo rolar.
- `.modal-footer`: Fixo na base, sempre acessível para botões de salvar/cancelar sem necessidade de rolar até o fim.
- `.modal-body`: Rolagem independente com `overflow-y: auto`.

### 2.7. Static Modal & Animação Shake (`.modal-static` / `data-backdrop="static"`)
- Ao clicar no backdrop externo cinza ou desfocado, o modal não fecha.
- Uma classe `.modal-shake` é adicionada temporariamente ao `.modal-content`, executando a animação CSS `@keyframes modalShake` (leve oscilação horizontal de 4px a 8px com escala sutil `scale(1.02)` durante 250ms), comunicando visualmente que a interação com o diálogo é obrigatória.

---

## 3. Especificação da API JavaScript (`FramePER.Modal`)

No arquivo `src/js/framePER.js`, a API pública unificada será exposta em `FramePER.Modal`:

```javascript
FramePER.Modal = {
  // Exibe o modal pelo ID ou elemento DOM
  show: function(target, options = {}) { ... },

  // Oculta o modal
  hide: function(target) { ... },

  // Alterna o estado do modal
  toggle: function(target, options = {}) { ... },

  // Inicialização de escuta declarativa automática
  init: function() { ... }
};
```

### 3.1. Opções Suportadas (`options`)
- `backdrop`: `true` (padrão) | `'static'` (não fecha ao clicar fora) | `false` (sem backdrop visual).
- `keyboard`: `true` (padrão, fecha com ESC) | `false` (ignora tecla ESC).

### 3.2. Eventos Customizados Disparados
- `modal:show`: Disparado imediatamente antes da animação de abertura.
- `modal:shown`: Disparado após a animação de abertura concluir e o modal estar totalmente visível.
- `modal:hide`: Disparado imediatamente antes do início da animação de fechamento.
- `modal:hidden`: Disparado após o modal ser fechado e o overflow do body ser restaurado.

---

## 4. Integração na Página de Demonstração (`demo/components.html`)

A seção `#sec-overlays` será enriquecida para demonstrar:
1. **Grid de Botões de Ação:**
   - `[Modal Central (Padrão)]`
   - `[Modal Pequeno (sm)]`
   - `[Modal Grande (lg / xl)]`
   - `[Side Modal Direito (Drawer)]`
   - `[Side Modal Esquerdo]`
   - `[Header Modal (Top Banner)]`
   - `[Footer Modal (Bottom Sheet)]`
   - `[Floating Modal (Canto Flutuante)]`
   - `[Modal Estático (Shake)]`
   - `[Sticky Modal (Scroll Interno)]`
2. **Estrutura de Código Exemplar:** Snippets HTML/CSS e JavaScript destacando as classes e atributos correspondentes.
3. **Modais de Demonstração no Rodapé:** Todos os elementos correspondentes inseridos antes de fechar o `</body>`.

---

## 5. Estratégia de Testes Automatizados

Criar a suíte `tests/test-modals.js` testando:
1. Abertura e fechamento de modal central padrão via API e via clique `data-toggle="modal"`.
2. Variações de classes aplicadas (`modal-side-right`, `modal-side-left`, `modal-top`, `modal-bottom`, `modal-float-*`, `modal-sticky`).
3. Comportamento de `data-backdrop="static"`: verificar que clique externo não remove `.show` e aplica a classe temporária de shake.
4. Fechamento via tecla ESC (respeitando `data-keyboard="false"`).
5. Disparo e propagação dos eventos `modal:show`, `modal:shown`, `modal:hide` e `modal:hidden`.
6. Validação de ausência de regressões nas 11 suítes de testes anteriores.
