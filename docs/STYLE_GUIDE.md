# STYLE GUIDE — Sistema de Controle de Pedidos

> Guia de estilo oficial para desenvolvimento de interface. Aplicação densa em informação, voltada para operação diária (balcão, cozinha, gestão de pedidos). Prioridade máxima: **densidade de informação sem gerar scroll desnecessário**, legibilidade e velocidade de leitura.

---

## 1. Princípios de Design

1. **Compacto por padrão** — todo componente nasce no espaçamento mínimo viável. Só se aumenta padding/margin se a legibilidade for prejudicada.
2. **Hierarquia por cor e peso, não por espaço** — diferenciar seções com cor de fundo, borda ou peso de fonte, evitando "respiros" grandes em branco.
3. **Uma tela, uma ação clara** — o usuário deve entender o status de um pedido em menos de 2 segundos (cor + ícone + texto curto).
4. **Consistência acima de tudo** — mesmos componentes, mesmos espaçamentos, em toda a aplicação.
5. **Acessibilidade mínima garantida** — contraste AA (4.5:1) em todos os textos, mesmo no modo compacto.

---

## 2. Paleta de Cores

### 2.1 Cores-base da marca

| Nome | Hex | Uso |
|---|---|---|
| Azul Escuro (Primário) | `#0A1F44` | Header, sidebar, botões primários, textos de destaque |
| Azul Escuro (Hover/Variante) | `#12305E` | Hover de botões primários, cards ativos |
| Amarelo (Destaque) | `#FFC107` | Ações de atenção, badges "pendente", CTA secundário |
| Amarelo (Hover/Variante) | `#E6AC00` | Hover de elementos amarelos |
| Branco | `#FFFFFF` | Fundo base modo claro, textos sobre fundo escuro |

### 2.2 Modo Claro (Light Mode)

```css
--color-bg-base: #FFFFFF;
--color-bg-surface: #F5F7FA;      /* cards, tabelas */
--color-bg-surface-alt: #ECEFF3;  /* linhas alternadas, hover sutil */
--color-border: #DDE2E8;
--color-border-strong: #C3CBD6;

--color-primary: #0A1F44;
--color-primary-hover: #12305E;
--color-primary-contrast: #FFFFFF;

--color-accent: #FFC107;
--color-accent-hover: #E6AC00;
--color-accent-contrast: #0A1F44;

--color-text-primary: #101820;
--color-text-secondary: #4B5563;
--color-text-muted: #8A94A6;
--color-text-inverse: #FFFFFF;

--color-success: #1E8E5A;
--color-success-bg: #E5F6ED;
--color-warning: #C97A00;
--color-warning-bg: #FFF4DE;
--color-danger: #D64545;
--color-danger-bg: #FDEBEB;
--color-info: #2C6FCC;
--color-info-bg: #E8F1FD;
```

### 2.3 Modo Escuro (Dark Mode)

```css
--color-bg-base: #0A1220;
--color-bg-surface: #101B30;      /* cards, tabelas */
--color-bg-surface-alt: #16233D;  /* linhas alternadas, hover sutil */
--color-border: #223252;
--color-border-strong: #2F4570;

--color-primary: #FFC107;          /* no dark mode o amarelo assume papel de destaque primário de ação */
--color-primary-hover: #E6AC00;
--color-primary-contrast: #0A1220;

--color-accent: #3E6FD9;           /* azul mais claro para contraste em fundo escuro */
--color-accent-hover: #5A85E0;
--color-accent-contrast: #FFFFFF;

--color-text-primary: #F4F6FA;
--color-text-secondary: #B9C2D0;
--color-text-muted: #7C8AA0;
--color-text-inverse: #0A1220;

--color-success: #3DDC91;
--color-success-bg: #103825;
--color-warning: #FFC107;
--color-warning-bg: #3A2C05;
--color-danger: #FF6B6B;
--color-danger-bg: #3A1414;
--color-info: #5B9CFF;
--color-info-bg: #10233F;
```

> **Regra de troca de tema:** os tokens semânticos (`--color-bg-base`, `--color-text-primary` etc.) são os únicos usados nos componentes. Nunca referenciar hex diretamente no CSS de componentes — sempre via variável, para que o toggle de tema funcione trocando apenas o bloco `:root` / `[data-theme="dark"]`.

### 2.4 Uso de cor por status de pedido

| Status | Cor | Token |
|---|---|---|
| Novo / Recebido | Azul info | `--color-info` |
| Em preparo | Amarelo | `--color-accent` (light) / `--color-primary` (dark) |
| Pronto | Verde | `--color-success` |
| Atrasado | Vermelho | `--color-danger` |
| Cancelado | Cinza neutro | `--color-text-muted` |
| Entregue/Finalizado | Azul escuro | `--color-primary` (light) |

---

## 3. Tipografia

### 3.1 Fonte

**Fonte principal: [Inter](https://fonts.google.com/specimen/Inter)** — geométrica, alta legibilidade em tamanhos pequenos, ótima para tabelas e números (possui tabular figures).

**Fonte para números/valores monetários: `Inter` com `font-variant-numeric: tabular-nums`** (mantém alinhamento vertical em colunas de valores).

**Fallback stack:**
```css
--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace; /* usar em código de pedido, IDs */
```

Importação (Google Fonts):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### 3.2 Escala tipográfica (compacta)

Escala reduzida em relação ao padrão de mercado, pensada para telas densas:

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| `--fs-xs` | 11px | 500 | Badges, labels, timestamps |
| `--fs-sm` | 12.5px | 400/500 | Texto de tabela, corpo secundário |
| `--fs-base` | 13.5px | 400 | Corpo padrão |
| `--fs-md` | 15px | 600 | Títulos de card, subtítulos |
| `--fs-lg` | 18px | 700 | Títulos de seção |
| `--fs-xl` | 22px | 800 | Título de página |
| `--fs-2xl` | 28px | 800 | Números de destaque (dashboard) |

```css
--line-height-tight: 1.15;   /* títulos */
--line-height-base: 1.35;    /* corpo — compacto, mas legível */
--line-height-relaxed: 1.5;  /* textos longos, descrições */

--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

---

## 4. Espaçamento (Sistema Compacto)

Base de 4px, sem "pulos" grandes. Objetivo: reduzir ao máximo espaço morto, mantendo respiro suficiente para não parecer poluído.

```css
--space-0: 0px;
--space-1: 2px;
--space-2: 4px;
--space-3: 6px;
--space-4: 8px;
--space-5: 10px;
--space-6: 12px;
--space-7: 16px;
--space-8: 20px;
--space-9: 24px;
--space-10: 32px; /* usar apenas em separações macro entre seções, raramente */
```

### 4.1 Regras práticas de aplicação

| Elemento | Padding | Margin |
|---|---|---|
| Botão padrão | `6px 12px` (`--space-3 --space-6`) | — |
| Botão pequeno (ação em tabela) | `4px 8px` | — |
| Input / Select | `6px 10px` | `0 0 8px 0` entre campos |
| Card | `10px 12px` (`--space-5 --space-6`) | `8px` entre cards (grid gap) |
| Linha de tabela (`td`) | `6px 10px` | — |
| Cabeçalho de tabela (`th`) | `6px 10px` | — |
| Seção / Bloco | `12px` | `12px` entre blocos |
| Modal | `16px` | — |
| Header da aplicação | `8px 16px` altura fixa 48–52px | — |
| Sidebar item | `6px 10px` | `1px` entre itens |

**Regras gerais:**
- Nunca usar `padding` ou `margin` acima de `16px` em componentes internos de listagem/tabela.
- `gap` em grids e flex: padrão `8px`; em listas densas, `4px`.
- Não empilhar margin-top e margin-bottom no mesmo componente — usar apenas um lado (preferência: margin-bottom) para evitar soma imprevisível de espaços.
- Tabelas devem usar `border-collapse: collapse` e linhas com altura fixa (`36–40px`) para permitir mais itens visíveis sem scroll.
- Usar `overflow-y: auto` apenas no container interno de listas longas (nunca na página inteira), mantendo header/filtros fixos (`sticky`).

---

## 5. Grid e Layout

```css
--container-padding: 16px;      /* padding externo da página */
--container-padding-mobile: 10px;

--sidebar-width: 220px;
--sidebar-width-collapsed: 56px;
--header-height: 52px;
--topbar-filters-height: 44px;
```

- **Layout padrão:** sidebar fixa esquerda + header fixo topo + área de conteúdo com scroll interno independente.
- **Grid de cards (dashboard/pedidos):** `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px;`
- **Densidade de tabela:** priorizar tabela sobre cards quando a lista de pedidos ultrapassar ~15 itens visíveis — tabela é mais compacta.
- **Breakpoints:**
  - `--bp-sm: 480px`
  - `--bp-md: 768px`
  - `--bp-lg: 1024px`
  - `--bp-xl: 1280px`

---

## 6. Bordas, Sombra e Raio

```css
--radius-sm: 4px;   /* badges, chips */
--radius-md: 6px;   /* inputs, botões */
--radius-lg: 8px;   /* cards, modais */
--radius-full: 999px; /* pills de status */

--border-width: 1px;

--shadow-xs: 0 1px 2px rgba(10, 31, 68, 0.06);
--shadow-sm: 0 1px 3px rgba(10, 31, 68, 0.10);
--shadow-md: 0 4px 10px rgba(10, 31, 68, 0.12);
--shadow-dark-xs: 0 1px 2px rgba(0, 0, 0, 0.35);
--shadow-dark-sm: 0 1px 3px rgba(0, 0, 0, 0.45);
```

Preferir **borda de 1px** a sombra sempre que possível — sombra pesada quebra a estética compacta e "achata" a hierarquia visual.

---

## 7. Componentes

### 7.1 Botões

```css
.btn {
  font-size: var(--fs-sm);
  font-weight: var(--font-weight-semibold);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  line-height: 1;
  transition: background-color 120ms ease, border-color 120ms ease;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: 1px solid var(--color-primary);
}
.btn-primary:hover { background: var(--color-primary-hover); }

.btn-accent {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  border: 1px solid var(--color-accent);
}
.btn-accent:hover { background: var(--color-accent-hover); }

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-border-strong);
}

.btn-sm { padding: 4px 8px; font-size: var(--fs-xs); }
.btn-danger { background: var(--color-danger); color: #fff; border: 1px solid var(--color-danger); }
```

**Regras de uso:**
- `btn-primary` (azul): ações principais — "Criar pedido", "Salvar".
- `btn-accent` (amarelo): ações que pedem atenção imediata — "Marcar como pronto", "Confirmar entrega".
- `btn-outline`: ações secundárias — "Cancelar", "Ver detalhes".
- `btn-danger`: exclusão/cancelamento de pedido.

### 7.2 Badges de Status (pill)

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--fs-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1.4;
}
.badge-pending  { background: var(--color-warning-bg); color: var(--color-warning); }
.badge-progress { background: var(--color-info-bg); color: var(--color-info); }
.badge-ready    { background: var(--color-success-bg); color: var(--color-success); }
.badge-late     { background: var(--color-danger-bg); color: var(--color-danger); }
.badge-done     { background: var(--color-bg-surface-alt); color: var(--color-text-secondary); }
```

### 7.3 Cards de Pedido

```css
.order-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 10px 12px;
  box-shadow: var(--shadow-xs);
}
.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.order-card__id {
  font-family: var(--font-family-mono);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
}
.order-card__total {
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
}
```

### 7.4 Tabela de Pedidos

```css
.table-orders {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-sm);
}
.table-orders thead th {
  position: sticky;
  top: 0;
  background: var(--color-bg-surface);
  text-align: left;
  padding: 6px 10px;
  font-size: var(--fs-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-strong);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.table-orders tbody td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
  height: 38px;
}
.table-orders tbody tr:nth-child(even) {
  background: var(--color-bg-surface-alt);
}
.table-orders tbody tr:hover {
  background: var(--color-info-bg);
}
```

### 7.5 Inputs e Formulários

```css
.input, .select {
  width: 100%;
  padding: 6px 10px;
  font-size: var(--fs-sm);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
  color: var(--color-text-primary);
}
.input:focus, .select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.35);
}
.form-group { margin-bottom: 8px; }
.form-label {
  display: block;
  font-size: var(--fs-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}
```

### 7.6 Sidebar

```css
.sidebar {
  width: var(--sidebar-width);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 8px 6px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  color: rgba(255,255,255,0.85);
}
.sidebar-item.active {
  background: rgba(255, 193, 7, 0.15);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
  border-left: 3px solid var(--color-accent);
}
.sidebar-item:hover { background: rgba(255,255,255,0.06); }
```

### 7.7 Header

```css
.app-header {
  height: var(--header-height);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
```

---

## 8. Ícones

- Biblioteca recomendada: **Lucide Icons** (`lucide-react` ou `lucide` CDN) — traço fino, combina com Inter, ótimo em tamanho pequeno.
- Tamanho padrão: `16px` em tabelas/botões, `20px` em headers, `14px` em badges.
- `stroke-width: 2` como padrão.
- Cor herda de `currentColor` para acompanhar o tema automaticamente.

---

## 9. Dark Mode — Implementação

```css
:root {
  color-scheme: light;
  /* tokens do modo claro (seção 2.2) */
}

[data-theme="dark"] {
  color-scheme: dark;
  /* tokens do modo escuro (seção 2.3) */
}
```

```js
// Toggle de tema com persistência
const root = document.documentElement;
const saved = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', saved);

function toggleTheme() {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}
```

> Nota: em artifacts React no ambiente Claude, `localStorage` não é suportado — usar `useState` em memória para o toggle de tema nesse contexto específico.

**Transição suave ao trocar tema:**
```css
* {
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}
```

---

## 10. Estados e Feedback

| Estado | Tratamento visual |
|---|---|
| Hover | Escurece/clareia 8% o fundo do elemento (token `-hover`) |
| Focus | Anel de foco `2px` na cor accent, sem `outline` padrão do navegador |
| Disabled | `opacity: 0.5; cursor: not-allowed;` |
| Loading | Skeleton com `--color-bg-surface-alt` em animação `pulse` 1.2s |
| Erro de campo | Borda `--color-danger`, texto de erro `--fs-xs` abaixo do campo, `margin-top: 2px` |
| Vazio (empty state) | Ícone + texto curto centralizado, sem grandes espaços em branco ao redor |

---

## 11. Regras de Ouro (checklist rápido para dev)

- [ ] Nenhum componente de listagem usa padding/margin > 16px.
- [ ] Tabelas com header `sticky` e scroll interno, nunca scroll na página toda.
- [ ] Todas as cores vêm de variáveis CSS (tokens), nunca hex hardcoded no componente.
- [ ] Fonte Inter carregada com pesos 400/500/600/700/800 apenas (não carregar pesos não usados).
- [ ] Contraste mínimo AA verificado em ambos os temas.
- [ ] Status de pedido sempre comunicado por cor + texto (nunca só cor, por acessibilidade).
- [ ] `gap`/gutter padrão de 8px entre cards e itens de lista.
- [ ] Botões com altura consistente (`~30–32px` no padrão, `~24–26px` no small).
- [ ] Dark mode testado em todas as telas antes do merge.

---

## 12. Exemplo de Tokens Completo (CSS pronto para uso)

```css
:root {
  /* Light Mode */
  --color-bg-base: #FFFFFF;
  --color-bg-surface: #F5F7FA;
  --color-bg-surface-alt: #ECEFF3;
  --color-border: #DDE2E8;
  --color-border-strong: #C3CBD6;
  --color-primary: #0A1F44;
  --color-primary-hover: #12305E;
  --color-primary-contrast: #FFFFFF;
  --color-accent: #FFC107;
  --color-accent-hover: #E6AC00;
  --color-accent-contrast: #0A1F44;
  --color-text-primary: #101820;
  --color-text-secondary: #4B5563;
  --color-text-muted: #8A94A6;
  --color-text-inverse: #FFFFFF;
  --color-success: #1E8E5A; --color-success-bg: #E5F6ED;
  --color-warning: #C97A00; --color-warning-bg: #FFF4DE;
  --color-danger: #D64545;  --color-danger-bg: #FDEBEB;
  --color-info: #2C6FCC;    --color-info-bg: #E8F1FD;

  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --fs-xs: 11px; --fs-sm: 12.5px; --fs-base: 13.5px;
  --fs-md: 15px; --fs-lg: 18px; --fs-xl: 22px; --fs-2xl: 28px;

  --space-1: 2px; --space-2: 4px; --space-3: 6px; --space-4: 8px;
  --space-5: 10px; --space-6: 12px; --space-7: 16px; --space-8: 20px;

  --radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px; --radius-full: 999px;
}

[data-theme="dark"] {
  --color-bg-base: #0A1220;
  --color-bg-surface: #101B30;
  --color-bg-surface-alt: #16233D;
  --color-border: #223252;
  --color-border-strong: #2F4570;
  --color-primary: #FFC107;
  --color-primary-hover: #E6AC00;
  --color-primary-contrast: #0A1220;
  --color-accent: #3E6FD9;
  --color-accent-hover: #5A85E0;
  --color-accent-contrast: #FFFFFF;
  --color-text-primary: #F4F6FA;
  --color-text-secondary: #B9C2D0;
  --color-text-muted: #7C8AA0;
  --color-text-inverse: #0A1220;
  --color-success: #3DDC91; --color-success-bg: #103825;
  --color-warning: #FFC107; --color-warning-bg: #3A2C05;
  --color-danger: #FF6B6B;  --color-danger-bg: #3A1414;
  --color-info: #5B9CFF;    --color-info-bg: #10233F;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--fs-base);
  line-height: var(--line-height-base, 1.35);
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
}
```

---

*Versão 1.0 — Guia vivo: atualizar sempre que novos componentes forem criados, mantendo os mesmos tokens e a filosofia de compactação.*