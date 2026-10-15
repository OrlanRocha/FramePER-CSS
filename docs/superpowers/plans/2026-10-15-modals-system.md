# Sistema Completo de Modais FramePER Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar uma coleção completa e versátil de modais no FramePER (Central, Side/Drawer, Top/Header, Bottom/Footer, Floating/Flutter, Sticky e Static com animação Shake), acompanhada de API programática JavaScript (`FramePER.Modal`), eventos de ciclo de vida e demonstração interativa no catálogo de componentes.

**Architecture:** O subsistema modulariza os estilos em `src/scss/components/_modals.scss` com posicionamentos flexíveis e transições CSS3 aceleradas por hardware; expande o motor de interação em `src/js/framePER.js` com o objeto `FramePER.Modal` (métodos `show`, `hide`, `toggle`, backdrop estático, bloqueio de ESC e disparo de eventos CustomEvent); e expõe um playground interativo completo em `demo/components.html`.

**Tech Stack:** HTML5, CSS3/SCSS (BEM & CSS Custom Properties), JavaScript (Vanilla ES6+), Node.js (test runner sem dependências externas).

**Spec:** [`docs/superpowers/specs/2026-10-15-modals-system-design.md`](file:///c:/Codex/FramePER%20CSS/docs/superpowers/specs/2026-10-15-modals-system-design.md)

## Global Constraints

- 100% Client-side, puro Vanilla JS sem pacotes externos/npm runtime dependencies.
- Zero diálogos nativos do navegador (`window.alert`, `window.confirm`, `window.prompt`).
- Total compatibilidade com as 11 suítes de teste existentes.
- Padrão visual elegante com suporte automático a Dark Mode e Light Mode via variáveis CSS.
- Código, testes e mensagens de commit em Português.

## Review Focus

1. **Backdrop estático com múltiplos cliques rápidos:** Clicar repetidamente no backdrop de um modal estático não deve acumular classes nem quebrar o timer da animação de shake.
2. **Preservação do scroll do documento (`body.style.overflow`):** Fechar um modal quando múltiplos overlays estiverem empilhados só deve restaurar o scroll do body quando nenhum outro modal com `.show` estiver ativo.
3. **Tecla ESC com `keyboard: false`:** Pressionar ESC em um modal configurado com `data-keyboard="false"` deve ser completamente ignorado.
4. **Disparo sequencial de eventos:** `modal:show` e `modal:shown` devem ser emitidos na ordem correta, assim como `modal:hide` e `modal:hidden`.
5. **Responsividade em telas móveis:** Side Modals e Floating Modals devem se adaptar a telas menores (revertendo a 100% de largura ou estilo sheet sem transbordamento horizontal).

---

### Task 1: Estilização SCSS de Todas as Variantes de Modal

**Files:**
- Modify: `src/scss/components/_modals.scss`
- Build Output: `dist/framePER.css`, `dist/framePER.min.css`

**Interfaces:**
- Produces:
  - Classes de tamanho: `.modal-sm`, `.modal-lg`, `.modal-xl`, `.modal-fullscreen`.
  - Classes posicionais: `.modal-side-right`, `.modal-side-left`, `.modal-top`, `.modal-bottom`.
  - Classes flutuantes: `.modal-float`, `.modal-float-bottom-right`, `.modal-float-bottom-left`, `.modal-float-top-right`.
  - Classes estruturais: `.modal-sticky` (com header/footer fixos e `.modal-body` com scroll suave).
  - Classes de estado: `.modal-shake` com `@keyframes modalShake`.

- [ ] **Step 1: Adicionar estilos para modais de topo (`.modal-top`), rodapé (`.modal-bottom`), cantos flutuantes (`.modal-float-*`), sticky modal e animação shake**
  Implementar em `src/scss/components/_modals.scss` as classes de posicionamento, transições de entrada/saída com curvas `cubic-bezier`, cantos arredondados responsivos e a animação `@keyframes modalShake` (oscilação horizontal de 4px-8px para modais com backdrop estático).

- [ ] **Step 2: Compilar SCSS para validar a sintaxe e gerar arquivos em `dist/`**
  Executar: `npm run build:sass`
  Expected: Compilação concluída sem erros de sintaxe gerando `dist/framePER.css`.

- [ ] **Step 3: Commit**
  `git add src/scss/components/_modals.scss dist/framePER.css`
  `git commit -m "style(modals): adicionar variantes side, top, bottom, float, sticky e animacao shake"`

---

### Task 2: Testes Unitários de API e Comportamento

**Files:**
- Create: `tests/test-modals.js`

**Interfaces:**
- Consumes: `FramePER.Modal.show`, `FramePER.Modal.hide`, `FramePER.Modal.toggle`, eventos `modal:*`.

- [ ] **Step 1: Criar arquivo de testes `tests/test-modals.js`**
  Implementar mocks de DOM (`document.createElement`, `classList`, `addEventListener`, `dispatchEvent`, `CustomEvent`) e testes cobrindo:
  - Teste 1: `FramePER.Modal.show()` adiciona classe `.show` e bloqueia scroll do `body`.
  - Teste 2: `FramePER.Modal.hide()` remove classe `.show` e restaura scroll do `body`.
  - Teste 3: `FramePER.Modal.toggle()` alterna visibilidade corretamente.
  - Teste 4: Clique fora em modal com `backdrop: 'static'` aplica classe `.modal-shake` temporária e NÃO fecha o modal.
  - Teste 5: Tecla ESC fecha modal normal, mas respeita `keyboard: false` / `data-keyboard="false"`.
  - Teste 6: Disparo dos eventos `modal:show`, `modal:shown`, `modal:hide`, `modal:hidden`.
  - Teste 7: Acionamento declarativo via clique em botões `[data-toggle="modal"]` e `[data-dismiss="modal"]`.

- [ ] **Step 2: Executar teste para verificar falha (Red)**
  Executar: `node tests/test-modals.js`
  Expected: FAIL com "FramePER.Modal is undefined" ou métodos não implementados.

- [ ] **Step 3: Commit inicial da suíte de testes**
  `git add tests/test-modals.js`
  `git commit -m "test(modals): adicionar suite de testes unitarios para FramePER.Modal e variantes"`

---

### Task 3: Implementação da API JS Core `FramePER.Modal` e Comportamentos Estático/Eventos

**Files:**
- Modify: `src/js/framePER.js`
- Test: `tests/test-modals.js`

**Interfaces:**
- Produces:
  - `FramePER.Modal.show(target, options)`
  - `FramePER.Modal.hide(target)`
  - `FramePER.Modal.toggle(target, options)`
  - `FramePER.Modal.init()`

- [ ] **Step 1: Implementar o objeto `FramePER.Modal` e atualizar listeners em `src/js/framePER.js`**
  - Implementar métodos `show`, `hide`, `toggle` com normalização de seletores/elementos DOM.
  - Adicionar suporte a opções `backdrop` (`true`, `'static'`, `false`) e `keyboard` (`true`, `false`).
  - Implementar detecção de clique no backdrop: se for estático (`data-backdrop="static"` ou opção `backdrop: 'static'`), acionar a animação `.modal-shake` com `setTimeout` para remoção após 300ms.
  - Implementar emissão dos eventos customizados `modal:show`, `modal:shown`, `modal:hide`, `modal:hidden`.
  - Manter compatibilidade com `initModals()` e os diálogos de `FramePER.Dialog`.

- [ ] **Step 2: Executar suíte de testes de modais (Green)**
  Executar: `node tests/test-modals.js`
  Expected: Todos os testes passando com sucesso.

- [ ] **Step 3: Commit**
  `git add src/js/framePER.js tests/test-modals.js`
  `git commit -m "feat(modals): implementar API FramePER.Modal com suporte a static shake, eventos e toggle"`

---

### Task 4: Atualização da Documentação e Demonstração Interativa

**Files:**
- Modify: `demo/components.html`

**Interfaces:**
- Consumes: Todas as variantes CSS e atributos declarativos de modal.

- [ ] **Step 1: Enriquecer a seção `#sec-overlays` em `demo/components.html`**
  - Adicionar botões interativos para cada tipo:
    - Modal Central Padrão (`#demoModal`)
    - Modal Pequeno (`#demoModalSm`)
    - Modal Grande (`#demoModalLg`)
    - Modal Fullscreen (`#demoModalFullscreen`)
    - Side Modal Direito (`#demoSideModal`)
    - Side Modal Esquerdo (`#demoSideModalLeft`)
    - Header Modal Superior (`#demoModalTop`)
    - Footer Modal Inferior (`#demoModalBottom`)
    - Floating Modal no Canto (`#demoModalFloat`)
    - Static Modal com Efeito Shake (`#demoModalStatic`)
    - Sticky Modal com Rolagem Interna (`#demoModalSticky`)
  - Adicionar blocos de código explicativos de fácil cópia.
  - Inserir a estrutura HTML dos modais de exemplo no final do arquivo `demo/components.html`.

- [ ] **Step 2: Verificar sintaxe e integridade da página de demo**
  Executar: `node -e "const fs = require('fs'); const content = fs.readFileSync('demo/components.html', 'utf8'); console.log('Tamanho HTML:', content.length, 'bytes');"`
  Expected: Leitura com sucesso e tags fechadas corretamente.

- [ ] **Step 3: Commit**
  `git add demo/components.html`
  `git commit -m "docs(demo): adicionar showcase interativo completo com todas as 7 variantes de modal"`

---

### Task 5: Build Final, Validação de Todas as 12 Suítes e Deploy

**Files:**
- Modify: `dist/*`
- Test: Todas as 12 suítes em `tests/`

- [ ] **Step 1: Executar build completo de produção**
  Executar: `npm run build`
  Expected: Compilação limpa de SCSS, PostCSS, cópia e minificação Terser JS em `dist/`.

- [ ] **Step 2: Executar todas as 12 suítes de testes automatizados**
  Executar:
  `Get-ChildItem tests\test-*.js | ForEach-Object { node $_.FullName }`
  Expected: 12/12 suítes passando 100% verde sem regressões.

- [ ] **Step 3: Commit e Push**
  `git add .`
  `git commit -m "feat(modals): consolidar ecossistema completo de modais no FramePER"`
  `git push origin main`
