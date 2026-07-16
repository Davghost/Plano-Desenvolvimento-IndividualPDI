# Estrutura CSS - Escalabilidade e Manutenção

## Visão Geral

A estrutura CSS do projeto foi organizada seguindo a metodologia **SMACSS** (Scalable and Modular Architecture for CSS) com o objetivo de melhorar escalabilidade, manutenção e reutilização de código.

## Estrutura de Pastas

```
styles/
├── base/                 # Estilos fundamentais
│   ├── variables.css     # Variáveis globais (cores, espaçamentos, tipografia)
│   ├── reset.css         # Reset e normalização
│   └── typography.css    # Estilos de texto e tipografia
├── components/           # Componentes reutilizáveis
│   ├── button.css        # Botões (primário, secundário, etc)
│   ├── form.css          # Elementos de formulário
│   ├── card.css          # Cards, painéis, containers
│   ├── table.css         # Tabelas
│   └── input.css         # Inputs especializados e feedback
├── utilities/            # Classes utilitárias e patterns
│   └── animations.css    # Animações globais
├── pages/                # Estilos específicos de páginas
│   ├── login.css         # Login
│   ├── admin-users.css   # Admin - Listar usuários
│   ├── pdi-list.css      # PDI - Listar
│   ├── pdi-register.css  # PDI - Registrar
│   └── pdi-update.css    # PDI - Atualizar
└── index.css             # Arquivo principal que importa todos
```

## Princípios de Organização

### 1. **Variáveis Globais** (`base/variables.css`)

Todas as cores, espaçamentos e valores de design devem ser definidos como variáveis CSS:

```css
:root {
  /* Cores */
  --color-primary: #1769c2;
  --color-error: #b42318;
  
  /* Espaçamento */
  --spacing-lg: 16px;
  
  /* Tipografia */
  --font-size-lg: 1rem;
}
```

**Benefício:** Mudanças globais de design exigem apenas alteração em um lugar.

### 2. **Componentes Reutilizáveis** (`components/`)

Componentes são classes que podem ser aplicadas em qualquer lugar e não têm dependências de contexto específico:

```css
.btn { /* Estilos base do botão */ }
.btn-primary { /* Variação primária */ }
.btn-secondary { /* Variação secundária */ }
```

**Benefício:** Reutilização máxima, reduz duplicação.

### 3. **Estilos de Página** (`pages/`)

Cada página tem seu próprio arquivo CSS para estilos específicos:

```css
.pdi-list-container { /* Layout específico */ }
.pdi-item-actions { /* Ações específicas do PDI */ }
```

**Benefício:** Fácil localizar estilos de uma página específica, evita conflitos.

### 4. **Nomenclatura BEM Simplificada**

Usamos uma variação simplificada do BEM (Block Element Modifier):

```css
/* Block */
.pdi-list { }

/* Element */
.pdi-list__item { }

/* Modifier */
.pdi-list--empty { }
```

Ou com hífen para melhor legibilidade:

```css
.pdi-list { }
.pdi-list-item { }
.pdi-list-item-pending { }
```

## Como Adicionar Novos Estilos

### 1. **Novo Componente Reutilizável**

Se estiver criando um elemento que será usado em múltiplos lugares:

1. Adicione em `components/`
2. Use variáveis globais de `base/variables.css`
3. Crie variações com modificadores
4. Importe em `index.css`

**Exemplo:**

```css
/* components/badge.css */
.badge {
  display: inline-flex;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.badge-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.badge-error {
  background: var(--color-error);
  color: var(--color-text-inverse);
}
```

### 2. **Nova Página**

Se estiver criando uma nova página:

1. Crie arquivo em `pages/` (ex: `pages/nova-pagina.css`)
2. Defina classes específicas da página
3. Reutilize componentes globais quando possível
4. Importe em `index.css`

### 3. **Modificar Estilo Existente**

1. Localize o arquivo relevante usando a estrutura
2. Se for componente, modifique em `components/`
3. Se for página específica, modifique em `pages/`
4. Verifique o impacto em todas as páginas

## Convenções de Nomenclatura

### Classes

- **Componentes globais:** `.btn`, `.card`, `.form-group`
- **Componentes de página:** `.pdi-list`, `.pdi-item`, `.admin-users`
- **Modificadores:** `.btn-primary`, `.card-active`, `.pdi-card-pending`
- **Utilities:** `.animate-fade-in`, `.sr-only`

### Variáveis

```css
/* Cores */
--color-{intention}-{shade}: valor;
Ex: --color-primary-dark: #2866b1;

/* Espaçamento */
--spacing-{size}: valor;
Ex: --spacing-lg: 16px;

/* Tipografia */
--font-size-{size}: valor;
--font-weight-{weight}: valor;
```

## Media Queries

Use breakpoints definidos em `variables.css`:

```css
@media (max-width: var(--breakpoint-md)) {
  /* Estilos para tablet e menor */
}

@media (max-width: var(--breakpoint-sm)) {
  /* Estilos para mobile */
}
```

## Boas Práticas

### ✅ Faça

```css
/* Use variáveis */
.button {
  padding: var(--spacing-lg);
  color: var(--color-text-primary);
  transition: all var(--transition-normal);
}

/* Agrupe modificadores logicamente */
.button-primary { }
.button-secondary { }

/* Use transições para melhor UX */
&:hover {
  transform: translateY(-2px);
}
```

### ❌ Evite

```css
/* Valores hardcoded */
.button {
  padding: 16px;
  color: #182230;
}

/* Nomes genéricos */
.red-button { }
.big-text { }

/* Especificidade excessiva */
main div .container p.text { }
```

## Checklist de Manutenção

- [ ] Usar variáveis globais em vez de valores hardcoded
- [ ] Componentes têm no máximo 1-2 níveis de aninhamento
- [ ] Modificadores começam com a classe base
- [ ] Responsividade testada em mobile, tablet, desktop
- [ ] Transições usadas para melhorar UX
- [ ] Sem `!important` a menos que absolutamente necessário
- [ ] Nomes descritivos e em português quando possível

## Adição Futura

### Layout Grid/Flexbox Utilities

Se necessário, adicione `utilities/layout.css`:

```css
.flex { display: flex; }
.flex-center { justify-content: center; }
.grid { display: grid; }
```

### Estado Classes

Se necessário, adicione `utilities/states.css`:

```css
.is-loading { opacity: 0.6; }
.is-disabled { cursor: not-allowed; }
.is-active { background: var(--color-primary); }
```

## Referências

- [SMACSS - Scalable and Modular Architecture for CSS](http://smacss.com/)
- [BEM - Block Element Modifier](http://getbem.com/)
- [CSS Variables MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**Última atualização:** Julho 2026
**Responsável pela estrutura:** Admin System
