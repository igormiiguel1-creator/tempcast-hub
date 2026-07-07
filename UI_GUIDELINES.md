# TempCast Hub - UI Guidelines

## Principios gerais

A interface deve ser inspirada em Monday.com e Notion: organizada, clara, rapida de navegar e facil de compreender. A aplicacao e uma ferramenta interna de operacao, por isso deve privilegiar eficiencia, consistencia e leitura rapida.

## Interface limpa

- Usar espaco visual de forma disciplinada.
- Evitar decoracao sem funcao.
- Evitar excesso de cores.
- Usar contraste suficiente em light mode e dark mode.
- Dar prioridade a conteudo, estado e proximas acoes.

## Poucos cliques

- Fluxos comuns devem estar acessiveis pela navegacao principal.
- Acoes frequentes devem estar perto do contexto onde sao usadas.
- Evitar modais desnecessarios.
- Evitar menus profundos.
- Nunca esconder informacao essencial atras de interacoes decorativas.

## UX simples

- Cada ecrã deve ter um objetivo claro.
- Estados vazios devem indicar o que existe naquele modulo sem adicionar funcionalidade falsa.
- A linguagem deve ser curta, direta e em Portugues de Portugal.
- Padroes de interacao devem repetir-se entre modulos.

## Consistencia visual

- Usar os tokens definidos em `globals.css`.
- Usar componentes de `src/components/ui` sempre que existirem.
- Usar icones `lucide-react` para acoes e navegacao.
- Manter cantos discretos, alinhados com shadcn/ui.
- Nao misturar estilos visuais por modulo sem razao operacional.

## Componentes reutilizaveis

Componentes reutilizaveis devem nascer de necessidades reais:

- `Button`: comandos e acoes.
- `AppShell`: estrutura global da aplicacao.
- `MainSidebar`: navegacao principal.
- `Header`: contexto da pagina e acoes globais.
- `EmptyPage`: placeholder estrutural para modulos ainda sem funcionalidade.

Novos componentes devem ser criados em `components/ui` quando forem base visual, em `components/layout` quando forem estrutura, ou na feature quando forem especificos de dominio.

## Espacamentos

- Usar escala Tailwind de forma consistente.
- Layouts principais devem usar `px-4`, `sm:px-6`, `lg:px-8`.
- Elementos interativos devem ter area clicavel confortavel.
- Agrupar informacao relacionada com menor espacamento interno.
- Separar secoes diferentes com espacamento maior ou divisores.

## Estados

Todos os componentes interativos devem considerar:

- Default.
- Hover.
- Focus visivel.
- Active.
- Disabled.
- Loading, quando houver operacoes assincronas.
- Empty, quando nao houver dados.
- Error, quando algo falhar.

Estados nao devem depender apenas de cor; devem ser compreensiveis por texto, icone ou estrutura.

## Tabelas

Tabelas serao usadas para informacao operacional densa:

- Cabeçalhos fixos ou claros.
- Colunas com nomes curtos.
- Ordenacao e filtros apenas quando houver dados reais.
- Linhas com altura consistente.
- Acoes por linha devem ser discretas.
- Em mobile, considerar listas compactas ou tabelas responsivas.

## Cards

Cards devem ser usados para itens repetidos, resumos ou blocos de informacao. Nao devem ser usados para embrulhar todas as secoes da pagina.

- Border radius discreto.
- Hierarquia clara.
- Conteudo curto.
- Estados hover apenas quando o card for interativo.

## Formularios

Formularios devem ser simples e previsiveis:

- Labels sempre visiveis.
- Validacao clara.
- Mensagens de erro junto ao campo.
- Acoes primarias e secundarias bem separadas.
- Evitar formularios longos sem seccoes.

## Responsividade

- Desktop Windows e prioridade inicial.
- Mobile deve continuar utilizavel para preparar Android no futuro.
- Sidebar fixa em desktop.
- Sidebar temporaria em mobile.
- Texto deve truncar quando necessario sem partir layout.
- Tabelas e listas devem adaptar-se a larguras pequenas.
