#!/bin/bash

# Матричное тестирование для Avatar Gen
# Поддерживает различные комбинации storage и database

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Функция для очистки тестовых контейнеров
cleanup() {
    log "Очистка тестовых контейнеров..."
    docker-compose -f docker/docker-compose.test.yaml down --volumes --remove-orphans || true
}

# Функция для запуска unit тестов
run_unit_tests() {
    log "Запуск Unit тестов (SQLite + Local Storage)..."
    docker-compose -f docker/docker-compose.test.yaml --profile unit-tests up --build --abort-on-container-exit avatar-backend-unit
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        success "Unit тесты прошли успешно"
    else
        error "Unit тесты завершились с ошибкой"
    fi
    return $exit_code
}

# Функция для запуска integration тестов
run_integration_tests() {
    log "Запуск Integration тестов (PostgreSQL + MinIO)..."
    docker-compose -f docker/docker-compose.test.yaml --profile integration-tests up --build --abort-on-container-exit avatar-backend-integration
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        success "Integration тесты прошли успешно"
    else
        error "Integration тесты завершились с ошибкой"
    fi
    return $exit_code
}

# Функция для запуска E2E тестов
run_e2e_tests() {
    log "Запуск E2E тестов (PostgreSQL + MinIO + Frontend + Gateway)..."
    docker-compose -f docker/docker-compose.test.yaml --profile e2e-tests up --build --abort-on-container-exit gateway-e2e
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        success "E2E тесты прошли успешно"
    else
        error "E2E тесты завершились с ошибкой"
    fi
    return $exit_code
}

# Функция для запуска всех тестов
run_all_tests() {
    log "Запуск всех тестов..."
    local total_failed=0
    
    # Unit тесты
    run_unit_tests || ((total_failed++))
    cleanup
    
    # Integration тесты
    run_integration_tests || ((total_failed++))
    cleanup
    
    # E2E тесты
    run_e2e_tests || ((total_failed++))
    cleanup
    
    if [ $total_failed -eq 0 ]; then
        success "Все тесты прошли успешно!"
        return 0
    else
        error "Несколько тестов завершились с ошибкой ($total_failed из 3)"
        return 1
    fi
}

# Функция для запуска тестов с конкретной конфигурацией
run_matrix_test() {
    local storage_type=$1
    local db_type=$2
    
    log "Запуск тестов с конфигурацией: Storage=$storage_type, Database=$db_type"
    
    # Устанавливаем переменные окружения
    export TEST_STORAGE_TYPE=$storage_type
    export TEST_DB_DRIVER=$db_type
    
    if [ "$storage_type" = "s3" ]; then
        export TEST_S3_ENDPOINT=http://localhost:9000
        export TEST_S3_ACCESS_KEY=test-access-key
        export TEST_S3_SECRET_KEY=test-secret-key
        export TEST_S3_BUCKET=avatar-gen-test
    fi
    
    if [ "$db_type" = "postgresql" ]; then
        export TEST_DB_HOST=localhost
        export TEST_DB_PORT=5433
        export TEST_DB_NAME=avatar_gen_test
        export TEST_DB_USER=test_user
        export TEST_DB_PASSWORD=test_password
    fi
    
    # Запускаем тесты
    docker-compose -f docker/docker-compose.test.yaml --profile matrix-tests up --build --abort-on-container-exit test-runner
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        success "Матричный тест ($storage_type + $db_type) прошел успешно"
    else
        error "Матричный тест ($storage_type + $db_type) завершился с ошибкой"
    fi
    
    cleanup
    return $exit_code
}

# Функция для показа справки
show_help() {
    echo "Использование: $0 [КОМАНДА] [ОПЦИИ]"
    echo ""
    echo "Команды:"
    echo "  unit                    Запуск unit тестов (SQLite + Local)"
    echo "  integration             Запуск integration тестов (PostgreSQL + MinIO)"
    echo "  e2e                     Запуск E2E тестов (полный стек)"
    echo "  all                     Запуск всех тестов последовательно"
    echo "  matrix                  Запуск матричного тестирования"
    echo "  cleanup                 Очистка тестовых контейнеров"
    echo "  help                    Показать эту справку"
    echo ""
    echo "Опции для matrix:"
    echo "  --storage TYPE          Тип хранилища (local, s3)"
    echo "  --database TYPE         Тип базы данных (sqlite, postgresql)"
    echo ""
    echo "Примеры:"
    echo "  $0 unit"
    echo "  $0 integration"
    echo "  $0 e2e"
    echo "  $0 all"
    echo "  $0 matrix --storage s3 --database postgresql"
    echo "  $0 cleanup"
}

# Основная логика
main() {
    # Обработка аргументов
    case "${1:-help}" in
        "unit")
            cleanup
            run_unit_tests
            cleanup
            ;;
        "integration")
            cleanup
            run_integration_tests
            cleanup
            ;;
        "e2e")
            cleanup
            run_e2e_tests
            cleanup
            ;;
        "all")
            run_all_tests
            ;;
        "matrix")
            local storage_type="local"
            local db_type="sqlite"
            
            # Парсинг аргументов
            shift
            while [[ $# -gt 0 ]]; do
                case $1 in
                    --storage)
                        storage_type="$2"
                        shift 2
                        ;;
                    --database)
                        db_type="$2"
                        shift 2
                        ;;
                    *)
                        error "Неизвестный аргумент: $1"
                        show_help
                        exit 1
                        ;;
                esac
            done
            
            cleanup
            run_matrix_test "$storage_type" "$db_type"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Неизвестная команда: $1"
            show_help
            exit 1
            ;;
    esac
}

# Обработка сигналов для корректной очистки
trap cleanup EXIT INT TERM

# Запуск основной функции
main "$@"
