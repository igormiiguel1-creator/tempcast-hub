#!/usr/bin/env bash
# Carrega a memória persistente no início da sessão (SessionStart).
# O que for escrito em stdout é adicionado ao contexto do Claude.
set -uo pipefail

dir="${CLAUDE_PROJECT_DIR:-$(pwd)}/memory"
[ -d "$dir" ] || exit 0

echo "## Memória persistente (carregada de memory/)"
for f in user.md preferences.md personality.md decisions.md people.md active.md; do
  if [ -f "$dir/$f" ]; then
    echo
    echo "### memory/$f"
    cat "$dir/$f"
  fi
done

exit 0
