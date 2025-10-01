-- Инициализация базы данных для Avatar Generator
-- Этот скрипт выполняется при первом запуске PostgreSQL контейнера

-- Создание расширений если необходимо
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание схемы если необходимо
-- CREATE SCHEMA IF NOT EXISTS avatar_gen;

-- Установка прав доступа
GRANT ALL PRIVILEGES ON DATABASE avatar_gen TO postgres;

-- Комментарий для документации
COMMENT ON DATABASE avatar_gen IS 'Avatar Generator Database - хранит информацию о сгенерированных аватарах';
