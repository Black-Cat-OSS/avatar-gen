#!/bin/bash

# Скрипт для настройки защиты веток в GitHub
# Требует GitHub CLI (gh) и права администратора репозитория
# Работает в GitBash, Linux и macOS

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛡️  Настройка защиты веток GitHub${NC}"
echo "=================================="
echo -e "${BLUE}💡 Совместимость: GitBash, Linux, macOS${NC}"
echo ""

# Проверка GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI не найден. Установите: https://cli.github.com/${NC}"
    exit 1
fi

# Проверка авторизации
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Не авторизован в GitHub CLI. Выполните: gh auth login${NC}"
    exit 1
fi

# Получение информации о репозитории
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "${GREEN}📦 Репозиторий: ${REPO}${NC}"

# Функция для настройки защиты ветки
setup_branch_protection() {
    local branch=$1
    local checks=$2
    local description=$3
    
    echo -e "${YELLOW}🔧 Настройка защиты для ветки: ${branch}${NC}"
    
    # Создание правил защиты
    gh api repos/:owner/:repo/branches/${branch}/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":['${checks}']}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        --field required_conversation_resolution=true
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Защита для ветки ${branch} настроена${NC}"
        echo "   ${description}"
    else
        echo -e "${RED}❌ Ошибка настройки защиты для ветки ${branch}${NC}"
        return 1
    fi
}

# Статус-чеки для develop (быстрые тесты)
DEVELOP_CHECKS='"lint-backend","lint-frontend","test-backend (SQLite + Local)","test-backend (SQLite + S3)","build-frontend","docker-build-test"'

# Статус-чеки для main (полные тесты)
MAIN_CHECKS='"lint-backend","lint-frontend","test-backend (SQLite + Local)","test-backend (SQLite + S3)","test-backend (PostgreSQL + Local)","test-backend (PostgreSQL + S3)","build-frontend","docker-build-test"'

echo ""
echo -e "${BLUE}📋 Настройка защиты веток...${NC}"

# Настройка develop ветки
setup_branch_protection "develop" "${DEVELOP_CHECKS}" "Быстрые тесты (SQLite + Local/S3)"

echo ""

# Настройка main ветки  
setup_branch_protection "main" "${MAIN_CHECKS}" "Полные тесты (SQLite + PostgreSQL × Local/S3)"

echo ""
echo -e "${GREEN}🎉 Настройка защиты веток завершена!${NC}"
echo ""
echo -e "${BLUE}📖 Что дальше:${NC}"
echo "1. Проверьте настройки в GitHub: Settings → Branches"
echo "2. Создайте тестовый PR для проверки"
echo "3. Убедитесь, что merge заблокирован до прохождения тестов"
echo ""
echo -e "${YELLOW}⚠️  Важно:${NC}"
echo "- Все PR теперь требуют approval от code owners"
echo "- Merge заблокирован до прохождения всех тестов"
echo "- Force push и удаление веток запрещены"
echo "- Создайте файл .github/CODEOWNERS для назначения reviewers"
echo ""
echo -e "${BLUE}📚 Документация:${NC}"
echo "- [Branch Protection Setup](docs/deployment/BRANCH_PROTECTION_SETUP.md)"
echo "- [GitFlow Strategy](docs/deployment/GITFLOW_STRATEGY.md)"
