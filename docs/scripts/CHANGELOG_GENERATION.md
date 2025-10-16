# Автоматическая генерация CHANGELOG

Этот документ описывает настройку и использование автоматической генерации
CHANGELOG для проекта avatar-gen.

## Обзор

Проект использует `conventional-changelog-cli` для автоматической генерации
CHANGELOG на основе conventional commits. Система интегрирована с существующей
настройкой commitizen и commitlint.

## Установленные зависимости

- `conventional-changelog-cli` - CLI инструмент для генерации changelog
- `cz-conventional-changelog` - адаптер для commitizen (уже был установлен)

## Доступные npm скрипты

### Основные команды

```bash
# Обновить секцию [Unreleased] в CHANGELOG.md
pnpm run changelog:unreleased

# Сгенерировать полный changelog (заменяет весь файл)
pnpm run changelog:all

# Сгенерировать changelog для конкретной версии
pnpm run changelog:version

# Сгенерировать changelog с нуля (releaseCount: 0)
pnpm run changelog
```

### Команды для релизов

```bash
# Создать patch релиз (0.0.2 → 0.0.3)
pnpm run release:patch

# Создать minor релиз (0.0.2 → 0.1.0)
pnpm run release:minor

# Создать major релиз (0.0.2 → 1.0.0)
pnpm run release:major

# Создать patch релиз (по умолчанию)
pnpm run release
```

### Рекомендуемый workflow

1. **Для ежедневной работы**: используйте `pnpm run changelog:unreleased`
2. **Для создания релиза**: используйте `pnpm run release:patch/minor/major`
3. **Для полной перестройки**: используйте `pnpm run changelog:all`

## Конфигурация

### Файл .changelogrc.js

Содержит настройки для conventional-changelog:

- Преобразование типов коммитов в читаемые названия
- Группировка по типам
- Сортировка коммитов

### Скрипт scripts/update-unreleased.js

Кастомный скрипт для обновления секции [Unreleased]:

- Генерирует changelog для нерелизных коммитов
- Интегрируется с существующим CHANGELOG.md
- Сохраняет ручные изменения в других секциях

### Скрипт scripts/release-simple.js

Автоматизированный скрипт для создания релизов:

- Использует встроенную команду `pnpm version` для обновления версии
- Создает git тег для новой версии
- Генерирует changelog для новой версии
- Создает git коммит с обновленными файлами
- Поддерживает patch, minor, major типы версий

## Типы коммитов

Система поддерживает следующие типы conventional commits:

| Тип коммита | Отображение в changelog |
| ----------- | ----------------------- |
| `feat`      | Added                   |
| `fix`       | Fixed                   |
| `perf`      | Performance             |
| `refactor`  | Changed                 |
| `docs`      | Documentation           |
| `style`     | Style                   |
| `test`      | Testing                 |
| `build`     | Build                   |
| `ci`        | CI                      |
| `chore`     | Chore                   |
| `revert`    | Reverted                |

## Примеры использования

### Создание релиза

```bash
# Создать patch релиз (исправления)
pnpm run release:patch
# Результат: 0.0.2 → 0.0.3

# Создать minor релиз (новая функциональность)
pnpm run release:minor
# Результат: 0.0.2 → 0.1.0

# Создать major релиз (breaking changes)
pnpm run release:major
# Результат: 0.0.2 → 1.0.0
```

### Что происходит при создании релиза

1. **Обновление версии**: Версия обновляется в корневом package.json
2. **Генерация changelog**: Создается секция для новой версии
3. **Git коммит**: Создается коммит с обновленными файлами
4. **Git тег**: Создается тег для новой версии

### После создания релиза

```bash
# Отправить изменения и теги в репозиторий
git push origin main --tags

# Опубликовать пакет (если нужно)
npm publish
```

## Интеграция с Git workflow

### Conventional Commits

Все коммиты должны следовать формату conventional commits:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Примеры коммитов

```bash
# Новая функциональность
git commit -m "feat: добавить поддержку CORS"

# Исправление ошибки
git commit -m "fix: исправить проблему с валидацией"

# Изменения в документации
git commit -m "docs: обновить README"

# Изменения в сборке
git commit -m "build: обновить зависимости"
```

### Commitizen

Для интерактивного создания коммитов используйте:

```bash
pnpm run commit
```

## Структура CHANGELOG.md

Файл следует стандарту [Keep a Changelog](https://keepachangelog.com/en/1.0.0/):

```markdown
# Changelog

## [Unreleased]

<!-- Автоматически генерируемые изменения -->

## [1.0.0] - 2025-01-15

### Added

- Новая функциональность

### Changed

- Изменения в существующей функциональности

### Fixed

- Исправления ошибок

### Removed

- Удаленная функциональность
```

## Автоматизация

### Husky hooks

Проект настроен с husky hooks, которые:

- Проверяют формат коммитов через commitlint
- Автоматически форматируют код через lint-staged
- Предупреждают о необходимости обновления CHANGELOG

### GitHub Actions (рекомендация)

Для автоматизации релизов рекомендуется настроить GitHub Actions workflow:

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate CHANGELOG
        run: pnpm run changelog:version
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add CHANGELOG.md
          git commit -m "docs(changelog): Обновлён CHANGELOG.md" || exit 0
          git push
```

## Troubleshooting

### Проблема: CHANGELOG не обновляется

**Решение**: Убедитесь, что:

1. Коммиты следуют conventional commits формату
2. Есть теги для релизов
3. Скрипт имеет права на выполнение

### Проблема: Дублирование секций версий

**Причина**: Это происходит когда conventional-changelog генерирует секции с
одинаковыми версиями, но разными датами или коммитами.

**Решение**:

1. **Временное решение**: Вручную удалите дублирующиеся секции из CHANGELOG.md
2. **Постоянное решение**: Создайте тег для текущего состояния:
   ```bash
   git tag v0.0.5
   ```
   Затем добавьте новые коммиты после тега - они попадут в секцию [Unreleased]

### Проблема: Версия в заголовке не соответствует последнему тегу

**Причина**: conventional-changelog использует последний тег для определения
версии.

**Решение**:

1. Проверьте теги: `git tag -l`
2. Создайте недостающий тег: `git tag v0.0.X`
3. Или обновите версию в package.json

### Проблема: Неправильная группировка коммитов

**Решение**: Проверьте конфигурацию в `.changelogrc.js` и типы коммитов

## Дополнительные ресурсы

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)
