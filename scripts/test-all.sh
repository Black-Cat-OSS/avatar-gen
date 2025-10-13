#!/bin/bash

# Comprehensive Test Runner Script
# Запускает все типы тестов с монтированием конфигураций

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Комплексное тестирование Avatar Generator${NC}"
echo "=================================================="

# Функция для запуска тестов с обработкой ошибок
run_test() {
    local test_name=$1
    local script_path=$2
    
    echo -e "\n${YELLOW}▶️  Запуск: ${test_name}${NC}"
    echo "----------------------------------------"
    
    if bash "$script_path"; then
        echo -e "${GREEN}✅ ${test_name} - ПРОЙДЕНЫ${NC}"
        return 0
    else
        echo -e "${RED}❌ ${test_name} - ПРОВАЛЕНЫ${NC}"
        return 1
    fi
}

# Счетчики
passed=0
failed=0

# Создание директории для логов
mkdir -p logs/test-results

# Запуск всех типов тестов
echo -e "\n${BLUE}📋 План тестирования:${NC}"
echo "1. Unit тесты (SQLite, локальное хранилище)"
echo "2. Integration тесты (PostgreSQL + MinIO)"
echo "3. PostgreSQL-специфичные тесты"
echo "4. S3-специфичные тесты"
echo "5. E2E тесты (полный стек)"

# Unit тесты
if run_test "Unit тесты" "scripts/test-unit.sh"; then
    ((passed++))
else
    ((failed++))
fi

# Integration тесты
if run_test "Integration тесты" "scripts/test-integration.sh"; then
    ((passed++))
else
    ((failed++))
fi

# PostgreSQL тесты
if run_test "PostgreSQL тесты" "scripts/test-postgres.sh"; then
    ((passed++))
else
    ((failed++))
fi

# S3 тесты
if run_test "S3 тесты" "scripts/test-s3.sh"; then
    ((passed++))
else
    ((failed++))
fi

# E2E тесты
if run_test "E2E тесты" "scripts/test-e2e.sh"; then
    ((passed++))
else
    ((failed++))
fi

# Итоговый отчет
echo -e "\n${BLUE}📊 ИТОГОВЫЙ ОТЧЕТ${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Пройдено: ${passed}${NC}"
echo -e "${RED}❌ Провалено: ${failed}${NC}"
echo -e "📈 Всего тестов: $((passed + failed))"

if [ $failed -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!${NC}"
    exit 0
else
    echo -e "\n${RED}💥 НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛЕНЫ!${NC}"
    echo -e "${YELLOW}📋 Проверьте логи выше для деталей${NC}"
    exit 1
fi
