# 📐 Layout e Sistema de Grid

O **FramePER** disponibiliza um dos sistemas de layout mais flexíveis do ecossistema CSS. Ele combina o poder moderno do **CSS Grid nativo** com a familiaridade do **Flexbox de 12 colunas**, além de primitivas funcionais como `.stack` e `.cluster`.

---

### 1. Containers

Os containers delimitam e centralizam o conteúdo na viewport:

| Classe | Largura Máxima | Uso Recomendado |
| :--- | :--- | :--- |
| `.container-fluid` | `100%` (Fluido) | Dashboards, tabelas largas e layouts de tela cheia. |
| `.container` | `1200px` | Layouts corporativos padrão e documentações. |
| `.container-wide` | `1400px` | Portais e vitrines amplas de produtos. |
| `.container-narrow` | `760px` | Artigos de blog, posts e formulários de leitura focada. |

```html
<div class="container">
  <h1>Conteúdo Centralizado</h1>
</div>
```

---

### 2. Sistema CSS Grid (Nativo & Sem Breakpoints)

O sistema `.grid` permite construir layouts bidimensionais avançados:

#### Colunas Fixas e Auto-fit
```html
<!-- Grade de 3 colunas iguais -->
<div class="grid grid-3">
  <div>Coluna 1</div>
  <div>Coluna 2</div>
  <div>Coluna 3</div>
</div>

<!-- Grade Fluida Inteligente: tantas colunas quantas couberem (min 16rem) sem media queries -->
<div class="grid grid-auto">
  <div class="card p-3">Card 1</div>
  <div class="card p-3">Card 2</div>
  <div class="card p-3">Card 3</div>
</div>
```

#### Ocupação de Colunas (`span`)
```html
<div class="grid grid-12">
  <div class="span-8">Ocupa 8 colunas</div>
  <div class="span-4">Ocupa 4 colunas</div>
  <div class="span-full">Ocupa a linha inteira (12 colunas)</div>
</div>
```

#### Divisões Assimétricas Predefinidas
Você pode dividir colunas proporcionalmente sem calcular frações:
```html
<!-- Sidebar de 20% e Conteúdo de 80% -->
<div class="grid grid-2-8">
  <aside>Menu</aside>
  <main>Conteúdo</main>
</div>
```
*Variações disponíveis:* `grid-1-9`, `grid-2-8`, `grid-3-7`, `grid-4-6`, `grid-5-5`, `grid-6-4`, `grid-7-3`, `grid-8-2`, `grid-9-1`.

---

### 3. Sistema Flexbox Grid (`.row` e `.col-*`)

Para desenvolvedores acostumados com o modelo tradicional do Bootstrap ou Tailwind:

```html
<div class="row g-3">
  <div class="col-12 col-md-6 col-lg-3">Card 1</div>
  <div class="col-12 col-md-6 col-lg-3">Card 2</div>
  <div class="col-12 col-md-6 col-lg-3">Card 3</div>
  <div class="col-12 col-md-6 col-lg-3">Card 4</div>
</div>
```

#### Utilitários de Espaçamento (`g-*`)
Controle o espaçamento horizontal e vertical entre as colunas do `.row`:
* `.g-0`: sem espaçamento (`0px`)
* `.g-1`: espaçamento mínimo (`0.5rem` / `8px`)
* `.g-2`: espaçamento pequeno (`0.75rem` / `12px`)
* `.g-3`: espaçamento padrão (`1rem` / `16px`)
* `.g-4`: espaçamento médio (`1.5rem` / `24px`)
* `.g-5`: espaçamento amplo (`2rem` / `32px`)

---

### 4. Primitivas de Layout (`.stack` & `.cluster`)

Elimine a necessidade de escrever margens individuais em cada elemento:

#### `.stack` (Alinhamento Vertical com Gap)
Coloca os filhos em coluna única com espaçamento uniforme:
```html
<div class="stack gap-3">
  <h2>Título</h2>
  <p>Parágrafo com espaçamento automático.</p>
  <button class="btn btn-primary">Ação</button>
</div>
```

#### `.cluster` (Agrupamento Horizontal Fluido)
Envolve elementos em linha com quebra automática ao atingir a borda da tela:
```html
<div class="cluster gap-2">
  <span class="badge badge-primary">React</span>
  <span class="badge badge-success">Node.js</span>
  <span class="badge badge-purple">CSS</span>
  <span class="badge badge-warning">TypeScript</span>
</div>
```

---

### 5. Breakpoints Responsivos

O FramePER adota a metodologia **Mobile-First** com os seguintes pontos de interrupção:

| Prefixo | Resolução Mínima | Dispositivo Típico |
| :--- | :--- | :--- |
| *(sem prefixo)* | `0px` | Smartphones em modo retrato |
| `sm:` | `576px` | Smartphones grandes / modo paisagem |
| `md:` | `768px` | Tablets e iPads |
| `lg:` | `992px` | Laptops e telas de desktop comuns |
| `xl:` | `1200px` | Monitores Full HD e desktops largos |
| `xxl:`| `1400px` | Monitores ultrawide e TVs 4K |
