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

# Nome fixo do projeto (o v1 usaria o nome da pasta) e BuildKit só nesta
# execução: o Dockerfile usa cache de npm, que exige BuildKit. Não altera os
# outros deploys do servidor.
export COMPOSE_PROJECT_NAME=wayoftheweights
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

if [ "${1:-}" = "--pull" ]; then
  $COMPOSE pull
else
  $COMPOSE build
fi

# Migrations primeiro: se falharem, o script para e a API antiga segue no ar.
$COMPOSE run --rm migrar

$COMPOSE up -d --no-build backend
$COMPOSE ps
