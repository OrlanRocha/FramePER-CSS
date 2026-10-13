# 📦 Instalação e Primeiros Passos

O **FramePER** pode ser integrado tanto em projetos estáticos simples com HTML puro quanto em aplicações modernas utilizando bundlers como Vite, Webpack, Parcel ou frameworks como React, Vue, Svelte e Astro.

---

### 1. Clonando o Repositório

Se você deseja desenvolver no FramePER ou compilar a partir dos fontes SCSS:

```bash
git clone https://github.com/OrlanRocha/FramePER.git
cd FramePER
npm install
```

---

### 2. Estrutura de Arquivos

O projeto é organizado de forma modular e intuitiva:

```text
FramePER/
├── dist/                      # Arquivos prontos para produção
│   ├── framePER.css           # CSS completo com source maps
│   ├── framePER.min.css       # CSS minificado e otimizado via PostCSS + cssnano
│   ├── framePER.js            # JavaScript não minificado
│   └── framePER.min.js        # JavaScript minificado via Terser
│
├── src/                       # Código-fonte
│   ├── scss/                  # Arquitetura modular SCSS
│   │   ├── base/              # Tokens, resets, tipografia
│   │   ├── components/        # 40+ componentes de UI individuais
│   │   ├── layout/            # Containers, grid system e flexbox
│   │   ├── utilities/         # Animações, ícones (280 SVGs), cores, espaçamentos
│   │   ├── _variables.scss    # Paleta de cores, breakpoints e funções
│   │   └── framePER.scss      # Ponto de entrada que importa todos os módulos
│   │
│   └── js/                    # JavaScript
│       └── framePER.js        # Motor de componentes com auto-init
│
├── demo/                      # Demonstrações interativas e catálogo
└── wiki/                      # Documentação oficial do GitHub Wiki
```

---

### 3. Scripts de Compilação

O `package.json` disponibiliza comandos otimizados para compilação:

```bash
# Compila tudo (Sass, PostCSS, cópia de JS e minificação com Terser)
npm run build

# Compila apenas os estilos SCSS para dist/framePER.css
npm run build:sass

# Otimiza e minifica o CSS com PostCSS e cssnano
npm run build:postcss

# Minifica o JavaScript para dist/framePER.min.js
npm run build:js
```

---

### 4. Uso em HTML Puro

Para projetos sem bundlers, copie os arquivos de `dist/` para o seu diretório público e faça a importação:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="dist/framePER.min.css">
</head>
<body>
  <button class="btn btn-primary hover-lift">
    <i class="icon icon-sparkles"></i> Clique Aqui
  </button>

  <script src="dist/framePER.min.js"></script>
</body>
</html>
```

---

### 5. Uso com Sass / Bundlers Modernos (Vite, Webpack, etc.)

Se você deseja personalizar variáveis e compilar apenas os módulos necessários, você pode importar o SCSS diretamente no seu pipeline:

```scss
// Customização de variáveis antes de importar
@use 'path/to/FramePER/src/scss/variables' with (
  $colors: (
    "blue": #0284c7, // Altera a cor primária
  )
);

// Importa os estilos do FramePER
@use 'path/to/FramePER/src/scss/framePER';
```

E no seu JavaScript:

```javascript
// O FramePER expõe uma API global e auto-inicializa os componentes
import 'path/to/FramePER/dist/framePER.min.css';
import 'path/to/FramePER/dist/framePER.min.js';

// Ou acesse os métodos programáticos:
window.FramePER.Notify.success('Sucesso', 'Operação concluída!');
```
