# 🎨 Sistema de Cores e Temas (Light & Dark Mode)

O **FramePER** foi construído desde o primeiro dia com arquitetura de temas nativa. Ele utiliza **CSS Custom Properties (variáveis CSS)** associadas a mixins Sass para garantir transições suaves, excelente contraste e adaptação automática entre os modos Claro e Escuro.

---

### 1. Suporte a Light & Dark Mode

O framework suporta três maneiras de controlar o tema:

1. **Atributo HTML explícito:** Adicione `data-theme="dark"` ou `data-theme="light"` na tag `<html>`:
   ```html
   <html lang="pt-BR" data-theme="dark">
   ```
2. **Detecção automática do Sistema Operacional:** Se nenhum atributo `data-theme` for definido, o FramePER segue a preferência do usuário configurada no Windows, macOS, Linux, iOS ou Android (`@media (prefers-color-scheme: dark)`).
3. **Seções com tema isolado:** É possível forçar uma seção específica (como um footer ou hero) a ser sempre escura ou clara:
   ```html
   <section class="theme-dark">
     <!-- Sempre escuro, mesmo se a página estiver em Light Mode -->
   </section>
   ```

---

### 2. Tokens de Cores Globais (`:root`)

Todas as cores do FramePER adaptam seus tons automaticamente para garantir legibilidade e contraste adequado:

| Token CSS | Descrição | Valor Light | Valor Dark |
| :--- | :--- | :--- | :--- |
| `--primary` | Cor de destaque principal (Marca) | `#2563eb` (Azul 600) | `#3b82f6` (Azul 500) |
| `--success` | Indicador de sucesso e positivo | `#16a34a` (Verde 600) | `#22c55e` (Verde 500) |
| `--warning` | Indicador de alerta e atenção | `#eab308` (Amarelo 500) | `#facc15` (Amarelo 400) |
| `--danger` | Indicador de erro e crítico | `#dc2626` (Vermelho 600) | `#ef4444` (Vermelho 500) |
| `--info` | Indicador informativo | `#0284c7` (Sky 600) | `#38bdf8` (Sky 400) |
| `--purple` | Indicador de destaque secundário | `#9333ea` (Roxo 600) | `#a855f7` (Roxo 500) |
| `--bg-body` | Fundo principal da página | `#fafafa` | `#09090b` |
| `--bg-surface`| Fundo de cartões, modais e inputs | `#ffffff` | `#111113` |
| `--bg-subtle` | Fundo secundário suave / previews | `#f4f4f5` | `#1a1a1d` |
| `--text-main` | Texto principal com alto contraste | `#18181b` | `#fafafa` |
| `--text-muted`| Texto secundário / descrições | `#71717a` | `#a1a1aa` |
| `--border-color`| Borda suave padrão | `#e4e4e7` | `#27272a` |

---

### 3. Alternador de Tema via JavaScript

O FramePER inclui lógica integrada para alternar temas ao clicar em elementos com o atributo `data-theme-toggle`:

```html
<!-- Botão de alternar tema com ícones de sol e lua -->
<button class="btn btn-ghost btn-icon theme-toggle" data-theme-toggle aria-label="Alternar Tema">
  <i class="icon icon-moon"></i>
  <i class="icon icon-sun"></i>
</button>
```

Se preferir alternar programaticamente em seu código JavaScript:

```javascript
// Ativar modo escuro
document.documentElement.setAttribute('data-theme', 'dark');

// Ativar modo claro
document.documentElement.setAttribute('data-theme', 'light');

// Alternar dinamicamente
const current = document.documentElement.getAttribute('data-theme');
document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
```

---

### 4. Helpers SCSS para Criação de Temas

Se você estiver escrevendo estilos personalizados em SCSS, o FramePER oferece funções utilitárias que utilizam `color-mix()` do CSS nativo para gerar variações temáticas automaticamente:

```scss
@use 'variables' as *;

.meu-card-especial {
  // Gera uma cor de fundo com 12% de opacidade da cor azul do tema
  background-color: tint("blue", 12%);
  
  // Gera uma cor de texto que mantém alto contraste contra o fundo
  color: readable("blue");
  
  &:hover {
    // Gera uma sombra 14% mais escura para o estado hover
    background-color: shade("blue", 14%);
  }
}
```
