# 🧩 Componentes UI

O **FramePER** disponibiliza mais de 40 componentes de interface prontos para uso, totalmente acessíveis, responsivos e estilizados para Dark e Light mode.

---

### 1. Botões & Ações

Os botões possuem transições fluidas, suporte a ícones vetoriais, estados de foco e variantes modernas:

```html
<!-- Cores Semânticas -->
<button class="btn btn-primary">Primário</button>
<button class="btn btn-secondary">Secundário</button>
<button class="btn btn-success">Sucesso</button>
<button class="btn btn-danger">Perigo</button>
<button class="btn btn-warning">Alerta</button>
<button class="btn btn-purple">Roxo</button>

<!-- Estilos Visuais -->
<button class="btn btn-outline">Borda Outline</button>
<button class="btn btn-ghost">Fantasma / Ghost</button>
<button class="btn btn-link">Estilo Link</button>

<!-- Tamanhos -->
<button class="btn btn-primary btn-xs">Extra Pequeno</button>
<button class="btn btn-primary btn-sm">Pequeno</button>
<button class="btn btn-primary">Normal</button>
<button class="btn btn-primary btn-lg">Grande</button>

<!-- Com Ícones -->
<button class="btn btn-primary hover-lift">
  <i class="icon icon-sparkles"></i> Com Ícone
</button>
<button class="btn btn-ghost btn-icon" aria-label="Configurações">
  <i class="icon icon-settings"></i>
</button>
```

---

### 2. Stat Cards & KPI Metrics

Cartões executivos de indicadores de desempenho (KPIs) com bordas temáticas no topo, badges de tendência com setas vetoriais e caixas de ícones:

```html
<div class="stat-grid stat-grid-4">

  <!-- Faturamento (Primário) -->
  <div class="stat-card stat-primary">
    <div class="stat-header">
      <span class="stat-title">Faturamento Mensal</span>
      <span class="stat-icon"><i class="icon icon-coins"></i></span>
    </div>
    <div class="stat-value">R$ 148.920</div>
    <div class="stat-footer">
      <span class="stat-trend stat-trend-up"><i class="icon icon-trend-up"></i> +14.2%</span>
      <span class="stat-desc">vs mês anterior</span>
    </div>
  </div>

  <!-- Novos Clientes (Sucesso) -->
  <div class="stat-card stat-success">
    <div class="stat-header">
      <span class="stat-title">Novos Assinantes</span>
      <span class="stat-icon"><i class="icon icon-user-plus"></i></span>
    </div>
    <div class="stat-value">1.842</div>
    <div class="stat-footer">
      <span class="stat-trend stat-trend-up"><i class="icon icon-trend-up"></i> +8.6%</span>
      <span class="stat-desc">metas batidas</span>
    </div>
  </div>

  <!-- Churn (Perigo) -->
  <div class="stat-card stat-danger">
    <div class="stat-header">
      <span class="stat-title">Taxa de Churn</span>
      <span class="stat-icon"><i class="icon icon-user-x"></i></span>
    </div>
    <div class="stat-value">2.14%</div>
    <div class="stat-footer">
      <span class="stat-trend stat-trend-down"><i class="icon icon-trend-down"></i> -0.8%</span>
      <span class="stat-desc">redução contínua</span>
    </div>
  </div>

  <!-- Resposta (Roxo) -->
  <div class="stat-card stat-purple">
    <div class="stat-header">
      <span class="stat-title">Tempo de Resposta</span>
      <span class="stat-icon"><i class="icon icon-zap"></i></span>
    </div>
    <div class="stat-value">180 ms</div>
    <div class="stat-footer">
      <span class="stat-trend stat-trend-neutral"><i class="icon icon-check"></i> 99.98%</span>
      <span class="stat-desc">uptime de SLA</span>
    </div>
  </div>

</div>
```

---

### 3. Segmented Control (Controle Segmentado)

Alternador de seleção mutuamente exclusivo com efeito pill suave e despacho nativo de eventos customizados (`change`):

```html
<div class="segmented-control segmented-control-sm" data-segmented-control>
  <button type="button" class="segmented-item active" data-value="dia">Dia</button>
  <button type="button" class="segmented-item" data-value="semana">Semana</button>
  <button type="button" class="segmented-item" data-value="mes">Mês</button>
</div>

<!-- Variante Full Width e Arredondada (Pill) -->
<div class="segmented-control segmented-control-full segmented-control-pill" data-segmented-control>
  <button type="button" class="segmented-item active" data-value="todos">Todos (24)</button>
  <button type="button" class="segmented-item" data-value="ativos">Ativos (18)</button>
  <button type="button" class="segmented-item" data-value="arquivados">Arquivados (6)</button>
</div>
```

#### Ouvindo o Evento via JavaScript
```javascript
document.querySelector('[data-segmented-control]').addEventListener('change', (e) => {
  console.log('Item selecionado:', e.detail.value);
});
```

---

### 4. Star Rating & Avaliação

Sistema de pontuação e reviews com modo interativo e somente leitura:

```html
<!-- Modo Interativo (com hover e clique) -->
<div class="rating rating-interactive rating-lg" data-rating data-interactive="true" data-value="4" id="avaliacao-produto">
  <span class="rating-star"><i class="icon icon-star"></i></span>
  <span class="rating-star"><i class="icon icon-star"></i></span>
  <span class="rating-star"><i class="icon icon-star"></i></span>
  <span class="rating-star"><i class="icon icon-star"></i></span>
  <span class="rating-star"><i class="icon icon-star"></i></span>
  <span class="rating-score">4.0</span>
</div>

<!-- Modo Somente Leitura (Read-only) -->
<div class="rating rating-readonly rating-sm">
  <span class="rating-star is-filled"><i class="icon icon-star"></i></span>
  <span class="rating-star is-filled"><i class="icon icon-star"></i></span>
  <span class="rating-star is-filled"><i class="icon icon-star"></i></span>
  <span class="rating-score">5.0 (124 reviews)</span>
</div>
```

```javascript
document.getElementById('avaliacao-produto').addEventListener('change', (e) => {
  FramePER.Notify.success('Nota Registrada', `Você deu ${e.detail.rating} estrelas!`);
});
```

---

### 5. Status Dot & Radar Ping

Indicadores circulares de presença com animação de radar contínua (`.status-dot-ping`):

```html
<!-- Estados com Pulso Radar Ativo -->
<div class="status-badge">
  <span class="status-dot status-dot-online status-dot-ping"></span>
  <span>Disponível / Online</span>
</div>

<div class="status-badge">
  <span class="status-dot status-dot-busy status-dot-ping"></span>
  <span>Ocupado em Chamada</span>
</div>

<div class="status-badge">
  <span class="status-dot status-dot-recording status-dot-ping"></span>
  <span class="text-danger">Gravando Ao Vivo</span>
</div>

<!-- Acoplado a Avatares -->
<div style="position: relative; display: inline-block;">
  <span class="avatar avatar-md avatar-primary">OR</span>
  <span class="status-dot status-dot-online status-dot-ping" style="position: absolute; bottom: 0; right: 0; border: 2px solid var(--bg-surface);"></span>
</div>
```

---

### 6. Teclas e Atalhos (KBD)

Representação tátil em 3D de teclas do teclado com profundidade e sombra realista:

```html
<!-- Combinações de Teclas -->
<div class="kbd-combo">
  <kbd>Ctrl</kbd>
  <span>+</span>
  <kbd>K</kbd>
</div>

<div class="kbd-combo">
  <kbd>⌘ Cmd</kbd>
  <span>+</span>
  <kbd>Shift</kbd>
  <span>+</span>
  <kbd>P</kbd>
</div>

<!-- Tamanhos -->
<kbd class="kbd-xs">XS</kbd>
<kbd class="kbd-sm">SM</kbd>
<kbd>Normal</kbd>
<kbd class="kbd-lg">LG</kbd>
```

---

### 7. Cards & Containers de Conteúdo

```html
<div class="card p-4 hover-lift">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h3 class="h5 m-0 font-semibold">Título do Card</h3>
    <span class="badge badge-success">Ativo</span>
  </div>
  <div class="card-body m-y-3">
    <p class="text-muted m-0">Conteúdo do cartão com tipografia balanceada e bordas suaves.</p>
  </div>
  <div class="card-footer d-flex justify-content-end gap-2">
    <button class="btn btn-secondary btn-sm">Cancelar</button>
    <button class="btn btn-primary btn-sm">Salvar</button>
  </div>
</div>
```
