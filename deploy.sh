#!/usr/bin/env bash
# Publica finapp en el droplet: tests -> build -> rsync de dist/ -> proxy BCV -> verificación.
# Uso:  ./deploy.sh            despliegue real
#       DRY_RUN=1 ./deploy.sh  muestra qué cambiaría sin tocar el servidor
#       DEPLOY_HOST=user@host ./deploy.sh  para otro servidor
set -euo pipefail

HOST="${DEPLOY_HOST:-root@107.170.73.142}"
URL="${DEPLOY_URL:-https://finapp.nomatao.com}"
WEB_DIR="/var/www/finapp"
PROXY_DIR="/opt/finapp-bcv"
DRY="${DRY_RUN:-}"

cd "$(dirname "$0")"

echo "==> Tests"
npm test --silent

echo "==> Build"
npm run build --silent

RSYNC_OPTS=(-rlz --checksum --delete --itemize-changes)
[[ -n "$DRY" ]] && RSYNC_OPTS+=(--dry-run)

echo "==> Sincronizando dist/ -> $HOST:$WEB_DIR"
rsync "${RSYNC_OPTS[@]}" dist/ "$HOST:$WEB_DIR/"

echo "==> Proxy BCV"
if [[ -n "$DRY" ]]; then
  rsync "${RSYNC_OPTS[@]}" deploy/bcv_proxy.py "$HOST:$PROXY_DIR/bcv_proxy.py"
  echo "(dry-run: no se aplicó nada en el servidor)"
  exit 0
fi

CAMBIO=$(rsync -rlz --checksum --itemize-changes deploy/bcv_proxy.py "$HOST:$PROXY_DIR/bcv_proxy.py" | wc -l)
ssh "$HOST" "chown -R www-data:www-data $WEB_DIR && chmod a+r $PROXY_DIR/bcv_proxy.py"
if [[ "$CAMBIO" -gt 0 ]]; then
  echo "    bcv_proxy.py cambió, reiniciando servicio"
  ssh "$HOST" "systemctl restart finapp-bcv"
fi

echo "==> Verificando $URL"
curl -fsS -o /dev/null "$URL/" && echo "    web OK"
curl -fsS "$URL/api/bcv" | grep -q '"eur"' && echo "    /api/bcv OK"
echo "Listo."
