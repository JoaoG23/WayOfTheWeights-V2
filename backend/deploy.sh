#!/bin/sh
# Deploy do backend: imagem (build ou pull), migrations e subida da API.
# Funciona com "docker compose" (v2) e com "docker-compose" (v1).
#
#   ./deploy.sh           # build local da imagem e sobe
#   ./deploy.sh --pull    # baixa a imagem do registro (CI já fez o push) e sobe
set -eu
cd "$(dirname "$0")"

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
else
  COMPOSE="docker-compose"
fi

# Nome fixo do projeto (o v1 usaria o nome da pasta).
export COMPOSE_PROJECT_NAME=wayoftheweights

if [ "${1:-}" = "--pull" ]; then
  $COMPOSE pull
else
  $COMPOSE build
fi

# Migrations primeiro: se falharem, o script para e a API antiga segue no ar.
$COMPOSE run --rm migrar

$COMPOSE up -d --no-build backend
$COMPOSE ps
