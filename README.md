# Frame PER

![NPM Version](https://img.shields.io/badge/version-2.19.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Frame PER** é um **UI Framework** (CSS & JS) moderno, elegante, ultraleve e responsivo desenvolvido com SCSS modular e Vanilla JS sem nenhuma dependência externa. Combina design minimalista de alto padrão (Dribbble/Apple/Vercel) com utilitários flexíveis, modo escuro nativo, **Timeline / Linha do Tempo Vertical (`FramePER.Timeline`)**, **Split View & Painéis Redimensionáveis Otimizados (`FramePER.SplitPane`)**, **Kanban Board Drag-and-Drop (`FramePER.Kanban`)**, **Data Grid Dinâmico com Paginação & Exportação (`FramePER.DataGrid`)**, **Tree View Interativo com Checkboxes & Busca em Tempo Real (`FramePER.TreeView`)**, **Central de Atividades & Notificações em Drawer (`FramePER.ActivityFeed`)**, **Validador Reativo de Formulários (`FramePER.FormValidator`)**, **Menu de Contexto de Botão Direito & Dropdowns Multinível (`FramePER.ContextMenu`)**, **Abas Reativas com Slider Animado (`FramePER.Tabs`)**, **Accordions Fluidos com scrollHeight (`FramePER.Accordion`)**, **Popovers Inteligentes com Auto-Posicionamento 4D (`FramePER.Popover`)**, **File Uploader Avançado (`FramePER.Upload`) com Drag & Drop e progresso individual**, **Template Delivery & Restaurante**, **Rede Social Moderna com componentes ricos**, **Command Palette (Ctrl+K)**, **Framework de Gráficos Vetoriais SVG**, biblioteca de **107 ícones vetoriais** Pure CSS e utilitários interativos de ponta.

---

## 🚀 Principais Recursos & Componentes

- **⏱️ Timeline / Linha do Tempo Vertical (`FramePER.Timeline`)**:
  - **Zero Dependências & Estrutura Vertical Flexível**: Histórico cronológico pixel-perfect para rastreamento de entregas, pedidos, status de pipelines e logs de auditoria.
  - **Conectores Verticais Inteligentes**: Suporte a conectores contínuos sólidos, tracejados (`.is-dashed`) e concluídos (`.is-completed`), com cálculo automático no último nó.
  - **Pontos Coloridos & Pulse Animado**: Variantes semânticas (`point-primary`, `point-success`, `point-warning`, `point-danger`, `point-purple`), nós com ícones vetoriais SVG e anel pulsante (`has-pulse`).
  - **Modo Compacto & Adição Dinâmica**: Variante `.timeline-compact` para painéis laterais e métodos dinâmicos `addItem()`, `removeItem()`, `setStatus()` e evento `frameper:timeline:change`.

- **🪟 Split View & Painéis Redimensionáveis Otimizados (`FramePER.SplitPane`)**:
  - **Zero Dependências & Resizing Suave**: Divisores ajustáveis via Pointer Events (`setPointerCapture`) com badge flutuante em tempo real de proporção (`.split-ratio-badge`) e transição fluida `.is-animated`.
  - **Cálculo Inteligente de Limites**: Parser unificado para porcentagens (`%`) e dimensões em pixels (`px`), eliminando travamentos em containers responsivos.
  - **Acessibilidade Completa por Teclado**: Gutter com `tabindex="0"`, `role="separator"` e controle por setas (`←`, `→`, `↑`, `↓`), atalhos de `Home` e `End` para limites e `Enter`/`Espaço` para alternar colapso.
  - **Orientação Horizontal & Vertical**: Suporte a layouts lado a lado ou empilhados verticalmente (`.split-vertical`) com calhas divisórias fluidas (`.split-gutter` e `.gutter-handle`).
  - **Persistência Automática em LocalStorage**: Restauração transparente da proporção entre recarregamentos de página via `data-persist="key"`.

- **📋 Kanban Board Drag-and-Drop (`FramePER.Kanban`)**:
  - **Zero Dependências & HTML5 Drag & Drop Nativo**: Quadro ágil de cartões com arraste suave entre colunas e reordenação interna sem peso de bibliotecas terceiras.
  - **Placeholder Visual & Feedback de Drop**: Linha guia pontilhada com cálculo dinâmico de proximidade vertical (`clientY`) para inserção precisa.
  - **Contadores de Coluna Automáticos**: Atualização em tempo real das badges de contagem de cada coluna ao movimentar, adicionar ou remover cards.
  - **Adição Dinâmica & Persistência Local**: Método `addCard(columnId, cardData)` e persistência transparente de posições em `localStorage` via atributo `data-persist="chave"`.
  - **API Programática & Eventos**: Métodos `addCard()`, `removeCard()`, `moveCard()`, `getColumns()`, `getCards()` e eventos `frameper:kanban:move`, `frameper:kanban:add`.

- **🔔 Central de Atividades & Notificações em Drawer (`FramePER.ActivityFeed`)**:
  - **Zero Dependências & Drawer Lateral**: Painel retrátil desktop-class com backdrop blur acionado por atributo `[data-activity-feed-toggle]` ou via API programática (`FramePER.ActivityFeed.open()`).
  - **Feed de Eventos Reativo**: Itens categorizados com ícones vetoriais semânticos (*sucesso, alerta, erro, info, sistema*), timestamps relativos e botões de ação direta.
  - **Badges Dinâmicas & Pulso**: Sincronização automática em qualquer elemento com `[data-activity-badge]`, exibição de não lidas e animação de pulso ao receber novas notificações.
  - **Filtros por Status & Ações Globais**: Filtros instantâneos (*Todas, Não Lidas, Sistema*), botão de "Marcar todas como lidas" e "Limpar histórico".

- **🛡️ Validador Reativo de Formulários (`FramePER.FormValidator`)**:
  - **Zero Dependências & Validação em Tempo Real**: Validação instantânea ao sair do campo (`blur`) e contínua durante digitação (`input`), com bloqueio inteligente de envio (`submit`).
  - **Catálogo de Regras Integradas**: `required`, `email`, `min`, `max`, `min_val`, `max_val`, `numeric`, `digits`, `url`, `phone` (com DDD), `match` (confirmação cruzada), `regex`, `card` (algoritmo de Luhn) e validação matemática oficial de **CPF** e **CNPJ** (com cálculo dos dígitos verificadores).
  - **Feedback Visual Fluido**: Mensagens de erro/sucesso animadas (`.form-feedback` / `.form-error`), classes de estado (`.is-invalid`, `.is-valid`), tremor de alerta (`is-invalid-shake`) e sumário de erros navegável com foco suave (`.form-error-summary`).
  - **Uso Híbrido**: Declarativo via atributos HTML5 (`data-form-validator`, `data-validate="required|email|min:6"`) ou programático (`new FramePER.FormValidator(form, options)`).

- **🖱️ Menu de Contexto de Botão Direito & Dropdowns Multinível (`FramePER.ContextMenu`)**:
  - **Zero Dependências**: Menus contextuais desktop-class disparados por clique direito em qualquer elemento (`data-context-menu="#meu-menu"`) ou via API programática (`FramePER.ContextMenu.attach`).
  - **Detecção Inteligente de Bordas (Collision Detection)**: O menu calcula a viewport em tempo real e inverte suas coordenadas horizontal ou verticalmente para nunca ultrapassar os limites da tela.
  - **Submenus Multinível em Cascata (`.has-submenu` / `.context-submenu` / `.dropdown-submenu`)**: Suporte a múltiplos níveis de aninhamento com inversão automática para a esquerda quando não há espaço à direita.
  - **Acessibilidade Completa por Teclado**: Navegação por setas (`ArrowUp`, `ArrowDown`), abertura de submenus com `ArrowRight`, fechamento com `ArrowLeft`, ativação com `Enter`/`Space` e escape com tecla `Esc`.
  - **Itens Ricos com Atalhos**: Suporte a ícones SVG, labels, atalhos decorativos (`<kbd>Ctrl+C</kbd>`), divisores, cabeçalhos de seção e itens destrutivos (`.text-danger`).

- **📑 Abas Reativas com Slider Deslizante (`FramePER.Tabs`)**:
  - **Zero Dependências**: Alternância instantânea de abas com WAI-ARIA nativo e atalhos de teclado (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
  - **Indicador Flutuante Fluido**: Barra deslizante animada (`.tab-indicator` e `.tab-indicator-pill`) com interpolação suave de posição (`translateX`) e largura (`width`).
  - **3 Variantes Visuais**: Linha clássica sublinhada (`.tabs`), Pílulas segmentadas (`.tabs-pills`) e Abas Verticais laterais (`.tabs-vertical` / `.tabs-layout-vertical`).
- **🪗 Accordions com Altura Fluida (`FramePER.Accordion`)**:
  - **Medição Dinâmica em Tempo Real**: Expansão e recolhimento precisos via `scrollHeight`, eliminando cortes e saltos visuais.
  - **Modo Exclusivo ou Múltiplo**: Recolhimento automático de itens irmãos (efeito sanfona tradicional) ou múltiplos abertos simultaneamente (`data-accordion-multiple="true"`).
  - **Navegação Acessível**: Foco automático, atributos `aria-expanded` / `aria-controls` e suporte a setas (&uarr; / &darr;), `Enter` e `Espaço`.
- **💬 Popovers com Auto-Posicionamento (`FramePER.Popover`)**:
  - **Componente Rico Flutuante**: Título (`.popover-header`), corpo com suporte a HTML/ações (`.popover-body`), seta indicadora (`.popover-arrow`) e botão de fechar.
  - **Detecção Inteligente de Bordas da Tela**: Posicionamento nas 4 direções (`top`, `bottom`, `left`, `right`) com inversão automática quando encosta na borda da viewport.
  - **Triggers Reativos**: Acionamento por clique ou hover, fechamento ao clicar fora ou pressionar `Escape`.
- **📁 File Uploader com Drag & Drop (`FramePER.Upload`)**:
  - **Zero Dependências**: Upload interativo em Vanilla JS e SCSS com suporte a arrastar e soltar (`dragenter`, `dragover`, `drop`).
  - **Previews & Miniaturas Inteligentes**: Geração instantânea de thumbnail para imagens (`URL.createObjectURL`) e ícones semânticos vetoriais para PDFs e documentos.
  - **Validação em Tempo Real**: Verificação estrita de limites de tamanho por arquivo (`data-uploader-max-size="10MB"`) e tipos MIME/extensões permitidas (`data-uploader-accept`).
  - **Progresso Individual & Feedback**: Barra de progresso reativa por item, contagem e peso total da fila, badges de status (*Pendente*, *0% a 100%*, *Concluído*, *Erro*) e notificações Toast integradas.
  - **Inicialização Híbrida**: Declarativa via HTML5 (`[data-uploader]`) ou programática (`new FramePER.Upload(el, options)`).
- **📅 Datepicker & Calendário Nativo (`FramePER.Datepicker`)**:
  - **Zero Dependências**: Calendário popover em puro JavaScript Vanilla e SCSS modular.
  - **Data Única & Intervalo (Range)**: Seleção de data única (`data-datepicker`) ou range contínuo (`data-datepicker="range"`) com realce no grid.
  - **Formatação Brasileira**: Padrão `DD/MM/AAAA`, atalhos de "Hoje", "Limpar", navegação de mês/ano e fechamento com `Escape` ou clique fora.
- **🔍 Dropdown Select Pesquisável (`FramePER.Select`)**:
  - **Filtro em Tempo Real**: Campo de pesquisa rápida com filtragem instantânea de opções.
  - **Multi-Select & Chips**: Suporte ao atributo `multiple` nativo com renderização de tags/chips interativas e remoção individual.
  - **Optgroups & Badges**: Suporte a grupos de opções, ícones e badges decorativas (`data-badge`).
- **💬 Tooltips Flutuantes Direcionais**:
  - **4 Posições**: Top (padrão), Bottom (`data-tooltip-pos="bottom"`), Left (`data-tooltip-pos="left"`), Right (`data-tooltip-pos="right"`).
  - **Variantes Semânticas**: Primary, Success, Danger, Warning e Light.
  - **Suporte Multilinha**: Quebra automática para mensagens explicativas longas (`data-tooltip-multiline="true"`).
- **📊 Framework de Gráficos SVG Nativo (`FramePER.Chart`)**:
  - **Zero Dependências**: Gráficos 100% vetoriais em puro SVG e Vanilla JS, infinitamente nítidos em telas Retina/HiDPI e com carga instantânea.
  - **✨ Animações Nativas de Entrada**: Traçado progressivo de curvas (`stroke-dashoffset`), crescimento fluido de barras a partir do eixo base (`scaleY`) e desvanecimento suave de áreas degradê.
  - **10 Modelos Suportados**:
    - **Gráfico Misto / Combo (`mixed`)**: Combinação flexível de barras agrupadas verticais com linhas/splines e pontos no mesmo gráfico.
    - **Área (`area`)**: Curvas bezier suaves com degradê vertical translúcido.
    - **Linha (`line`)**: Splines com pontos interativos, crosshair vertical e valores em tempo real.
    - **Colunas Verticais (`bar`)**: Barras agrupadas com cantos superiores arredondados e hover spotlight.
    - **Barras Horizontais (`horizontal-bar`)**: Rankings, canais e comparações com track de fundo.
    - **Rosca (`donut`)**: Anel com espessura customizável, texto no centro e cálculo automático de fatias.
    - **Pizza (`pie`)**: Distribuição percentual com hover highlight e tooltip.
    - **Velocímetro / Meta (`gauge`)**: Arco de progresso (180° a 220°) com limites e meta atingida.
    - **Radar / Teia (`radar`)**: Análise multi-eixos e matriz de competências.
    - **Mini-gráficos (`sparkline`)**: Gráficos compactos sem eixos para cartões de KPI e tabelas.
  - **Interatividade Total**: Tooltips flutuantes inteligentes, legendas clicáveis para alternar séries, adaptação automática ao Dark Mode e exportação direta para imagem **PNG (2x Retina)** e **SVG**.
  - **Inicialização Dupla**: Tanto programática via JS (`new FramePER.Chart('#id', config)`) quanto declarativa via HTML5 (`data-chart="area"` com `data-chart-data`).
- **🔍 Command Palette / Spotlight (`FramePER.CommandPalette`)**: Menu flutuante de busca global e execução de comandos acionado por atalho de teclado (`Ctrl+K` ou `Cmd+K`) ou botão declarativo `[data-command-palette]`, com navegação por teclado (`↑`, `↓`, `Enter`, `Esc`), categorias, badges e extensibilidade.
- **📱 Mobile First**: Layouts responsivos baseados em CSS Grid que se adaptam automaticamente a telas menores e expandem via breakpoints (`.grid-sm-*`, `.grid-md-*`, `.grid-lg-*`, `.grid-xl-*`).
- **🌙 Dark Mode & Light Mode Nativo**: Alternância automática de temas detectando a preferência do sistema operacional, com transições suaves e contraste otimizado.
- **🎨 Biblioteca de 107 Ícones Pure CSS**: Ícones SVG incorporados via máscara CSS (`-webkit-mask-image` / `mask-image`) com `currentColor`:
  - **Tecnologia, Computação & Redes (12)**: Processador/CPU (`icon-cpu`), Servidor rack (`icon-server`), Banco de dados (`icon-database`), Wi-Fi (`icon-wifi`), Nuvem (`icon-cloud`), Escudo (`icon-shield`), Bug/Depuração (`icon-bug`), Laptop (`icon-laptop`), Monitor (`icon-monitor`), Rede/Nodes (`icon-network`), Bluetooth (`icon-bluetooth`), Bateria com carga (`icon-battery`).
  - **Espaço & Cosmos (5)**: Foguete (`icon-rocket`), Planeta com anel (`icon-planet`), Satélite em órbita (`icon-satellite`), Telescópio (`icon-telescope`), Cometa (`icon-comet`).
  - **Animais & Pets (5)**: Pegada/Pata (`icon-paw`), Gato (`icon-cat`), Cachorro (`icon-dog`), Peixe (`icon-fish`), Pássaro (`icon-bird`).
  - **Atletismo, Esportes & Fitness (7)**: Troféu campeão (`icon-trophy`), Medalha de honra (`icon-medal`), Haltere/Musculação (`icon-dumbbell`), Frequência cardíaca/Atividade (`icon-activity`), Chama de calorias (`icon-flame`), Cronômetro de corrida (`icon-stopwatch`), Alvo/Precisão (`icon-target`).
  - **Jornalismo, Imprensa & Mídia (7)**: Jornal impresso (`icon-newspaper`), Artigo/Pauta (`icon-article`), Megafone/Divulgação (`icon-megaphone`), Câmera fotográfica (`icon-camera`), Microfone de reportagem (`icon-mic`), Rádio transmissor (`icon-radio`), Livro/Documento (`icon-book`).
  - **Beleza, Nail Design & Spa (22)**: Esmalte (`icon-nail-polish`), batom (`icon-lipstick`), tesoura (`icon-scissors`), brilho (`icon-sparkles`), pincel de maquiagem (`icon-makeup-brush`), pente (`icon-comb`), secador (`icon-hairdryer`), espelho (`icon-mirror`), perfume (`icon-perfume`), flor de lótus spa (`icon-lotus`), diamante (`icon-gem`), coroa (`icon-crown`), sérum hidratante (`icon-droplet`), pena (`icon-feather`), paleta de cores (`icon-palette`), creme facial (`icon-cream`), varinha de brilho (`icon-wand`), mão/manicure (`icon-hand`), flor floral (`icon-flower`), spray fixador (`icon-spray`), vela aromática (`icon-candle`), laço decorativo (`icon-ribbon`).
  - **E-Commerce & Vendas (5)**: Carrinho (`icon-cart`), etiqueta de preço (`icon-tag`), cartão de crédito (`icon-credit-card`), caixa/pacote (`icon-package`), caminhão de entrega (`icon-truck`).
  - **Comunicação, Arquivos & Sistema (49)**: Upload (`icon-upload`), Arquivo (`icon-file`), Arquivo PDF (`icon-file-pdf`), Imagem (`icon-image`), Mensagem, telefone, compartilhar, play, cadeado, olho, terminal, código, etc.
- **✨ Componentes Avançados de Interface**:
  - **Abas Deslizantes**: Slider fluído com transição suave de coordenadas e dimensões.
  - **File Uploader Shimmer & Progress**: Dragzone pontilhada com feedback visual, previews em miniatura e remoção individual.
  - **Command Palette Dialog**: Modal Spotlight com backdrop blur, atalhos de teclado e grupos filtráveis.
  - **Skeleton Loaders Shimmer**: Efeito ondulante suave (`.skeleton-avatar`, `.skeleton-title`, `.skeleton-text`, `.skeleton-rect`).
  - **Chips & Tags**: Pílulas compactas interativas, filtros clicáveis e tags removíveis (`.chip`, `.chip-clickable`, `.chip-remove`).
  - **Steppers de Progresso**: Guias em etapas responsivos para checkout e wizards (`.stepper`, `.step-done`, `.step-active`).
  - **Avatares com Status de Presença**: Indicadores visuais de presença (`.status-online`, `.status-busy`, `.status-away`, `.status-offline`).
- **🗂️ Side Modals & Drawers Laterais**: Modais flutuantes deslizantes (`.modal-side`, `.modal-side-right`, `.modal-side-left`, `.modal-bottom`).
- **📊 Tabelas Interativas Inteligentes**: Ordenação automática por colunas (`th.sortable`) e busca rápida em tempo real (`data-table-filter`).
- **🖥️ Demonstrativos Completos**:
  - **Gusto Artisan Kitchen & Delivery**: Cardápio digital gastronômico, vitrine com 12 pratos em arte vetorial SVG offline, categorias em pílulas com scroll horizontal, sacola lateral retrátil (`#cartDrawer`), cupons dinâmicos (`GUSTO10`, `FRAME15`), modal de checkout com máscaras automáticas e modal de rastreamento com Stepper progressivo em 4 etapas.
  - **Gráficos Interativos (Charts Showcase)**: 10 modelos incluindo Gráfico Misto (Combo) com sandbox dinâmico e exportação PNG/SVG.
  - **SaaS Admin Dashboard Suite**: Visão Geral com mini sparklines nos KPIs, gráfico misto com seletor de períodos reativos (7D, 30D, 90D, 1A), Donut de pagamentos e Command Palette.
  - **Aura Beauty & Nails Studio**: Salão de estética, nail design e agendamento online com ícones temáticos.
  - **Rede Social Demo**: Feed com Stories, hashtags, reações e chat.
  - **Loja de Roupas & Moda (E-Commerce)**: Vitrine de produtos com sacola lateral deslizante interativa.

---

## ⚙️ Módulos & Recursos JavaScript (`window.FramePER`)

- **📑 FramePER.Tabs**: Sistema de abas com indicador deslizante fluido, acessibilidade WAI-ARIA e suporte vertical.
- **🪗 FramePER.Accordion**: Sanfona com medição dinâmica de altura (`scrollHeight`), modo exclusivo e controle por teclado.
- **💬 FramePER.Popover**: Popovers flutuantes ricos com auto-posicionamento 4D, detecção de colisão na viewport e seta indicadora.
- **📁 FramePER.Upload**: Uploader completo com Drag & Drop, miniaturas, validação de arquivos e barra de progresso.
- **📅 FramePER.Datepicker**: Calendário flutuante em popover com seleção de data única e intervalo (range) `DD/MM/AAAA`.
- **🔍 FramePER.Select**: Select customizado pesquisável em tempo real com suporte a multi-select e tags/chips.
- **📈 FramePER.Chart**: Motor completo de gráficos vetoriais SVG com 10 tipos, animações nativas de entrada e exportação PNG/SVG.
- **🔍 FramePER.CommandPalette**: Spotlight flutuante com atalho `Ctrl+K` / `Cmd+K`, catálogo de páginas e ações rápidas extensíveis.
- **📋 FramePER.Clipboard**: Cópia para a área de transferência com um clique (`data-copy="texto"` ou `data-copy-target="#seletor"`).
- **📝 FramePER.Form**: Máscaras automáticas em tempo real para CPF, CNPJ, Telefone/Celular, CEP, Data e Moeda brasileira (`data-mask="cpf|cnpj|phone|cep|date|money"`).
- **🔢 FramePER.Counter**: Números animados com aceleração ease-out acionados via IntersectionObserver (`data-counter="14500"`).
- **🚀 FramePER.Scroll**: Botão flutuante automático de volta ao topo (`data-scroll-top`) e rolagem suave para âncoras (`data-scroll-to="#id"`).
- **🛡️ FramePER.Http & Security**: Fetch wrapper com detector de internet offline, CSRF token automático, sanitização anti-XSS (`FramePER.Security.escapeHTML`) e notificações toast (`FramePER.Notify`).
- **🔢 FramePER.Counter**: Números animados com aceleração ease-out acionados via IntersectionObserver (`data-counter="14500"`).
- **🚀 FramePER.Scroll**: Botão flutuante automático de volta ao topo (`data-scroll-top`) e rolagem suave para âncoras (`data-scroll-to="#id"`).
- **🛡️ FramePER.Http & Security**: Fetch wrapper com detector de internet offline, CSRF token automático, sanitização anti-XSS (`FramePER.Security.escapeHTML`) e notificações toast (`FramePER.Notify`).

---

## 📦 Como Utilizar

Inclua os arquivos compilados `dist/framePER.min.css` e `dist/framePER.min.js` no seu HTML:

```html
<!-- No <head> do projeto -->
<link rel="stylesheet" href="dist/framePER.min.css">

<!-- Antes de fechar a tag </body> -->
<script src="dist/framePER.min.js"></script>
```

---

## 💡 Exemplos Rápidos de Uso

### Máscaras e Alternador de Senha
```html
<input type="text" class="input" data-mask="cpf" placeholder="000.000.000-00">
<input type="text" class="input" data-mask="money" placeholder="R$ 0,00">

<div class="input-icon">
  <input type="password" id="senha" class="input">
  <button type="button" data-toggle="password" data-target="#senha">
    <i class="icon icon-eye"></i>
  </button>
</div>
```

### Copiar para Clipboard
```html
<button class="btn btn-outline" data-copy="git clone https://github.com/OrlanRocha/FramePER-CSS.git">
  <i class="icon icon-copy"></i> Copiar Repositório
</button>
```

### Contadores Animados
```html
<span data-counter="14850" data-counter-prefix="R$ ">R$ 0</span>
<span data-counter="99.9" data-counter-suffix="%">0%</span>
```

### Botão Voltar ao Topo
```html
<button class="btn btn-primary btn-icon back-to-top-btn" data-scroll-top aria-label="Voltar ao topo">
  <i class="icon icon-arrow-up"></i>
</button>
```

### File Uploader com Drag & Drop (HTML5 ou JS)
```html
<!-- Declarativo com Auto-Upload e limite de 10MB -->
<div data-uploader
     data-uploader-accept="image/*,application/pdf"
     data-uploader-max-size="10MB"
     data-uploader-max-files="5"
     data-uploader-auto-upload="true">
</div>

<!-- Programático com Callbacks -->
<script>
  const uploader = new FramePER.Upload('#meu-upload', {
    accept: 'image/*',
    maxSize: '5MB',
    onUploadSuccess: (item) => {
      console.log('Upload concluído com sucesso:', item.name);
    }
  });
</script>
```

### Menu de Contexto (Right-Click) & Dropdown Multinível
```html
<!-- Disparo via atributo em qualquer card ou container -->
<div class="card p-4" data-context-menu="#meu-menu-contextual">
  Clique com o botão direito aqui para abrir o menu contextual
</div>

<!-- Estrutura do menu de contexto com submenus e atalhos -->
<div id="meu-menu-contextual" class="context-menu" role="menu">
  <div class="context-menu-header">Opções do Registro</div>
  <button class="context-menu-item" data-action="copy">
    <span class="context-menu-label">Copiar Dados</span>
    <kbd class="context-menu-shortcut">Ctrl+C</kbd>
  </button>
  <button class="context-menu-item" data-action="edit">
    <span class="context-menu-label">Editar Registro</span>
    <kbd class="context-menu-shortcut">Ctrl+E</kbd>
  </button>
  <div class="context-menu-divider"></div>
  <!-- Submenu Multinível em Cascata -->
  <div class="context-menu-item has-submenu">
    <span class="context-menu-label">Exportar</span>
    <span class="context-menu-arrow">›</span>
    <div class="context-submenu">
      <button class="context-menu-item" data-action="export-pdf">Exportar em PDF</button>
      <button class="context-menu-item" data-action="export-csv">Exportar em CSV</button>
    </div>
  </div>
  <div class="context-menu-divider"></div>
  <button class="context-menu-item text-danger" data-action="delete">
    <span class="context-menu-label">Excluir</span>
    <kbd class="context-menu-shortcut">Del</kbd>
  </button>
</div>

<script>
  // Captura ações disparadas no menu contextual
  document.addEventListener('frameper:contextmenu:select', (e) => {
    console.log('Ação selecionada:', e.detail.action, e.detail.target);
  });
</script>
```

### Validador Reativo de Formulários (HTML5 ou JS)
```html
<!-- Validação Declarativa com Sumário e Feedback em Tempo Real -->
<form data-form-validator novalidate>
  <div class="form-group">
    <label for="campo-nome">Nome Completo</label>
    <input type="text" id="campo-nome" class="input" data-validate="required|min:3">
  </div>

  <div class="form-group">
    <label for="campo-email">E-mail</label>
    <input type="email" id="campo-email" class="input" data-validate="required|email">
  </div>

  <div class="form-group">
    <label for="campo-cpf">CPF</label>
    <input type="text" id="campo-cpf" class="input" data-validate="required|cpf" data-mask="cpf">
  </div>

  <div class="form-group">
    <label for="campo-senha">Senha</label>
    <input type="password" id="campo-senha" class="input" data-validate="required|min:6">
  </div>

  <div class="form-group">
    <label for="campo-confirma">Confirmar Senha</label>
    <input type="password" id="campo-confirma" class="input" data-validate="required|match:#campo-senha" data-message-match="As senhas não coincidem!">
  </div>

  <button type="submit" class="btn btn-primary">Cadastrar</button>
</form>

<script>
  // Inicialização programática com callbacks customizados
  const validator = new FramePER.FormValidator('#meu-form', {
    onSuccess: (formData, form) => {
      console.log('Formulário 100% válido!', formData);
    },
    onError: (errors) => {
      console.warn('Erros encontrados:', errors);
    }
  });

  // Registro de nova regra personalizada
  FramePER.FormValidator.addRule('forte', (val) => /[A-Z]/.test(val) && /[0-9]/.test(val), 'A senha precisa de letras maiúsculas e números.');
</script>
```

### Central de Atividades & Notificações em Drawer
```html
<!-- Botão gatilho com badge de não lidas -->
<button class="btn btn-ghost btn-icon p-relative" data-activity-feed-toggle>
  <i class="icon icon-bell"></i>
  <span class="activity-count-badge p-absolute" data-activity-badge>3</span>
</button>

<script>
  // Adiciona nova notificação ao feed em tempo real
  FramePER.ActivityFeed.add({
    title: 'Novo pedido #1042',
    desc: 'O pagamento foi confirmado e o pedido foi enviado para expedição.',
    time: 'Agora mesmo',
    type: 'success', // 'success' | 'warning' | 'danger' | 'info' | 'system'
    unread: true,
    action: { label: 'Rastrear', url: '#pedido-1042' }
  });

  // Abertura / Fechamento programático
  FramePER.ActivityFeed.open();
  FramePER.ActivityFeed.markAllAsRead();
</script>
```

### Split View & Painéis Redimensionáveis (SplitPane)
```html
<!-- Exemplo Declarativo (Horizontal com Persistência em LocalStorage) -->
<div class="split-pane" data-split-pane data-initial-split="30" data-min-size="150" data-persist="sidebar-layout">
  <div class="split-panel p-3">
    <!-- Painel Lateral Esquerdo (ex: Árvore de Arquivos ou Filtros) -->
    <h4>Sidebar</h4>
  </div>
  <div class="split-gutter">
    <div class="gutter-handle"></div>
  </div>
  <div class="split-panel p-3">
    <!-- Conteúdo Principal / Editor -->
    <h4>Área Principal</h4>
  </div>
</div>

<script>
  // Inicialização ou controle via JavaScript
  const split = FramePER.SplitPane.create('#meu-split', {
    direction: 'horizontal', // ou 'vertical'
    initialSplit: 35,        // porcentagem inicial
    minSize: 120,            // limite mínimo em px ou %
    maxSize: 85,             // limite máximo em px ou %
    persist: 'pref-sidebar'  // chave localStorage para salvar posição
  });

  // Métodos programáticos
  split.setSplit(50);         // define divisão em 50%
  split.toggleCollapse();     // recolhe ou restaura painel
  split.collapse(0);          // colapsa painel esquerdo
  split.expand();             // restaura divisão anterior

  // Evento reativo emitido a cada redimensionamento
  document.getElementById('meu-split').addEventListener('frameper:split:resize', (e) => {
    console.log('Split atualizado para:', e.detail.split + '%');
  });
</script>
```

### Tree View Interativo com Checkboxes & Busca (TreeView)
```html
<!-- Exemplo Declarativo com Checkboxes em Cascata -->
<ul id="minha-arvore" class="tree-view" data-tree-view data-checkable="true">
  <li class="tree-node is-expanded" data-node-id="admin">
    <div class="tree-node-content">
      <span class="tree-icon icon-folder"><i class="icon icon-folder"></i></span>
      <span class="tree-label">Administração</span>
    </div>
    <ul class="tree-children">
      <li class="tree-node" data-node-id="admin-users">
        <div class="tree-node-content">
          <span class="tree-label">Gestão de Usuários</span>
        </div>
      </li>
      <li class="tree-node" data-node-id="admin-billing">
        <div class="tree-node-content">
          <span class="tree-label">Faturamento & Pagamentos</span>
        </div>
      </li>
    </ul>
  </li>
</ul>

<script>
  // Inicialização ou busca em tempo real via JavaScript
  const tree = FramePER.TreeView.create('#minha-arvore', {
    checkable: true,        // ativa checkboxes tri-state
    cascadeCheck: true,     // propaga para filhos e atualiza pais
    multipleSelect: false   // seleção de nós
  });

  // Ações programáticas
  tree.expandAll();          // expande todas as pastas
  tree.collapseAll();        // recolhe todas as pastas
  tree.filter('faturamento'); // filtra e realça em tempo real
  tree.clearFilter();        // restaura visualização completa

  // Captura de itens marcados
  const checked = tree.getChecked(); // retorna array com { id, label, checked, indeterminate }

  // Eventos reativos
  document.getElementById('minha-arvore').addEventListener('frameper:tree:check', (e) => {
    console.log('Permissão alterada:', e.detail.label, e.detail.checked);
  });
</script>
```

### Data Grid Dinâmico com Paginação & Exportação (DataGrid)
```html
<!-- Exemplo Declarativo sobre Tabela HTML5 -->
<div id="minha-tabela" data-grid data-page-size="10" data-searchable="true" data-exportable="true">
  <table class="table">
    <thead>
      <tr>
        <th data-key="id" data-sortable="true">ID</th>
        <th data-key="nome" data-sortable="true">Nome</th>
        <th data-key="email" data-sortable="true">E-mail</th>
        <th data-key="plano" data-sortable="true">Plano</th>
        <th data-key="valor" data-sortable="true">Valor (R$)</th>
      </tr>
    </thead>
    <tbody>
      <tr data-id="1">
        <td>#1</td>
        <td>Camila Duarte</td>
        <td>camila@empresa.com</td>
        <td>Enterprise</td>
        <td>1250,00</td>
      </tr>
      <!-- Demais registros... -->
    </tbody>
  </table>
</div>

<script>
  // Inicialização ou controle via JavaScript
  const grid = FramePER.DataGrid.create('#minha-tabela', {
    pageSize: 10,
    searchable: true,
    selectable: true,
    exportable: true,
    onSelect: (selectedRows) => {
      console.log('Linhas selecionadas:', selectedRows);
    }
  });

  // Métodos da API
  grid.filter('empresa');      // busca em tempo real
  grid.setPage(2);             // navega para a página 2
  grid.sort('valor', 'desc');  // ordena por valor decrescente
  grid.selectAll();            // seleciona todas as linhas
  grid.exportCSV('dados.csv'); // download instantâneo em CSV
  grid.exportJSON('dados.json');// download instantâneo em JSON
</script>
```

### Kanban Board Drag-and-Drop (Kanban)
```html
<!-- Estrutura Declarativa do Quadro Kanban -->
<div id="meu-kanban" class="kanban-board" data-kanban data-persist="kanban-prefs">
  <!-- Coluna A Fazer -->
  <div class="kanban-column" data-column-id="col-todo">
    <div class="kanban-column-header">
      <h4 class="kanban-column-title">A Fazer</h4>
      <span class="kanban-count">1</span>
    </div>
    <div class="kanban-column-body">
      <div class="kanban-card" data-card-id="card-1">
        <div class="kanban-card-tags">
          <span class="badge badge-danger badge-xs">Prioridade Alta</span>
        </div>
        <div class="kanban-card-title">Criar testes unitários</div>
        <div class="kanban-card-desc">Cobrir fluxos de checkout e pagamentos com mock.</div>
        <div class="kanban-card-footer">
          <span><i class="icon icon-clock"></i> Amanhã</span>
          <span class="badge badge-pill badge-primary badge-xs">Lucas M.</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Coluna Concluído -->
  <div class="kanban-column" data-column-id="col-done">
    <div class="kanban-column-header">
      <h4 class="kanban-column-title">Concluído</h4>
      <span class="kanban-count">0</span>
    </div>
    <div class="kanban-column-body"></div>
  </div>
</div>

<script>
  // Inicialização e controle via JavaScript
  const kanban = FramePER.Kanban.create('#meu-kanban', {
    persist: 'minha-chave-storage',
    onMove: (e) => {
      console.log('Card movido:', e.cardId, 'Para coluna:', e.toColumnId);
    }
  });

  // Ações programáticas
  kanban.addCard('col-todo', {
    title: 'Nova Tarefa via API',
    desc: 'Criada dinamicamente via JavaScript sem recarregar a página.',
    tags: [{ label: 'Feature', className: 'badge-purple badge-xs' }],
    assignee: 'Mariana C.'
  });
</script>
```

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais detalhes.

