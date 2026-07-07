# TempCast Hub - Arquitetura

## Estado atual

O projeto esta na Fase 1. A aplicacao tem a estrutura base criada com Next.js, React, TypeScript, TailwindCSS, shadcn/ui, Supabase e PostgreSQL como destino de dados. Ainda nao existem funcionalidades de negocio, por decisao explicita.

O foco atual e ter uma fundacao organizada, responsiva, em Portugues de Portugal e pronta para crescer por modulos.

## Stack tecnica

- Next.js com App Router.
- React.
- TypeScript.
- TailwindCSS.
- shadcn/ui como referencia de componentes.
- Supabase client preparado.
- PostgreSQL via Supabase no futuro.
- pnpm como package manager.

## Organizacao das pastas

```text
src/
  app/
    layout.tsx
    page.tsx
    <rota>/page.tsx
    globals.css
  components/
    layout/
    ui/
    theme-provider.tsx
    theme-toggle.tsx
  config/
    navigation.ts
  lib/
    supabase/
      client.ts
    utils.ts
  types/
    database.types.ts
supabase/
  config.toml
```

## `src/app`

Contem a estrutura de rotas do App Router. Cada modulo pedido tem uma pagina vazia:

- Dashboard
- Episodios
- Convidados
- Roadmap
- Calendario
- Tarefas
- Redes Sociais
- Parceiros
- Biblioteca
- Relatorios
- IA
- Configuracoes

As rotas usam slugs sem acentos para manter URLs simples e estaveis.

## `src/components/layout`

Contem os componentes estruturais:

- `AppShell`: envolve a aplicacao com sidebar, header e area principal.
- `MainSidebar`: navegacao lateral responsiva.
- `Header`: mostra contexto da pagina atual e acoes globais.
- `EmptyPage`: placeholder consistente para paginas ainda sem funcionalidade.

Esta separacao evita duplicar layout em cada pagina.

## `src/components/ui`

Contem componentes base reutilizaveis no estilo shadcn/ui. Atualmente existe `Button`, usado por header, sidebar e theme toggle.

Esta pasta deve crescer com componentes genericos, nao com componentes de dominio.

## `src/config`

Contem configuracao estatica. Atualmente `navigation.ts` e a fonte unica da navegacao principal, incluindo titulo, rota e icone.

Esta decisao evita divergencias entre sidebar, header e futuras permissoes.

## `src/lib`

Contem utilitarios e integracoes tecnicas:

- `utils.ts`: helper `cn` para compor classes Tailwind.
- `supabase/client.ts`: factory do cliente Supabase para uso futuro.

## `src/types`

Contem tipos globais. `database.types.ts` e um placeholder inicial para tipos Supabase, que devera ser substituido ou atualizado quando existir schema real.

## `supabase`

Contem configuracao inicial do Supabase local. O projeto ainda nao define migrations nem tabelas, porque a Fase 1 nao inclui funcionalidades.

## Fluxo da aplicacao

1. `src/app/layout.tsx` define metadata, idioma `pt-PT`, fontes e providers globais.
2. `ThemeProvider` gere light mode e dark mode.
3. `AppShell` define a estrutura persistente.
4. `MainSidebar` usa `navigationItems` para renderizar links.
5. `Header` usa a rota atual para apresentar o contexto.
6. Cada pagina renderiza `EmptyPage` com o titulo do modulo.

## Decisoes tomadas

### App Router

Foi escolhido por ser o padrao atual do Next.js e por permitir crescimento com layouts, Server Components e rotas modulares.

### Client Components limitados

Componentes com estado, eventos ou hooks de browser usam `"use client"`. Paginas vazias e componentes simples permanecem sem estado sempre que possivel.

### Navegacao centralizada

A navegacao vive em `src/config/navigation.ts` para reduzir duplicacao e facilitar futuras permissoes, filtros por perfil ou breadcrumbs.

### Layout persistente

Sidebar e header estao no layout global para manter consistencia e evitar repeticao.

### Supabase preparado, nao acoplado

O cliente Supabase existe, mas ainda nao e usado nas paginas. Isto prepara a integracao sem criar funcionalidades prematuras.

### Rotas sem acentos

URLs usam slugs sem acentos para compatibilidade, legibilidade e estabilidade.

## Como crescer no futuro

Quando forem criadas funcionalidades reais, introduzir:

```text
src/features/
  episodios/
    components/
    hooks/
    services/
    types/
    schemas/
  convidados/
    components/
    hooks/
    services/
    types/
    schemas/
```

Cada feature deve conter a sua logica de dominio. Componentes globais so devem ser extraidos quando forem verdadeiramente reutilizaveis.

## Dados e sincronizacao

O Supabase sera a fonte de verdade para sincronizacao. A arquitetura deve proteger:

- Tipos gerados a partir do schema.
- Services isolados por dominio.
- Validacao de dados antes de escrita.
- Politicas de acesso claras quando houver autenticação.
- Migrations versionadas.

## Performance futura

- Manter o maximo possivel em Server Components.
- Carregar dados por rota ou por feature.
- Evitar dependencias pesadas sem necessidade.
- Usar paginacao para listas grandes.
- Considerar cache e revalidacao apenas quando houver padroes de leitura reais.

## Riscos atuais

- Os tipos Supabase ainda sao placeholders.
- Ainda nao existem decisoes de autenticacao, permissoes ou modelo de dados.
- Ainda nao existe estrutura `features` porque nao ha funcionalidades implementadas.

Estes pontos sao aceitaveis na Fase 1 e devem ser resolvidos antes de iniciar desenvolvimento funcional.
