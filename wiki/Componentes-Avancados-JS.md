# ⚡ Componentes Avançados JS

O **FramePER** inclui um conjunto de módulos JavaScript modernos, ultraleves (< 30KB minificado combinado), sem dependências externas (como jQuery ou bibliotecas pesadas de terceiros) e prontos para uso.

---

### 1. Bottom Sheet Mobile

Painel modal deslizante que sobe a partir da base da tela (padrão móvel iOS/Android), com puxador tátil superior (*drag handle*) e fechamento por arrasto para baixo (*swipe down*):

```html
<!-- Botão de Abertura -->
<button class="btn btn-primary" data-open-sheet="#meuSheet">
  <i class="icon icon-sliders"></i> Abrir Bottom Sheet
</button>

<!-- Estrutura do Sheet -->
<div id="meuSheet" class="bottom-sheet">
  <div class="bottom-sheet-drag-area">
    <div class="bottom-sheet-handle"></div>
  </div>
  <div class="bottom-sheet-header">
    <h3 class="bottom-sheet-title">Configurações Rápidas</h3>
    <button class="bottom-sheet-close" data-dismiss="sheet" aria-label="Fechar">&times;</button>
  </div>
  <div class="bottom-sheet-body stack gap-3">
    <p class="text-muted m-0">Conteúdo do painel inferior com suporte a rolagem suave.</p>
  </div>
  <div class="bottom-sheet-footer">
    <button class="btn btn-secondary" data-dismiss="sheet">Cancelar</button>
    <button class="btn btn-primary" data-dismiss="sheet">Concluir</button>
  </div>
</div>
```

#### API JavaScript
```javascript
// Abrir programaticamente
FramePER.BottomSheet.open('#meuSheet');

// Fechar programaticamente
FramePER.BottomSheet.close('#meuSheet');
```

---

### 2. OTP / PIN Code Input

Entrada para códigos de autenticação (2FA, Pix, SMS, PIN) com avanço automático inteligente, retorno com Backspace e suporte a colar código completo (Ctrl+V):

```html
<div class="otp-input-group" data-otp-input id="verificacao-pix">
  <input type="text" class="otp-digit">
  <input type="text" class="otp-digit">
  <input type="text" class="otp-digit">
  <span class="otp-divider">-</span>
  <input type="text" class="otp-digit">
  <input type="text" class="otp-digit">
  <input type="text" class="otp-digit">
</div>
```

#### Eventos e Métodos JS
```javascript
const otp = document.getElementById('verificacao-pix');

// Disparado assim que todos os dígitos são preenchidos
otp.addEventListener('complete', (e) => {
  console.log('Código digitado:', e.detail.code);
  FramePER.Notify.success('Código Validado', `Código ${e.detail.code} confirmado!`);
});

// Limpar o campo e focar no primeiro dígito
FramePER.OtpInput.clear('#verificacao-pix');

// Obter o valor atual
const valor = FramePER.OtpInput.getValue('#verificacao-pix');
```

---

### 3. Confetti Celebration Engine

Efeito dinâmico de partículas em HTML5 Canvas para celebrações de metas, vitórias ou formulários concluídos:

```javascript
// Explosão rápida (Burst)
FramePER.Confetti.burst({
  count: 70,       // Quantidade de partículas
  spread: 80,      // Ângulo de dispersão (graus)
  origin: { x: 0.5, y: 0.6 } // Origem na tela (0 a 1)
});

// Chuva contínua de 3 segundos (Rain)
FramePER.Confetti.rain({
  duration: 3000
});
```

---

### 4. Motor Scroll Reveal

Revela elementos suavemente quando entram no campo de visão durante a rolagem (usando `IntersectionObserver` nativo):

```html
<div data-reveal="fade-up" data-reveal-delay="100">
  Surge subindo suavemente
</div>

<div data-reveal="zoom-in" data-reveal-delay="200">
  Surge expandindo
</div>

<div data-reveal="fade-left" data-reveal-delay="300">
  Surge da lateral direita
</div>
```

---

### 5. Product Tour Guiado

Experiência de onboarding com destaque de elemento (*spotlight cutout*), navegação por teclado e tooltips dinâmicos:

```javascript
const tour = FramePER.Tour.create({
  steps: [
    {
      target: '#botao-novo',
      title: 'Criar Projeto',
      content: 'Clique aqui para iniciar um novo projeto.',
      placement: 'bottom'
    },
    {
      target: '#filtro-busca',
      title: 'Busca Rápida',
      content: 'Localize arquivos instantaneamente com filtros.',
      placement: 'right'
    }
  ]
});

// Iniciar tour
tour.start();
```

---

### 6. Kanban Board Interativo

Quadro com colunas de tarefas, arraste nativo (*Drag & Drop*), contadores automáticos e eventos de movimentação:

```html
<div class="kanban-board" data-kanban id="meu-kanban">
  <div class="kanban-column" data-column="todo">
    <div class="kanban-column-header">
      <h4>A Fazer</h4>
      <span class="badge badge-primary kanban-count">2</span>
    </div>
    <div class="kanban-cards">
      <div class="kanban-card" data-card-id="1">Design da Tela</div>
      <div class="kanban-card" data-card-id="2">Revisão de Código</div>
    </div>
  </div>

  <div class="kanban-column" data-column="done">
    <div class="kanban-column-header">
      <h4>Concluído</h4>
      <span class="badge badge-success kanban-count">0</span>
    </div>
    <div class="kanban-cards"></div>
  </div>
</div>
```

---

### 7. Data Grid com Busca e Ordenação

Tabela avançada para grandes volumes de dados com ordenação por coluna, busca em tempo real e paginação client-side:

```html
<div class="data-grid" data-grid id="tabela-clientes">
  <!-- O FramePER gera os controles de filtro e paginação automaticamente -->
</div>
```

---

### 8. Split View (Painéis Redimensionáveis)

Divisores ajustáveis com arraste do mouse/toque, suporte a setas do teclado e duplo clique para colapsar:

```html
<div class="split-pane" data-split-pane data-initial-split="30" style="height: 300px;">
  <div class="split-panel">Navegação Lateral</div>
  <div class="split-gutter"><div class="gutter-handle"></div></div>
  <div class="split-panel">Área de Trabalho</div>
</div>
```

---

### 9. Notificações Toast & Loaders

Sistema flutuante de mensagens instantâneas e bloqueio de tela:

```javascript
// Notificações Toast
FramePER.Notify.success('Sucesso', 'Dados salvos com sucesso!');
FramePER.Notify.error('Erro', 'Não foi possível conectar ao servidor.');
FramePER.Notify.warning('Atenção', 'Sessão expira em breve.');
FramePER.Notify.info('Atualização', 'Nova versão disponível.');

// Loaders
FramePER.Loader.showPageLoad(); // Exibe spinner de carregamento de página
FramePER.Loader.hidePageLoad(); // Oculta spinner

// Estado de Loading em Botão
const btn = document.querySelector('#meu-btn');
FramePER.Loader.buttonLoading(btn, true);  // Ativa spinner no botão
FramePER.Loader.buttonLoading(btn, false); // Restaura texto original
```
