# Bem-vindo ao Wiki do FramePER CSS 🚀

O **FramePER** é um framework completo de UI (Interface de Usuário) para a web moderna, construído com foco em **altíssima performance, elegância visual, zero dependências externas pesadas e controle total para desenvolvedores**.

Combinando um motor robusto de **SCSS moderno** e um conjunto leve e modular de **utilitários JavaScript nativos**, o FramePER oferece tudo o que você precisa para criar desde landing pages ultrarrápidas até dashboards corporativos e aplicações SaaS de alta complexidade.

---

### 🌟 Pilares Fundamentais

| Pilar | Descrição |
| :--- | :--- |
| **⚡ Zero Overhead de Fontes** | Coleção própria de **280 ícones 100% vetoriais em puro CSS** via `mask-image`. Sem requisições de webfonts (`.woff2`, `.ttf`) e **zero piscamento FOIT/FOUT**. |
| **🌓 Dark Mode Automático** | Tokens de cores semânticas com adaptação instantânea à preferência do sistema operacional (`prefers-color-scheme`) e controle via atributo `data-theme="dark"`. |
| **📐 Grid Duplo Híbrido** | Poder do **CSS Grid nativo** (`.grid`, `.grid-1` a `.grid-12`, `.grid-auto`) combinado com a interoperabilidade familiar do **Flexbox** (`.row`, `.col-*`, `.g-0` a `.g-5`). |
| **🎬 Micro-interações & Animações** | Keyframes para entradas e saídas fluidas, efeitos de atenção (`shake`, `shimmer`, `glow-pulse`), elevação 3D ao passar o mouse (`hover-lift`) e motor **Scroll Reveal**. |
| **📱 Mobile & PWA Ready** | Componentes responsivos pensados para telas de toque, incluindo **Bottom Sheet com gesto de arrastar**, **Input OTP/PIN com foco automático** e layout fluído. |

---

### ⏱️ Início Rápido (30 Segundos)

Para começar a usar o FramePER em qualquer projeto HTML, basta incluir os arquivos compilados da pasta `dist/`:

```html
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Projeto com FramePER</title>
  
  <!-- CSS do FramePER -->
  <link rel="stylesheet" href="path/to/dist/framePER.min.css">
</head>
<body>

  <!-- Exemplo: Stat Card com Ícone e Tendência -->
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

  <!-- JavaScript do FramePER -->
  <script src="path/to/dist/framePER.min.js"></script>
</body>
</html>
```

---

### 📚 Índice Geral do Wiki

Explore os tópicos detalhados nas seções da barra lateral:

1. **[Instalação & Setup](Instalacao-e-Primeiros-Passos)** — Como instalar via NPM, compilar os fontes SCSS e configurar seu pipeline de build.
2. **[Cores & Dark Mode](Sistema-de-Cores-e-Temas)** — Paleta de cores, tokens `:root`, transições suaves de tema e funções SCSS (`tint`, `readable`, `shade`).
3. **[Layout & Grid System](Layout-e-Grid-System)** — Containers fluidos, sistema de 12 colunas, Flexbox interoperável e utilitários de gap.
4. **[Componentes UI](Componentes-UI)** — Botões, Cards, Stat Cards, Segmented Control, Star Rating, Status Dot com radar, KBD, Badges e Formulários.
5. **[Componentes Avançados JS](Componentes-Avancados-JS)** — Bottom Sheet, OTP Input, Confetti Canvas, Scroll Reveal, Product Tour, Kanban, DataGrid, Split View e Toasts.
6. **[Catálogo de 280 Ícones](Catalogo-de-Icones-CSS)** — Como usar a biblioteca vetorial pura em CSS, classes de tamanho e listagem por categorias.
7. **[Animações & Efeitos](Animacoes-e-Efeitos)** — Biblioteca completa de keyframes, micro-interações de hover e motor Scroll Reveal.
8. **[Guia de Contribuição](Guia-de-Contribuicao-e-Build)** — Como rodar o projeto localmente, padrões de código e criação de novos componentes.

---

### 🌐 Demonstrações Interativas Online

Você pode navegar pelas páginas de demonstração oficiais que exemplificam a aplicação do FramePER em cenários reais:

* **[Dashboard Administrativo](https://orlanrocha.github.io/FramePER/demo/dashboard.html)**
* **[Vitrines de Todos os Componentes](https://orlanrocha.github.io/FramePER/demo/components.html)**
* **[Icon Studio (Catálogo de 280 Ícones)](https://orlanrocha.github.io/FramePER/demo/icons.html)**
* **[Gráficos Vetoriais SVG Interativos](https://orlanrocha.github.io/FramePER/demo/charts.html)**
* **[Landing Page Oficial](https://orlanrocha.github.io/FramePER/demo/landing.html)**
