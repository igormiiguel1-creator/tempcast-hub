#!/usr/bin/env bash
# Pede ao Claude que atualize a memória antes de terminar (Stop).
# Bloqueia apenas uma vez: quando stop_hook_active é true, deixa terminar para evitar ciclos.
set -uo pipefail

input="$(cat)"
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

cat <<'EOF'
{"decision":"block","reason":"Antes de terminar, atualiza a memória do projeto em memory/: acrescenta decisões novas em decisions.md (com data e motivo), atualiza active.md com o estado atual e regista factos duradouros em user.md, preferences.md ou people.md quando houver. Não guardes segredos nem credenciais. Se não houve nada novo a registar, diz apenas que a memória está atualizada e termina."}
EOF

exit 0
