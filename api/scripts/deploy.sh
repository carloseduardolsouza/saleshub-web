#!/usr/bin/env bash
# Uso: ./scripts/deploy.sh [--skip-push] [--push-latest] [--user X] [--image Y]
set -euo pipefail

DOCKER_USER="carlossouzadev"
IMAGE_NAME="saleshub"
DOCKERFILE="docker/Dockerfile"
CONTEXT="."
PUSH_LATEST=false
SKIP_PUSH=false

while [ $# -gt 0 ]; do
  case "$1" in
    --skip-push) SKIP_PUSH=true ;;
    --push-latest) PUSH_LATEST=true ;;
    --user) DOCKER_USER="$2"; shift ;;
    --image) IMAGE_NAME="$2"; shift ;;
    *) echo "Argumento desconhecido: $1" >&2; exit 1 ;;
  esac
  shift
done

cd "$(dirname "$0")/.."

command -v docker >/dev/null || { echo "Comando 'docker' nao encontrado no WSL." >&2; exit 1; }
[ -f package.json ] || { echo "Arquivo package.json nao encontrado." >&2; exit 1; }

TAG=$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' package.json | head -n1)
[ -n "$TAG" ] || { echo "Campo 'version' nao encontrado no package.json." >&2; exit 1; }

REPO="$DOCKER_USER/$IMAGE_NAME"
IMAGE="$REPO:$TAG"

echo "Repositorio Docker Hub: $REPO"
echo "Imagem final: $IMAGE"

echo; echo "1. Buildando imagem..."
docker build -f "$DOCKERFILE" -t "$IMAGE" "$CONTEXT"

if $PUSH_LATEST && [ "$TAG" != "latest" ]; then
  echo; echo "2. Marcando tambem como latest..."
  docker tag "$IMAGE" "$REPO:latest"
fi

if $SKIP_PUSH; then
  echo; echo "Push ignorado por --skip-push."
  echo "APP_IMAGE=$IMAGE"
  exit 0
fi

echo; echo "2. Enviando imagem para o Docker Hub..."
docker push "$IMAGE"

if $PUSH_LATEST && [ "$TAG" != "latest" ]; then
  echo; echo "3. Enviando tag latest..."
  docker push "$REPO:latest"
fi

echo; echo "Deploy concluido com sucesso."
echo "APP_IMAGE=$IMAGE"
