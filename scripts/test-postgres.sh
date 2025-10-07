#!/bin/bash

# Управление временным PostgreSQL контейнером для тестов

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

# Функция для запуска временного PostgreSQL
start_postgres() {
    log "Запуск временного PostgreSQL контейнера для тестов..."
    
    # Останавливаем и удаляем существующий контейнер если есть
    docker-compose -f docker/docker-compose.test-postgres.yaml down --volumes --remove-orphans 2>/dev/null || true
    
    # Запускаем новый контейнер
    docker-compose -f docker/docker-compose.test-postgres.yaml up -d postgres-temp
    
    # Ждем пока контейнер будет готов
    log "Ожидание готовности PostgreSQL..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f docker/docker-compose.test-postgres.yaml exec postgres-temp pg_isready -U test_user -d avatar_gen_test >/dev/null 2>&1; then
            success "PostgreSQL готов к работе!"
            return 0
        fi
        
        ((attempt++))
        log "Попытка $attempt/$max_attempts - ожидание готовности PostgreSQL..."
        sleep 2
    done
    
    error "PostgreSQL не готов после $max_attempts попыток"
    return 1
}

# Функция для остановки временного PostgreSQL
stop_postgres() {
    log "Остановка временного PostgreSQL контейнера..."
    docker-compose -f docker/docker-compose.test-postgres.yaml down --volumes --remove-orphans
    success "PostgreSQL контейнер остановлен и удален"
}

# Функция для проверки статуса PostgreSQL
status_postgres() {
    if docker-compose -f docker/docker-compose.test-postgres.yaml ps postgres-temp | grep -q "Up"; then
        success "PostgreSQL контейнер запущен"
        
        # Проверяем подключение
        if docker-compose -f docker/docker-compose.test-postgres.yaml exec postgres-temp pg_isready -U test_user -d avatar_gen_test >/dev/null 2>&1; then
            success "PostgreSQL готов к подключениям"
        else
            warning "PostgreSQL запущен, но не готов к подключениям"
        fi
        
        # Показываем информацию о подключении
        echo ""
        echo "Информация для подключения:"
        echo "  Host: localhost"
        echo "  Port: 5433"
        echo "  Database: avatar_gen_test"
        echo "  Username: test_user"
        echo "  Password: test_password"
        echo ""
        echo "URL подключения: postgresql://test_user:test_password@localhost:5433/avatar_gen_test"
        
    else
        warning "PostgreSQL контейнер не запущен"
    fi
}

# Функция для выполнения SQL команд
exec_sql() {
    local sql_command="$1"
    
    if [ -z "$sql_command" ]; then
        error "Не указана SQL команда"
        return 1
    fi
    
    log "Выполнение SQL команды: $sql_command"
    docker-compose -f docker/docker-compose.test-postgres.yaml exec postgres-temp psql -U test_user -d avatar_gen_test -c "$sql_command"
}

# Функция для подключения к PostgreSQL
connect_postgres() {
    log "Подключение к PostgreSQL..."
    docker-compose -f docker/docker-compose.test-postgres.yaml exec postgres-temp psql -U test_user -d avatar_gen_test
}

# Функция для сброса базы данных
reset_database() {
    log "Сброс тестовой базы данных..."
    
    # Удаляем все таблицы
    exec_sql "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    success "База данных сброшена"
}

# Функция для показа справки
show_help() {
    echo "Использование: $0 [КОМАНДА] [ОПЦИИ]"
    echo ""
    echo "Команды:"
    echo "  start                   Запуск временного PostgreSQL контейнера"
    echo "  stop                    Остановка и удаление контейнера"
    echo "  restart                 Перезапуск контейнера"
    echo "  status                  Показать статус контейнера"
    echo "  connect                 Подключиться к PostgreSQL"
    echo "  exec \"SQL_COMMAND\"      Выполнить SQL команду"
    echo "  reset                   Сбросить базу данных"
    echo "  logs                    Показать логи контейнера"
    echo "  help                    Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 exec \"SELECT version();\""
    echo "  $0 connect"
    echo "  $0 reset"
    echo "  $0 stop"
}

# Функция для показа логов
show_logs() {
    docker-compose -f docker/docker-compose.test-postgres.yaml logs postgres-temp
}

# Основная логика
main() {
    case "${1:-help}" in
        "start")
            start_postgres
            ;;
        "stop")
            stop_postgres
            ;;
        "restart")
            stop_postgres
            start_postgres
            ;;
        "status")
            status_postgres
            ;;
        "connect")
            connect_postgres
            ;;
        "exec")
            if [ -z "$2" ]; then
                error "Не указана SQL команда"
                show_help
                exit 1
            fi
            exec_sql "$2"
            ;;
        "reset")
            reset_database
            ;;
        "logs")
            show_logs
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

# Запуск основной функции
main "$@"
