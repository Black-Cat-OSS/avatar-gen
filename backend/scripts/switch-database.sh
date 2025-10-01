#!/bin/bash

# Скрипт для переключения между SQLite и PostgreSQL
# Использование: ./switch-database.sh [sqlite|postgresql]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
SETTINGS_FILE="$BACKEND_DIR/settings.yaml"
ENV_FILE="$BACKEND_DIR/.env"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo -e "${BLUE}Использование:${NC}"
    echo "  $0 [sqlite|postgresql]"
    echo ""
    echo -e "${BLUE}Примеры:${NC}"
    echo "  $0 sqlite      # Переключиться на SQLite"
    echo "  $0 postgresql  # Переключиться на PostgreSQL"
}

switch_to_sqlite() {
    echo -e "${YELLOW}Переключение на SQLite...${NC}"
    
    # Обновляем settings.yaml
    sed -i.bak 's/driver: "postgresql"/driver: "sqlite"/' "$SETTINGS_FILE"
    
    # Обновляем .env файл
    if [ -f "$ENV_FILE" ]; then
        sed -i.bak 's/DATABASE_PROVIDER="postgresql"/DATABASE_PROVIDER="sqlite"/' "$ENV_FILE"
        sed -i.bak 's|DATABASE_URL="postgresql://.*"|DATABASE_URL="file:./prisma/storage/database.sqlite"|' "$ENV_FILE"
    fi
    
    echo -e "${GREEN}✓ Переключено на SQLite${NC}"
    echo -e "${BLUE}Теперь можно запустить:${NC}"
    echo "  npm run prisma:generate"
    echo "  npm run prisma:migrate"
    echo "  npm run start:dev"
}

switch_to_postgresql() {
    echo -e "${YELLOW}Переключение на PostgreSQL...${NC}"
    
    # Обновляем settings.yaml
    sed -i.bak 's/driver: "sqlite"/driver: "postgresql"/' "$SETTINGS_FILE"
    
    # Обновляем .env файл
    if [ -f "$ENV_FILE" ]; then
        sed -i.bak 's/DATABASE_PROVIDER="sqlite"/DATABASE_PROVIDER="postgresql"/' "$ENV_FILE"
        sed -i.bak 's|DATABASE_URL="file:.*"|DATABASE_URL="postgresql://postgres:password@localhost:5432/avatar_gen"|' "$ENV_FILE"
    fi
    
    echo -e "${GREEN}✓ Переключено на PostgreSQL${NC}"
    echo -e "${BLUE}Убедитесь, что PostgreSQL запущен и доступен${NC}"
    echo -e "${BLUE}Теперь можно запустить:${NC}"
    echo "  npm run prisma:generate"
    echo "  npm run prisma:migrate"
    echo "  npm run start:dev"
}

# Проверяем аргументы
if [ $# -eq 0 ]; then
    print_usage
    exit 1
fi

case $1 in
    "sqlite")
        switch_to_sqlite
        ;;
    "postgresql")
        switch_to_postgresql
        ;;
    *)
        echo -e "${RED}Ошибка: Неизвестный тип базы данных '$1'${NC}"
        print_usage
        exit 1
        ;;
esac
