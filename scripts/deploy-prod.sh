#!/usr/bin/env bash
# Safe production deploy for BitByWorld VPS
# - Preserves all student, course, enrollment, and quiz data
# - Runs ONLY pending migrations (never migrate:fresh / db:seed)
#
# Usage (on VPS, from project root):
#   chmod +x scripts/deploy-prod.sh
#   ./scripts/deploy-prod.sh

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yaml"
APP_SERVICE="app"

# Load DB credentials from .env if present
if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

echo "=========================================="
echo " BitByWorld — Safe Production Deploy"
echo "=========================================="
echo ""
echo "This script will:"
echo "  ✓ Pull latest code"
echo "  ✓ Rebuild & restart containers"
echo "  ✓ Run pending migrations ONLY (data-safe)"
echo "  ✓ Clear & rebuild Laravel caches"
echo ""
echo "This script will NOT:"
echo "  ✗ Delete students, courses, or enrollments"
echo "  ✗ Run migrate:fresh, migrate:reset, or db:wipe"
echo "  ✗ Run db:seed (demo data seeder)"
echo ""

# Optional: backup database before deploy
read -r -p "Create a MySQL backup before deploy? [y/N] " BACKUP_CHOICE
if [[ "${BACKUP_CHOICE,,}" == "y" ]]; then
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "Creating backup: ${BACKUP_FILE}"
    docker compose -f "${COMPOSE_FILE}" exec -T mysql \
        mysqldump -u root -p"${DB_PASSWORD}" "${DB_DATABASE}" \
        > "${BACKUP_FILE}"
    echo "Backup saved to ${BACKUP_FILE}"
fi

echo ""
echo "→ Pulling latest code..."
git pull

echo ""
echo "→ Building application image (includes npm build)..."
docker compose -f "${COMPOSE_FILE}" build --no-cache app

echo ""
echo "→ Starting containers..."
docker compose -f "${COMPOSE_FILE}" up -d

echo ""
echo "→ Waiting for MySQL to be ready..."
sleep 5

echo ""
echo "→ Running pending migrations (safe — adds columns/tables only)..."
docker compose -f "${COMPOSE_FILE}" exec -T "${APP_SERVICE}" php artisan migrate --force

echo ""
echo "→ Clearing and rebuilding caches..."
docker compose -f "${COMPOSE_FILE}" exec -T "${APP_SERVICE}" php artisan config:cache
docker compose -f "${COMPOSE_FILE}" exec -T "${APP_SERVICE}" php artisan route:cache
docker compose -f "${COMPOSE_FILE}" exec -T "${APP_SERVICE}" php artisan view:cache

echo ""
echo "=========================================="
echo " Deploy complete!"
echo "=========================================="
echo ""
echo "After deploy:"
echo "  • Open Admin → Manage Courses → Quizzes"
echo "  • Click the lock icon to OPEN quizzes for students"
echo "  • Existing quizzes default to CLOSED until you open them"
echo ""
