# CortesFactory

Aplicação local para o PC que gera **cortes verticais 9:16 (1080×1920)** a partir de vídeos longos (episódios do TempCast).

Corre no próprio computador. Os vídeos não saem do PC e não é preciso internet nem conta.

## O que faz

1. Indica o caminho de um vídeo longo e mostra a duração e a resolução.
2. Escolhe o enquadramento:
   - **Vídeo inteiro com fundo desfocado**: não corta ninguém (recomendado para entrevistas).
   - **Enquadramento central**: preenche o ecrã e corta as laterais.
3. Recebe uma lista de cortes (início, fim e título), escrita à mão ou colada de uma lista.
4. Gera um ficheiro MP4 por corte (H.264 + AAC) numa pasta de saída, com progresso em tempo real.

Os ficheiros saem numerados pela ordem da lista, por exemplo `01_Porque_sai_da_zona_de_conforto.mp4`.

## Requisitos

- **Python 3.9 ou superior** (não precisa de instalar mais nada com `pip`).
- **ffmpeg** (inclui o `ffprobe`).

Instalação do ffmpeg:

- **Windows:** `winget install Gyan.FFmpeg` e, depois, feche e volte a abrir a janela de comandos.
- **macOS:** `brew install ffmpeg`
- **Ubuntu/Debian:** `sudo apt install ffmpeg`

Se o ffmpeg estiver noutro sítio, indique o caminho na variável de ambiente `CORTESFACTORY_FFMPEG`.

## Como arrancar

- **Windows:** faça duplo clique em `start.bat`.
- **macOS / Linux:** `./start.sh`

O browser abre em `http://127.0.0.1:8765/`. Para fechar a aplicação, feche a janela de arranque ou prima `Ctrl+C` nela.

## Como usar

1. Copie o caminho do vídeo. No Explorador do Windows: clique com o botão direito no ficheiro, com **Shift** premido, e escolha **Copiar como caminho**. Cole-o no campo **Vídeo original** e clique em **Analisar**.
2. Escolha o enquadramento.
3. Preencha os cortes. Tempos aceites: `1:20:05`, `00:01:20`, `80`, `00:01:20.5`.
   - Ou use **Colar uma lista de cortes**, com uma linha por corte: `00:01:20 - 00:02:05 - Título`.
4. Opcional: indique uma pasta de saída. Se ficar vazio, os cortes vão para uma pasta `cortes_verticais` junto ao vídeo.
5. Clique em **Gerar cortes** e acompanhe o progresso.

Só corre uma tarefa de cada vez. Os cortes de uma tarefa são gerados um a um.

## Testes

Na pasta `cortesfactory`:

```bash
python -m unittest discover -s tests -v
```

Os testes geram um vídeo de teste com o ffmpeg, cortam-no pela API HTTP real e verificam a resolução e a duração dos ficheiros com o ffprobe.

## Estrutura

```
cortesfactory/
  core.py              validação de tempos, comandos ffmpeg, nomes de ficheiro
  server.py            servidor local (só 127.0.0.1) e API de tarefas
  static/              interface (HTML, CSS e JavaScript simples)
  tests/               testes unitários e de integração
  start.bat            arranque no Windows
  start.sh             arranque no macOS / Linux
```

Não tem dependências de terceiros em Python. Só usa a biblioteca padrão e o ffmpeg.

## Limitações atuais

- Os cortes são escritos à mão ou colados. A deteção automática de momentos e a transcrição ficam para uma fase seguinte.
- As legendas não são queimadas no vídeo.
- Não há pré-visualização dentro da aplicação. Os ficheiros abrem-se no leitor habitual.
- Não é um executável `.exe`. A forma de uso no PC é o `start.bat`.

## Resolução de problemas

- **"ffmpeg em falta"**: o ffmpeg não está no PATH. Instale-o e reinicie a aplicação.
- **"Não foi possível ler o vídeo"**: confirme o caminho. Os formatos comuns (MP4, MOV, MKV) funcionam.
- **Porta 8765 ocupada**: arranque com outra porta, por exemplo `python server.py --port 8800`.
