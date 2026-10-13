# 🛠️ Guia de Contribuição e Pipeline de Build

Este guia documenta os padrões de arquitetura, fluxo de desenvolvimento e convenções adotadas no desenvolvimento do **FramePER**.

---

### 1. Pré-requisitos

* **Node.js:** versão 18.x ou superior (testado e homologado no Node 20 / 22 / 24).
* **NPM:** versão 9.x ou superior.
* **Git:** instalado e configurado.

---

### 2. Configurando o Ambiente Local

Clone o repositório e instale as dependências de desenvolvimento:

```bash
git clone https://github.com/OrlanRocha/FramePER.git
cd FramePER
npm install
```

As dependências de build incluem:
* `sass`: compilador oficial Dart Sass.
* `postcss` & `postcss-cli`: pós-processamento de CSS.
* `autoprefixer`: prefixação automática de fornecedores (`-webkit-`, etc.).
* `cssnano`: minificação extrema e remoção de redundâncias de CSS.
* `terser`: minificação e geração de source maps para JavaScript moderno.

---

### 3. Pipeline de Build

Execute a compilação completa de todos os assets:

```bash
npm run build
```

Este comando executa a seguinte cadeia de tarefas sequenciais:
1. `npm run build:sass`: compila `src/scss/framePER.scss` para `dist/framePER.css`.
2. `npm run build:postcss`: processa `dist/framePER.css` gerando `dist/framePER.min.css`.
3. `npm run build:js-copy`: copia `src/js/framePER.js` para `dist/framePER.js`.
4. `npm run build:js`: minifica `src/js/framePER.js` para `dist/framePER.min.js`.

---

### 4. Como Criar um Novo Componente

#### Passo 1: Criar o arquivo SCSS
Crie o arquivo parcial em `src/scss/components/_nome-do-componente.scss`:
```scss
@use '../variables' as *;

.nome-do-componente {
  display: block;
  padding: 1rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}
```

#### Passo 2: Registrar no Ponto de Entrada
Abra `src/scss/framePER.scss` e adicione o `@use`:
```scss
@use 'components/nome-do-componente';
```

#### Passo 3: Adicionar Lógica JavaScript (se aplicável)
Abra `src/js/framePER.js`, crie o objeto do componente e adicione a chamada no `init()`:
```javascript
const MeuComponente = {
  init() {
    document.querySelectorAll('[data-meu-componente]').forEach(el => {
      // lógica de inicialização
    });
  }
};
FramePER.MeuComponente = MeuComponente;
```

#### Passo 4: Adicionar Demonstração
Crie um exemplo prático na página correspondente dentro da pasta `demo/` (ex: `demo/components.html`).

#### Passo 5: Compilar e Testar
```bash
npm run build
```

---

### 5. Convenções de Commit

Adotamos a especificação de **Conventional Commits**:

* `feat(...)`: Adição de um novo componente, recurso ou ícone.
* `fix(...)`: Correção de bug visual, erro de script ou ajuste de layout.
* `docs(...)`: Alteração em arquivos de documentação, README ou Wiki.
* `refactor(...)`: Refatoração interna sem alterar o comportamento externo.
* `perf(...)`: Otimização de performance ou redução no tamanho do bundle.

---

### 6. Como Sincronizar com o Wiki do GitHub

Os arquivos desta pasta `wiki/` podem ser sincronizados com o repositório oficial de Wiki do GitHub:

1. Acesse o repositório no GitHub: `https://github.com/OrlanRocha/FramePER/wiki`.
2. Se o wiki ainda não tiver nenhuma página, clique no botão verde **"Create the first page"** e salve a primeira página (pode ser o conteúdo de `Home.md`).
3. Uma vez criada, o GitHub inicializa o repositório Git do Wiki em:
   `https://github.com/OrlanRocha/FramePER.wiki.git`
4. Você pode clonar esse repositório do wiki em uma pasta temporária e copiar todos os arquivos `.md` de `wiki/`:
   ```bash
   git clone https://github.com/OrlanRocha/FramePER.wiki.git
   cp wiki/*.md FramePER.wiki/
   cd FramePER.wiki
   git add .
   git commit -m "docs: atualizar wiki completo v2.26.0"
   git push origin master
   ```
