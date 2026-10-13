# 🎬 Animações, Micro-interações e Efeitos

O **FramePER** inclui um sistema completo de animações utilitárias leves para enriquecer a experiência do usuário com feedback visual e micro-interações elegantes.

---

### 1. Entradas e Saídas Fluidas

Classes prontas para animar elementos que entram na tela:

```html
<!-- Entradas Tradicionais -->
<div class="fade-in">Aparece suavemente com opacidade</div>
<div class="slide-up">Desliza subindo 20px</div>
<div class="slide-down">Desliza descendo 20px</div>
<div class="slide-left">Desliza da direita para esquerda</div>
<div class="slide-right">Desliza da esquerda para direita</div>

<!-- Efeitos com Mola Elástica (Spring) -->
<div class="zoom-in">Expande suavemente de 0.85 para 1</div>
<div class="zoom-out">Contrai de 1.12 para 1</div>

<!-- Giros em Perspectiva 3D -->
<div class="flip-in-x">Giro fluido no eixo X (Flip vertical)</div>
<div class="flip-in-y">Giro fluido no eixo Y (Flip horizontal)</div>
```

---

### 2. Micro-interações de Hover 3D

Adicione sensações táteis modernas a cards e botões ao passar o mouse:

```html
<!-- Elevação 3D: Sobe 4px e gera sombra profunda -->
<div class="card p-3 hover-lift">
  Card interativo com elevação fluida
</div>

<!-- Zoom Suave 104% -->
<div class="card p-3 hover-scale">
  Card com zoom suave
</div>

<!-- Brilho Neon Colorido -->
<div class="card p-3 hover-glow">
  Card com aura luminosa
</div>

<!-- Inclinação Sutil de 2 Graus -->
<div class="card p-3 hover-tilt">
  Card com leve rotação
</div>
```

---

### 3. Efeitos de Atenção & Feedback de Estado

Ideais para validações de formulário, botões de ação e estados de espera:

```html
<!-- Vibração de Erro (Shake): Perfeito para senhas incorretas -->
<button class="btn btn-danger shake">
  <i class="icon icon-alert-triangle"></i> Senha Inválida
</button>

<!-- Pulsação Cardíaca Orgânica -->
<button class="btn btn-primary heartbeat">
  <i class="icon icon-heart"></i> Curtir
</button>

<!-- Brilho Pulsante Contínuo (Glow Pulse) para CTAs -->
<button class="btn btn-primary glow-pulse">
  Assinar Agora
</button>

<!-- Efeito Shimmer Metálico Deslizante (Ótimo para skeletons e cards de destaque) -->
<div class="card p-3 shimmer">
  Processando pagamento...
</div>

<!-- Flutuação Suave Alternada -->
<span class="badge badge-pill badge-primary float-gentle">Novo Recurso</span>

<!-- Rotação Suave Contínua -->
<i class="icon icon-refresh spin-slow"></i>
```

---

### 4. Durações e Delays Escalonados (Stagger)

Combine classes utilitárias para sincronizar animações em listas:

#### Classes de Duração
* `.duration-fast`: `150ms` (Ideal para micro-interações instantâneas)
* `.duration-normal`: `350ms` (Padrão para a maioria das transições)
* `.duration-slow`: `700ms` (Para transições dramáticas de grandes painéis)
* `.duration-slower`: `1200ms` (Para fundos e rotações contemplativas)

#### Delays Escalonados
* `.delay-1`: `0.08s`
* `.delay-2`: `0.16s`
* `.delay-3`: `0.24s`
* `.delay-4`: `0.32s`
* `.delay-5`: `0.40s`
* `.delay-6`: `0.48s`
* `.delay-7`: `0.56s`
* `.delay-8`: `0.64s`

```html
<!-- Lista de cards entrando em sequência escalonada -->
<div class="stat-grid stat-grid-3">
  <div class="card p-3 slide-up delay-1">Item 1</div>
  <div class="card p-3 slide-up delay-2">Item 2</div>
  <div class="card p-3 slide-up delay-3">Item 3</div>
</div>
```

---

### 5. Motor Scroll Reveal

O FramePER monitora automaticamente o scroll do usuário e dispara animações declarativas:

```html
<div data-reveal="fade-up" data-reveal-delay="100">
  Revela ao rolar a página
</div>

<div data-reveal="zoom-in" data-reveal-delay="200">
  Expande ao atingir o viewport
</div>
```

---

### 6. Acessibilidade (`prefers-reduced-motion`)

O FramePER respeita integralmente a preferência de acessibilidade configurada no sistema operacional de usuários que sofrem de sensibilidade a movimento ou vestibulopatias.

Quando `@media (prefers-reduced-motion: reduce)` está ativo:
* Todas as animações são instantaneamente desativadas (`animation-duration: 0.01ms`).
* O scroll suave é substituído pelo scroll instantâneo.
* Elementos com `data-reveal` tornam-se imediatamente visíveis sem transição.
