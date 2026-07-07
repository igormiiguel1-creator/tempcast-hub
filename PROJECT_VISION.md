# TempCast Hub - Visao do Projeto

## Objetivo da aplicacao

O TempCast Hub e a aplicacao interna para gerir a operacao do TempCast num unico espaco simples, organizado e previsivel. A aplicacao deve permitir acompanhar trabalho, conteudos, pessoas, parceiros, planeamento, biblioteca, relatorios e assistencia por IA sem dispersao por ferramentas soltas.

Nesta fase, o objetivo e criar uma fundacao tecnica solida: estrutura de projeto, navegacao, tema, layout responsivo e preparacao para sincronizacao futura com Supabase e Android.

## Problemas que resolve

- Centraliza a operacao interna do TempCast.
- Reduz dependencia de folhas, notas e ferramentas separadas.
- Facilita a consulta rapida do estado de trabalho.
- Cria uma base comum para episodios, convidados, tarefas e calendario.
- Prepara sincronizacao futura entre Windows, web e Android.
- Mantem uma interface em Portugues de Portugal, adaptada a utilizadores internos.

## Publico alvo

O publico alvo sao equipas internas do TempCast: producao, conteudo, gestao operacional, parcerias, redes sociais e direcao. A aplicacao deve servir pessoas tecnicas e nao tecnicas, com pouca necessidade de formacao.

## Filosofia do projeto

- Simplicidade primeiro.
- Clareza acima de quantidade de funcionalidades.
- Interface previsivel, com poucos cliques e pouca friccao.
- Crescimento modular por dominios da operacao.
- Dados estruturados e preparados para sincronizacao.
- Qualidade sustentavel ao longo de varios anos.
- Decisoes tecnicas conservadoras, testaveis e faceis de explicar.

## O que nunca devera acontecer

- A aplicacao nunca deve tornar-se confusa, pesada ou dificil de navegar.
- Nunca devem ser adicionadas funcionalidades sem um problema operacional claro.
- Nunca deve haver logica de negocio espalhada por componentes visuais.
- Nunca devem existir duplicacoes grandes que dificultem manutencao.
- Nunca devem ser criadas dependencias externas sem criterio.
- Nunca deve ser sacrificada a integridade dos dados por velocidade de entrega.
- Nunca deve ser assumido que todos os utilizadores sao tecnicos.
- Nunca deve haver texto ou fluxos fora do Portugues de Portugal sem razao explicita.

## Como tomar decisoes futuras

Cada decisao futura deve responder a estas perguntas:

1. Resolve um problema real da operacao TempCast?
2. Torna a interface mais simples ou mais dificil?
3. Mantem a arquitetura modular e facil de evoluir?
4. Protege a consistencia dos dados?
5. Pode ser testada e mantida por outra pessoa?
6. Esta alinhada com Next.js, React, TypeScript, Supabase e PostgreSQL?
7. Evita criar divida tecnica desnecessaria?

Quando houver conflito entre rapidez e qualidade, escolher a solucao mais simples que preserve a evolucao futura. Quando houver conflito entre flexibilidade e clareza, escolher clareza.
