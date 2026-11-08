# Editor de Vídeos Longos - Especificação

> Estado: Rascunho para aprovação
> Âmbito: preparação (especificação e análise de referências). Ainda não existe código de interface nem novo módulo no menu.

---

## 1. Problema operacional

As gravações do TempCast (episódios de 1 a 2 horas) são editadas à mão: limpar silêncios e falsos arranques, encontrar os melhores momentos, legendar e extrair cortes curtos para as redes sociais. Este trabalho é repetitivo, demorado e está disperso por várias ferramentas.

O editor de vídeos longos deve reduzir esse tempo, mantendo o controlo editorial nas mãos da equipa.

---

## 2. Fluxo proposto

Corresponde à fase **Edição** do pipeline de produção (`Ideia → … → Gravação → Edição → Shorts → …`) definido em `docs/APP_SPECIFICATION.md`.

| # | Etapa | O que acontece | Referência principal |
|---|-------|----------------|----------------------|
| 1 | Importação | Receber a gravação bruta e extrair o áudio | ffmpeg (próprio) |
| 2 | Transcrição e legendas | Transcrever localmente e separar falantes | AutoSubs |
| 3 | Limpeza | Marcar silêncios, falsos arranques e erros para revisão | Herk Edit Kit |
| 4 | Seleção de momentos | Encontrar trechos com potencial e propor cortes curtos | AutoClip |
| 5 | Pesquisa por sentido | Encontrar um trecho pelo conteúdo, sem lembrar as palavras exatas | StoryToolkitAI (ideia) |
| 6 | Capas e texto | Gerar título, descrição e capa por plataforma | AutoClip |
| 7 | Exportação | Entregar ao editor final (EDL/XML) ou renderizar | StoryToolkitAI (ideia) |

Etapas opcionais, fora da primeira entrega: remoção de fundo (BackgroundRemover), narração automática (NarratoAI) e sincronização labial (LatentSync).

---

## 3. Referências analisadas

Os repositórios foram clonados para análise (não foram copiados para este projeto). Licenças verificadas nos ficheiros `LICENSE` de cada repositório.

| Projeto | Repositório | O que traz | Licença | Stack | Avaliação |
|---------|-------------|------------|---------|-------|-----------|
| AutoClip | zhouxiaoka/autoclip | Vídeo longo → cortes com legenda, capa e texto por plataforma | MIT | FastAPI (Python), frontend, Tauri | Candidato principal para cortes curtos |
| AutoSubs | tmoroney/auto-subs | Legendas 100% locais, separação de falantes, integração com Resolve/Premiere | MIT | Tauri (Rust), Vite/TypeScript | Candidato principal para legendas |
| Herk Edit Kit | nateherkai/herk-edit-kit | Skills para Claude Code: cortar silêncios, marcar erros, legendas e motion graphics | MIT | Node.js, HyperFrames | Bom encaixe com o fluxo de Claude Code |
| NarratoAI | linyqh/NarratoAI | Roteiro com LLM, narração TTS e montagem automática | MIT | Python, Streamlit, MoviePy | Útil para narração; não prioritário |
| BackgroundRemover | nadermx/backgroundremover | Remove fundo de fotos e vídeos | MIT | Python, PyTorch, ffmpeg | Opcional (miniaturas e sobreposições) |
| OpenChatCut | 0xsline/OpenChatCut | Editor de vídeo por conversa com IA, linha do tempo, MCP | **AGPL-3.0** | TypeScript, Remotion, Electron | Apenas referência de ideias (ver secção 4) |
| StoryToolkitAI | octimot/StoryToolkitAI | Transcrição, pesquisa por sentido, montagem de histórias, EDL/XML | **GPL-3.0** | Python | Apenas referência de ideias (ver secção 4) |
| LatentSync | bytedance/LatentSync | Ajusta a boca do rosto a um novo áudio | Apache-2.0 (código); condições dos pesos a confirmar | Python, PyTorch, GPU | Fora do âmbito inicial; só com autorização de quem aparece |

---

## 4. Decisões de licença

1. **Licenças copyleft (AGPL-3.0 e GPL-3.0) não entram no código do TempCast Hub.** O hub pretende tornar-se um produto comercial (secção 10 de `docs/APP_SPECIFICATION.md`). Incorporar ou copiar código destes projetos obrigaria o produto a ser libertado sob a mesma licença. Estes dois projetos servem apenas como referência de ideias e de comportamento.
2. **Os projetos MIT podem ser usados**, mas só depois de decisão explícita sobre a forma de integração (serviço externo, executável local ou dependência). Cada integração deve ser registada aqui com a licença e a versão.
3. **Preferir integração por serviço separado** em vez de incorporar código de terceiros no Next.js. Isto mantém o hub leve, conforme `docs/APP_SPECIFICATION.md` e `ARCHITECTURE.md`.
4. **Modelos de IA** têm licenças próprias, distintas do código. Devem ser verificadas antes de qualquer uso comercial.
5. **Sincronização labial (LatentSync)** só deve ser usada com consentimento de quem aparece no vídeo e de quem fornece a voz.

---

## 5. Requisitos de primeira entrega

- Importar uma gravação longa e obter legendas locais (etapa 2).
- Mostrar marcadores de silêncios e possíveis erros para revisão humana (etapa 3).
- Propor cortes curtos com título e descrição, com aprovação antes de exportar (etapas 4 e 6).
- Exportar cortes e legendas, sem alterar a gravação original.
- Guardar o estado de cada trabalho (em curso, concluído, falhado) para que a equipa acompanhe a edição sem depender de folhas externas.

### Fora do âmbito da primeira entrega

- Edição fina na linha do tempo (fica no editor final da equipa).
- Narração, remoção de fundo e sincronização labial.
- Publicação automática nas redes sociais.

---

## 6. Requisitos técnicos e riscos

- **Processamento:** a transcrição e a análise de vídeo exigem CPU ou GPU. Decidir se corre no computador da equipa (como o AutoSubs) ou num servidor com GPU.
- **Armazenamento:** gravações de 1 a 2 horas ocupam vários gigabytes. Os ficheiros devem ficar fora da base de dados (Supabase) e só os metadados e o estado dos trabalhos devem ser sincronizados.
- **Custo de IA:** a seleção de momentos e a geração de títulos podem usar APIs pagas. Definir um limite por episódio.
- **Qualidade:** cortes automáticos precisam de revisão humana antes de publicação.

---

## 7. Questões em aberto

1. **Onde corre o processamento?** Local (desktop, como o AutoSubs) ou servidor com GPU?
2. **Formatos de saída:** apenas cortes verticais 9:16, ou também cortes horizontais e legendas em ficheiro SRT?
3. **Onde fica no menu?** Como módulo novo "Editor de Vídeo" ou dentro de "Centro de Produção", na fase Edição?
4. **Aprovação:** esta especificação deve ser incluída em `docs/APP_SPECIFICATION.md` como módulo oficial antes de avançar?

---

## 8. Fases propostas

| Fase | Entregável | Critério de conclusão |
|------|------------|-----------------------|
| A | Especificação e análise de referências (este documento) | Questões da secção 7 respondidas |
| B | Prova de conceito com um episódio real: legendas (AutoSubs) e cortes (AutoClip) | Tempo de edição medido e comparado com o método atual |
| C | Módulo no hub: interface, estado dos trabalhos e registo em Supabase | Fluxo das secções 2 e 5 disponível para a equipa |

Antes da fase C, é necessário aprovar o módulo na especificação geral e criar os tipos e as tabelas de dados.
