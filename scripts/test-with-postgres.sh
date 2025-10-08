#!/bin/bash

# Запуск тестов с временным PostgreSQL контейнером

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

# Функция для очистки
cleanup() {
    log "Очистка тестовых контейнеров..."
    docker-compose -f docker/docker-compose.test.yaml down --volumes --remove-orphans 2>/dev/null || true
}

# Функция для запуска тестов с PostgreSQL
run_tests_with_postgres() {
    local test_type=$1
    
    log "Запуск $test_type тестов с временным PostgreSQL..."
    
    # Запускаем временный PostgreSQL
    log "Запуск временного PostgreSQL контейнера..."
    docker-compose -f docker/docker-compose.test.yaml --profile postgres-only up -d postgres-test
    
    # Ждем готовности PostgreSQL
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker exec avatar-gen-postgres-test pg_isready -U test_user -d avatar_gen_test >/dev/null 2>&1; then
            success "PostgreSQL готов к работе!"
            break
        fi
        
        ((attempt++))
        log "Попытка $attempt/$max_attempts - ожидание готовности PostgreSQL..."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        error "PostgreSQL не готов после $max_attempts попыток"
        cleanup
        return 1
    fi
    
    # Устанавливаем переменные окружения для подключения к PostgreSQL
    export TEST_DB_DRIVER=postgresql
    export TEST_DB_HOST=localhost
    export TEST_DB_PORT=5433
    export TEST_DB_NAME=avatar_gen_test
    export TEST_DB_USER=test_user
    export TEST_DB_PASSWORD=test_password
    
    # Запускаем тесты
    case $test_type in
        "integration")
            log "Запуск Integration тестов..."
            docker-compose -f docker/docker-compose.test.yaml --profile integration-tests up --build --abort-on-container-exit avatar-backend-integration
            ;;
        "e2e")
            log "Запуск E2E тестов..."
            docker-compose -f docker/docker-compose.test.yaml --profile e2e-tests up --build --abort-on-container-exit gateway-e2e
            ;;
        *)
            error "Неизвестный тип тестов: $test_type"
            cleanup
            return 1
            ;;
    esac
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        success "$test_type тесты прошли успешно!"
    else
        error "$test_type тесты завершились с ошибкой"
    fi
    
    # Очистка
    cleanup
    
    return $exit_code
}

# Функция для запуска тестов с MinIO
run_tests_with_minio() {
    local test_type=$1
    
    log "Запуск $test_type тестов с MinIO..."
    
    # Устанавливаем переменные окружения для MinIO
    export TEST_STORAGE_TYPE=s3
    export TEST_S3_ENDPOINT=http://localhost:9000
    export TEST_S3_ACCESS_KEY=test-access-key
    export TEST_S3_SECRET_KEY=test-secret-key
    export TEST_S3_BUCKET=avatar-gen-test
    export TEST_S3_REGION=us-east-1
    
    # Запускаем тесты
    case $test_type in
        "integration")
            log "Запуск Integration тестов с MinIO..."
            docker-compose -f docker/docker-compose.test.yaml --profile integration-tests up --build --abort-on-container-exit avatar-backend-integration
            ;;
        "e2e")
            log "Запуск E2E тестов с MinIO..."
            docker-compose -f docker/docker-compose.test.yaml --profile e2e-tests up --build --abort-on-container-exit gateway-e2e
            ;;
        *)
            error "Неизвестный тип тестов: $test_type"
            return 1
            ;;
    esac
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        success "$test_type тесты с MinIO прошли успешно!"
    else
        error "$test_type тесты с MinIO завершились с ошибкой"
    fi
    
    # Очистка
    cleanup
    
    return $exit_code
}

# Функция для показа справки
show_help() {
    echo "Использование: $0 [КОМАНДА] [ОПЦИИ]"
    echo ""
    echo "Команды:"
    echo "  integration-postgres     Запуск integration тестов с PostgreSQL"
    echo "  e2e-postgres            Запуск E2E тестов с PostgreSQL"
    echo "  integration-minio       Запуск integration тестов с MinIO"
    echo "  e2e-minio               Запуск E2E тестов с MinIO"
    echo "  integration-full        Запуск integration тестов с PostgreSQL + MinIO"
    echo "  e2e-full                Запуск E2E тестов с PostgreSQL + MinIO"
    echo "  cleanup                 Очистка всех тестовых контейнеров"
    echo "  help                    Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 integration-postgres"
    echo "  $0 e2e-postgres"
    echo "  $0 integration-minio"
    echo "  $0 e2e-minio"
    echo "  $0 integration-full"
    echo "  $0 e2e-full"
    echo "  $0 cleanup"
}

# Основная логика
main() {
    case "${1:-help}" in
        "integration-postgres")
            run_tests_with_postgres "integration"
            ;;
        "e2e-postgres")
            run_tests_with_postgres "e2e"
            ;;
        "integration-minio")
            run_tests_with_minio "integration"
            ;;
        "e2e-minio")
            run_tests_with_minio "e2e"
            ;;
        "integration-full")
            log "Запуск integration тестов с PostgreSQL + MinIO..."
            docker-compose -f docker/docker-compose.test.yaml --profile integration-tests up --build --abort-on-container-exit avatar-backend-integration
            local exit_code=$?
            cleanup
            return $exit_code
            ;;
        "e2e-full")
            log "Запуск E2E тестов с PostgreSQL + MinIO..."
            docker-compose -f docker/docker-compose.test.yaml --profile e2e-tests up --build --abort-on-container-exit gateway-e2e
            local exit_code=$?
            cleanup
            return $exit_code
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
