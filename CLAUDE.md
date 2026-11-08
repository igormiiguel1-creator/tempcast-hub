# TempCast Hub - Instruções para o Claude

## Projeto

Aplicação interna do TempCast: Next.js (App Router), React, TypeScript, TailwindCSS, shadcn/ui, Supabase/PostgreSQL como destino de dados. Gestor de pacotes: pnpm.

Antes de decisões de arquitetura ou de funcionalidades, ler:

- `PROJECT_VISION.md`
- `ARCHITECTURE.md`
- `CODING_STANDARDS.md`
- `docs/APP_SPECIFICATION.md`

## Regras essenciais

- Texto visível ao utilizador em Português de Portugal.
- Fase 1: não criar funcionalidades de negócio sem um problema operacional claro.
- Lógica de negócio fora de componentes visuais.
- Server Components por defeito; `"use client"` só quando for necessário.
- Evitar `any`.

## Memória persistente

A pasta `memory/` guarda o contexto que deve sobreviver de uma sessão para a outra:

| Ficheiro | Conteúdo |
| --- | --- |
| `memory/user.md` | Quem é o utilizador e como trabalha. |
| `memory/preferences.md` | Preferências de trabalho e de comunicação. |
| `memory/personality.md` | Como pensar, comunicar e decidir neste projeto. |
| `memory/decisions.md` | Decisões tomadas, com data e motivo. |
| `memory/people.md` | Pessoas da operação e o seu papel. |
| `memory/active.md` | O que está em curso e onde ficou a última sessão. |

**Início de sessão:** o hook `SessionStart` (`.claude/hooks/session-start.sh`) carrega estes ficheiros no contexto. Se essa informação não aparecer, lê-os manualmente antes de responder.

**Fim de sessão:** o hook `Stop` (`.claude/hooks/session-end.sh`) pede a atualização da memória. Ao atualizar:

- Regista apenas factos duradouros e confirmados.
- Nunca guardes segredos, tokens, credenciais ou dados pessoais sensíveis.
- Edita o ficheiro existente em vez de duplicar entradas.
- Decisões novas entram em `decisions.md` com data e motivo.
- `active.md` reflete sempre o estado atual.

Os ficheiros de `memory/` são versionados no git. Não guardes nada que não possa estar no histórico do repositório.
