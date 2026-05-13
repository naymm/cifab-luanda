# CIFAB — Valuation & Investment Model

Dashboard interactivo para o modelo de valuation do CIFAB (SANEP Farmacêutica / Luanda).
Construído com **React 18 + Vite + TypeScript + Tailwind CSS v4** e gráficos com **Recharts**.

## Funcionalidades

- Selectores globais de **cenário** (Conservador / Base / Optimista) e **horizonte** (5 / 7 / 12 anos)
- **6 ecrãs sincronizados**:
  1. Overview — sumário executivo, KPIs, evolução financeira
  2. CAPEX / OPEX — capital por fase e despesas operacionais
  3. Modelo de Receitas — desagregação unidade por unidade
  4. Valuation — DCF, múltiplos comparáveis, peers africanos
  5. Pré/Pós Money — calculadora interactiva de ronda
  6. Caminho ao Bilhão — trajectória do Enterprise Value até $1B
- **3 idiomas** com detecção automática por região: Português, Inglês, Francês
- **Modo claro/escuro** com detecção da preferência do sistema operativo e override do utilizador

## Stack

| Camada | Tecnologia |
| --- | --- |
| Build | Vite 5 |
| UI | React 18 |
| Linguagem | TypeScript 5 |
| Estilos | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Gráficos | Recharts 2 |
| i18n | i18next + react-i18next + browser-languagedetector |
| Tema | Context API + `prefers-color-scheme` |

## Estrutura

```
cifab/
├── index.html              # bootstrap + inline script anti-FOUC
├── package.json
├── vite.config.ts
├── tsconfig*.json
└── src/
    ├── main.tsx                          # bootstrap React + ThemeProvider + i18n
    ├── App.tsx                           # componente principal (todos os ecrãs)
    ├── index.css                         # Tailwind + variáveis de tema CIFAB
    ├── vite-env.d.ts
    ├── theme/
    │   └── ThemeContext.tsx              # contexto, hooks, paletas claro/escuro
    ├── i18n/
    │   ├── index.ts                      # config i18next + detector
    │   └── locales/{pt,en,fr}.json       # traduções
    └── components/
        ├── LanguageSelector.tsx          # dropdown PT/EN/FR
        └── ThemeToggle.tsx               # botão sol/lua
```

## Idiomas e detecção

- A primeira visita escolhe automaticamente a língua a partir de `navigator.language`/`navigator.languages` (ex: `pt-AO`, `pt-BR`, `pt-PT` → PT; `en-US`, `en-GB` → EN; `fr-FR`, `fr-CA` → FR).
- Fallback: Inglês.
- A escolha do utilizador no dropdown é persistida em `localStorage` (chave `cifab-lang`).

## Tema claro/escuro

- Por defeito, segue `prefers-color-scheme` do sistema operativo.
- Toggle no header (sol/lua) faz override; preferência guardada em `localStorage` (chave `cifab-theme`).
- Enquanto o utilizador não fizer override explícito, mudanças no SO actualizam a UI em tempo real.
- Pequeno script inline no `index.html` aplica o background correcto antes do React montar, evitando flash de tema errado.

## Comandos

```bash
# instalar dependências
npm install

# servidor de desenvolvimento (http://localhost:5173)
npm run dev

# build de produção (output em /dist)
npm run build

# pré-visualizar build
npm run preview

# verificação de tipos
npm run lint
```

## Adicionar/editar traduções

Cada chave em `src/i18n/locales/pt.json` deve ter equivalente em `en.json` e `fr.json`. Strings interpoladas usam `{{nome}}`. Texto rico (com `<strong>`) usa `<0>...</0>` e é renderizado com o componente `<Trans>`.

## Notas

- Documento **confidencial** — uso exclusivo em processos de financiamento autorizados.
- Os pressupostos numéricos do modelo (revenue, EBITDA, FCF, EV, etc.) estão em `src/App.tsx`; ajustes = edição directa das constantes.
- Nomes próprios (SANEP, Okavango, Zambezi, BODIVA, JSE, Aspen, etc.) são mantidos em todas as línguas.
