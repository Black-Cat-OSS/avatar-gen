# GitHub Actions Workflows - ВРЕМЕННО ОТКЛЮЧЕНЫ

## Статус

**Все GitHub Actions workflows временно отключены.**

Директория `workflows` переименована в `workflows-disabled` для полного
отключения автоматического запуска тестов.

## Что отключено

- ✅ `develop.yml` - CI для develop ветки
- ✅ `deploy-prod.yml` - Production deploy pipeline
- ✅ `matrix-tests.yml` - Матричное тестирование
- ✅ `test-unit.yml` - Unit тесты
- ✅ `test-integration.yml` - Integration тесты
- ✅ `test-e2e.yml` - E2E тесты
- ✅ `test-specialized.yml` - Специализированные тесты
- ✅ `test-all.yml` - Комплексное тестирование

## Как включить обратно

### Способ 1: Переименовать директорию (рекомендуется)

```bash
# Включить все workflows
mv .github/workflows-disabled .github/workflows

# Отключить workflows
mv .github/workflows .github/workflows-disabled
```

### Способ 2: Включить только нужные workflows

```bash
# Создать новую директорию workflows
mkdir .github/workflows

# Скопировать только нужные файлы
cp .github/workflows-disabled/develop.yml .github/workflows/
cp .github/workflows-disabled/deploy-prod.yml .github/workflows/
```

### Способ 3: Включить через GitHub UI

1. Перейти в Settings → Actions → General
2. Отключить "Allow all actions and reusable workflows"
3. Или настроить ограничения по веткам

## Что происходит сейчас

- ❌ **Автоматические тесты НЕ запускаются**
- ❌ **CI/CD pipeline НЕ работает**
- ❌ **Автоматический деплой НЕ работает**
- ✅ **Ручной деплой возможен**
- ✅ **Локальное тестирование работает**

## Локальное тестирование

Тесты можно запускать локально:

```bash
# Unit тесты
bash scripts/test-unit.sh

# Integration тесты
bash scripts/test-integration.sh

# E2E тесты
bash scripts/test-e2e.sh

# Все тесты
bash scripts/test-all.sh
```

## Важные замечания

1. **Без CI/CD** - код не проверяется автоматически при PR
2. **Без автодеплоя** - нужно деплоить вручную
3. **Качество кода** - рекомендуется запускать тесты локально перед коммитом
4. **Безопасность** - нет автоматической проверки безопасности

## Когда включать обратно

Рекомендуется включить workflows когда:

- ✅ Проект стабилизировался
- ✅ Тесты работают стабильно
- ✅ Нужна автоматизация CI/CD
- ✅ Команда готова к автоматическому деплою

## Восстановление

При включении workflows убедитесь что:

1. Все конфигурационные файлы на месте
2. Docker образы собираются корректно
3. Тестовые окружения настроены
4. Секреты GitHub Actions настроены

---

**Дата отключения:** $(date)  
**Причина:** Временное отключение для настройки проекта  
**Ответственный:** Разработчик
