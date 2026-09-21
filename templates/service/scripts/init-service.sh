#!/usr/bin/env bash

set -euo pipefail

SERVICE_NAME="${1:-}"
TARGET="${2:-}"

if [ -z "$SERVICE_NAME" ] || [ -z "$TARGET" ]; then
  echo "uso: $0 <service-name> <target-dir>" >&2
  echo "exemplo: $0 bunzina-os ../../bunzina-os" >&2
  exit 1
fi

if [ -e "$TARGET" ]; then
  echo "erro: $TARGET já existe" >&2
  exit 1
fi

TEMPLATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
METRIC_PREFIX="$(echo "$SERVICE_NAME" | tr '-' '_')"

mkdir -p "$TARGET"
cp -r "$TEMPLATE_DIR/." "$TARGET/"
rm -rf "$TARGET/scripts"

mv "$TARGET/charts/service-chart" "$TARGET/charts/${SERVICE_NAME}-chart"

find "$TARGET" -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  -exec sed -i \
    -e "s/__SERVICE_NAME__/${SERVICE_NAME}/g" \
    -e "s/__METRIC_PREFIX__/${METRIC_PREFIX}/g" \
    {} +

echo "serviço $SERVICE_NAME gerado em $TARGET"
echo
echo "próximos passos:"
echo "  1. cd $TARGET && git init && bun install"
echo "  2. criar o repositório Bunzina/$SERVICE_NAME e configurar a proteção de branch"
echo "  3. configurar os secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,"
echo "     AWS_SESSION_TOKEN, AWS_ACCOUNT_ID, DB_USER, DB_PASSWORD, RABBITMQ_URL, SONAR_TOKEN"
echo "  4. criar o projeto no SonarCloud com a key Bunzina_$SERVICE_NAME"
