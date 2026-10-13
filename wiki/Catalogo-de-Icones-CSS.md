# 💎 Catálogo de 280 Ícones em Puro CSS

O **FramePER** inclui uma coleção oficial de **280 ícones vetoriais em puro CSS**, embutidos diretamente no stylesheet através da técnica de `mask-image` com SVG em Data-URI.

---

### 🚀 Por que Ícones em Puro CSS?

A maioria dos frameworks modernos força o download de arquivos pesados de fontes (como FontAwesome ou Material Icons `.woff2` de 100KB+), gerando atrasos perceptíveis, piscamentos de tela (*FOIT/FOUT*) e problemas de alinhamento vertical.

| Recurso | Ícones Webfont Tradicionais | Ícones FramePER CSS |
| :--- | :--- | :--- |
| **Requisições de Rede** | Exige 1 ou mais arquivos `.woff2` externos | **Zero requisições extras** (embutido no CSS) |
| **Flash / Piscamento (FOIT)** | Letras ou quadrados vazios até a fonte carregar | **Renderização instantânea** (zero atraso) |
| **Herança de Cor** | Complexa, requer hacks em pseudos | **Nativa via `currentColor`** |
| **Alinhamento com Texto** | Frequentemente desalinhado por baseline de fonte | **Perfeito via `vertical-align: -0.125em`** |
| **Resolução em Telas Retina**| Pode sofrer pixelização ou anti-aliasing | **100% Vetorial e nítido em qualquer zoom** |

---

### 💻 Como Usar

Basta aplicar a classe base `.icon` juntamente com a classe específica do ícone:

```html
<i class="icon icon-home"></i>
<i class="icon icon-user"></i>
<i class="icon icon-sparkles"></i>
<i class="icon icon-coins"></i>
```

---

### 📏 Escalas de Tamanho

Os ícones herdam o `font-size` do elemento pai por padrão (1em). Você pode redimensioná-los com as classes utilitárias:

```html
<i class="icon icon-star icon-sm"></i> <!-- Pequeno: 0.8em -->
<i class="icon icon-star"></i>         <!-- Padrão: 1em -->
<i class="icon icon-star icon-md"></i> <!-- Médio: 1.5em -->
<i class="icon icon-star icon-lg"></i> <!-- Grande: 2em -->
<i class="icon icon-star icon-xl"></i> <!-- Extra Grande: 3em -->
```

---

### 🎨 Cores e Herança

Por utilizarem `background-color: currentColor`, os ícones adotam automaticamente a cor do texto onde estão inseridos ou qualquer classe utilitária de cor do FramePER:

```html
<i class="icon icon-heart text-danger"></i>  <!-- Vermelho -->
<i class="icon icon-check text-success"></i> <!-- Verde -->
<i class="icon icon-zap text-warning"></i>   <!-- Dourado / Amarelo -->
<i class="icon icon-shield text-primary"></i><!-- Azul -->
```

---

### 📂 As 12 Categorias Oficiais (Total: 280 Ícones)

#### 1. Essenciais, Interface & Navegação (29 ícones)
`home`, `user`, `settings`, `search`, `bell`, `check`, `close`, `menu`, `more-horizontal`, `more-vertical`, `filter`, `plus`, `minus`, `trash`, `edit`, `eye`, `eye-off`, `download`, `upload`, `share`, `external-link`, `refresh`, `power`, `log-out`, `log-in`, `help-circle`, `info`, `alert-triangle`, `alert-circle`.

#### 2. Setas, Direcionais & Chevron (18 ícones)
`arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right`, `chevrons-up`, `chevrons-down`, `chevrons-left`, `chevrons-right`, `corner-down-left`, `corner-down-right`, `corner-up-left`, `corner-up-right`, `move`, `maximize`.

#### 3. Mídia, Áudio, Vídeo & Entretenimento (18 ícones)
`play`, `pause`, `stop`, `video`, `music`, `headphones`, `podcast`, `mic`, `volume-high`, `volume-mute`, `gamepad`, `camera`, `newspaper`, `article`, `megaphone`, `radio`, `book`, `coffee`.

#### 4. Finanças, Comércio & Vendas (18 ícones)
`wallet`, `receipt`, `currency-dollar`, `currency-euro`, `chart-bar`, `trending-up`, `trending-down`, `percent`, `bank`, `coins`, `calculator`, `cart`, `tag`, `credit-card`, `package`, `truck`, `badge-percent`, `award`.

#### 5. Produtividade, Documentos & Office (19 ícones)
`file`, `file-text`, `file-code`, `file-spreadsheet`, `file-pdf`, `folder`, `folder-plus`, `archive`, `inbox`, `printer`, `briefcase`, `clipboard`, `clipboard-check`, `paperclip`, `pin`, `signature`, `envelope`, `calendar`, `bookmark`.

#### 6. Design, Cores & Edição Gráfica (13 ícones)
`palette`, `paint-bucket`, `brush`, `eyedropper`, `crop`, `layers`, `magic-wand`, `rotate-cw`, `rotate-ccw`, `flip-horizontal`, `sliders`, `image`, `sparkles`.

#### 7. Clima, Natureza & Viagens (19 ícones)
`sun`, `moon`, `cloud`, `cloud-rain`, `cloud-lightning`, `cloud-snow`, `wind`, `droplet`, `thermometer`, `umbrella`, `compass`, `map-pin`, `map`, `route`, `navigation`, `globe`, `airplane`, `anchor`, `leaf`.

#### 8. Dispositivos, Hardware & TI (15 ícones)
`monitor`, `laptop`, `tablet`, `smartphone`, `server`, `database`, `hard-drive`, `cpu`, `keyboard`, `mouse`, `printer-device`, `speaker`, `tv`, `battery-full`, `battery-charging`.

#### 9. Rede, Nuvem, Código & DevOps (20 ícones)
`terminal`, `git-branch`, `git-commit`, `git-merge`, `git-pull-request`, `cloud-upload`, `cloud-download`, `wifi`, `wifi-off`, `bluetooth`, `link`, `code`, `command`, `bug`, `shield-check`, `shield-alert`, `lock`, `unlock`, `key`, `fingerprint`.

#### 10. Segurança, Privacidade & Acessos (11 ícones)
`shield`, `shield-x`, `user-check`, `user-x`, `user-plus`, `user-minus`, `users`, `history`, `qr-code`, `barcode`, `biometric-face`.

#### 11. Redes Sociais, Comunicação & Marcas (20 ícones)
`whatsapp`, `instagram`, `linkedin`, `twitter`, `facebook`, `youtube`, `tiktok`, `github`, `discord`, `telegram`, `twitch`, `threads`, `message-square`, `message-circle`, `messages`, `at-sign`, `thumbs-up`, `thumbs-down`, `heart`, `star`.

#### 12. Novos Ícones Especializados & Exclusivos (80 ícones)
* **Inteligência Artificial & LLMs:** `prompt`, `token`, `neural-node`, `hallucination`, `rag`, `fine-tuning`.
* **Cultura & Pagamentos Brasileiros:** `pix`, `boleto`, `cuia`, `acai`, `pao-de-queijo`, `caipirinha`.
* **Biohacking & Saúde Moderna:** `circadian`, `glucometer`, `oximeter`, `pill-reminder`, `water-tracker`, `posture`.
* **Home Office & Produtividade Remota:** `ring-light`, `green-screen`, `stand-desk`, `noise-cancel`, `pomodoro`, `deep-work`.
* **Gaming & Cultura Gamer:** `loot-box`, `streak-flame`, `easter-egg`, `super-like`, `hype-train`, `rage-quit`.
* **E-Commerce & Logística:** `barcode-scan`, `tracking-box`, `same-day`, `cashback`, `gift-card`, `fast-shipping`.
* **Segurança Avançada & Web3:** `audit-badge`, `cold-wallet`, `gas-fee`, `smart-contract`, `two-factor`, `vpn-tunnel`.
* **Ambiente & Sustentabilidade:** `solar-panel`, `wind-turbine`, `recycle-bin`, `carbon-footprint`, `eco-leaf`, `water-drop`.
* **DevOps, Métricas & Observabilidade:** `latency-ping`, `pod-k8s`, `circuit-breaker`, `canary-release`, `uptime-gauge`, `log-stream`.
* **Mobile & Gestos de Toque:** `pinch-zoom`, `double-tap`, `pull-refresh`, `haptic-vibrate`, `auto-rotate`, `screen-lock`.
* **Viagem, Lifestyle & Nômade Digital:** `coworking`, `passport-stamp`, `luggage-tag`, `timezone-clock`, `sim-card`, `boarding-pass`.
* **Acessibilidade & Inclusão Digital:** `screen-reader`, `dyslexia-font`, `high-contrast`, `subtitles-cc`, `magnifier-zoom`, `sound-amplifier`.
* **SaaS, Assinaturas & Billing:** `tier-upgrade`, `seat-add`, `downgrade-cycle`, `invoice-send`, `unlimited-cloud`, `metered-usage`.
* **Educação, Cursos & Gamificação:** `diploma-scroll`, `quiz-choice`, `xp-badge`, `mentor-chat`, `flashcard`, `speed-reading`.

---

### 🔍 Teste no Navegador

Abra o **[Icon Studio Oficial](https://orlanrocha.github.io/FramePER/demo/icons.html)** para buscar instantaneamente, testar tamanhos, inspecionar em fundos claro/escuro e copiar o código em 1 clique.
