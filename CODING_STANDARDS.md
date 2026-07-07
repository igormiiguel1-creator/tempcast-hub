# TempCast Hub - Coding Standards

## Estrutura de pastas

A estrutura deve crescer de forma previsivel:

- `src/app`: rotas, layouts e paginas do App Router.
- `src/components/ui`: componentes base reutilizaveis no estilo shadcn/ui.
- `src/components/layout`: componentes estruturais da aplicacao.
- `src/components`: componentes transversais reutilizaveis.
- `src/config`: configuracao estatica da aplicacao, como navegacao.
- `src/lib`: clientes, utilitarios e integracoes tecnicas.
- `src/lib/supabase`: configuracao e helpers Supabase.
- `src/types`: tipos globais e tipos gerados.
- `src/features`: a criar quando surgirem funcionalidades reais por dominio.

Quando uma funcionalidade crescer, deve viver em `src/features/<dominio>` com os seus componentes, hooks, services e tipos especificos.

## Componentes

- Componentes devem ter uma responsabilidade clara.
- Componentes visuais nao devem conter regras de negocio.
- Componentes de layout devem ficar em `components/layout`.
- Componentes base reutilizaveis devem ficar em `components/ui`.
- Componentes especificos de uma funcionalidade devem ficar dentro da respetiva feature.
- Usar Server Components por defeito.
- Usar `"use client"` apenas quando houver estado, eventos, browser APIs, hooks client-side ou bibliotecas que o exijam.

## Hooks

- Hooks devem encapsular comportamento reutilizavel, nao markup.
- Hooks globais devem ficar em `src/hooks` apenas quando forem usados por mais do que uma feature.
- Hooks especificos devem ficar em `src/features/<dominio>/hooks`.
- Hooks devem ter nomes `useX`.
- Hooks nao devem esconder efeitos secundarios complexos sem nome claro.

## Services

- Services devem concentrar acesso a dados, APIs e regras operacionais.
- Services especificos devem ficar em `src/features/<dominio>/services`.
- Services Supabase devem depender de clientes definidos em `src/lib/supabase`.
- Componentes nao devem chamar queries complexas diretamente quando a logica puder ser isolada.

## Tipos

- Tipos globais vivem em `src/types`.
- Tipos de dominio vivem na respetiva feature.
- Tipos gerados pelo Supabase devem ser mantidos separados de tipos manuais.
- Evitar `any`.
- Preferir tipos explicitos em contratos publicos, props e services.

## Nomenclatura

- Componentes React: `PascalCase`.
- Ficheiros de componentes: `kebab-case.tsx`.
- Hooks: `use-kebab-case.ts` no ficheiro, `useX` no export.
- Services: `kebab-case.service.ts`.
- Tipos: `PascalCase`.
- Constantes globais: `camelCase` para listas/configuracoes, `UPPER_SNAKE_CASE` apenas para constantes imutaveis de ambiente tecnico.
- Rotas: slugs em minusculas e sem acentos.
- Texto visivel ao utilizador: Portugues de Portugal.

## Performance

- Evitar Client Components desnecessarios.
- Evitar estado global prematuro.
- Evitar renderizar listas grandes sem paginacao, filtros ou virtualizacao.
- Memorizar apenas quando houver custo real.
- Carregar dados no nivel mais adequado da rota ou feature.
- Manter bundles pequenos e dependencias justificadas.
- Evitar bibliotecas grandes para problemas pequenos.

## Reutilizacao

- Reutilizar quando houver padrao real, nao por antecipacao.
- Extrair componente quando houver repeticao significativa ou melhoria clara de leitura.
- Componentes reutilizaveis devem ser configuraveis, mas nao excessivamente genericos.
- Nao criar abstracoes que escondam comportamento importante.

## Clean Code

- Codigo deve ser simples de ler antes de ser engenhoso.
- Funcoes devem ser pequenas e ter nomes claros.
- Props devem ser explicitas.
- Comentarios devem explicar decisoes, nao repetir codigo.
- Remover codigo morto rapidamente.
- Erros devem ser tratados de forma previsivel e com mensagens uteis.

## SOLID

- Single Responsibility: cada modulo deve ter uma razao principal para mudar.
- Open/Closed: preferir extensao por composicao e configuracao.
- Liskov: componentes e services devem respeitar contratos esperados.
- Interface Segregation: evitar props ou interfaces gigantes.
- Dependency Inversion: logica de dominio nao deve depender diretamente de detalhes de UI.

## DRY

Evitar duplicacao estrutural, mas nao forcar abstracoes cedo demais. Duas repeticoes simples podem ser aceitaveis; tres repeticoes com padrao claro devem levar a extracao.

## KISS

A solucao mais simples que cumpre o objetivo e a preferida. Complexidade so deve entrar quando protege dados, reduz risco real ou melhora claramente a evolucao futura.
