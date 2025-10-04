# 🛡️ Настройка защиты веток GitHub

**Дата создания:** 2025-10-04  
**Версия:** 1.0

## 🎯 Обзор

Данный документ описывает настройку защиты веток в GitHub для обеспечения
качества кода и предотвращения случайных merge в production ветку.

## 🔒 Настройка Branch Protection Rules

### 1. Переход к настройкам репозитория

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Branches**
3. Нажмите **Add rule** или **Add branch protection rule**

### 2. Настройка защиты для ветки `main`

#### Основные настройки

```yaml
Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale reviews when new commits are pushed
  ✅ Require review from code owners

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Status checks required:
    - lint-backend
    - lint-frontend
    - test-backend (SQLite + Local)
    - test-backend (SQLite + S3)
    - test-backend (PostgreSQL + Local)
    - test-backend (PostgreSQL + S3)
    - build-frontend
    - docker-build-test

✅ Require conversation resolution before merging

✅ Include administrators
  ⚠️ Включить эту опцию, чтобы правила применялись ко всем

❌ Allow force pushes: Never
❌ Allow deletions: Never
```

#### Дополнительные настройки

```yaml
✅ Restrict pushes that create files larger than 100 MB ✅ Require linear
history (optional, для чистого git history) ✅ Lock branch (optional, для
emergency freeze)
```

### 3. Настройка защиты для ветки `develop`

```yaml
Branch name pattern: develop

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale reviews when new commits are pushed

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Status checks required:
    - lint-backend
    - lint-frontend
    - test-backend (SQLite + Local)
    - test-backend (SQLite + S3)
    - build-frontend
    - docker-build-test

✅ Require conversation resolution before merging

✅ Include administrators

❌ Allow force pushes: Never
❌ Allow deletions: Never
```

## 🚀 Пошаговая инструкция

### Вариант 1: Автоматическая настройка через GitBash

```bash
# Откройте GitBash в корне проекта
# Убедитесь, что GitHub CLI установлен
gh --version

# Если не установлен, установите:
# Windows (GitBash): winget install GitHub.cli
# Linux: sudo apt install gh
# Mac: brew install gh

# Авторизуйтесь в GitHub CLI
gh auth login

# Запустите автоматическую настройку
./scripts/setup-branch-protection.sh
```

#### Требования для GitBash

- **GitBash** (входит в Git for Windows)
- **GitHub CLI** (`gh`) - установить через winget или скачать с GitHub
- **Права администратора** репозитория
- **Авторизация** в GitHub CLI

#### Установка GitHub CLI в GitBash

```bash
# Проверить версию
gh --version

# Если не установлен:
# Windows (GitBash):
winget install GitHub.cli

# Или скачать с https://cli.github.com/
# И добавить в PATH
```

### Вариант 2: Ручная настройка через GitHub UI

#### Шаг 1: Настройка main ветки

1. **Откройте Settings → Branches**
2. **Нажмите "Add rule"**
3. **Введите "main" в Branch name pattern**
4. **Включите все необходимые опции:**

   ```
   ☑️ Require a pull request before merging
      ☑️ Require approvals: 1
      ☑️ Dismiss stale reviews when new commits are pushed
      ☑️ Require review from code owners

   ☑️ Require status checks to pass before merging
      ☑️ Require branches to be up to date before merging

   ☑️ Require conversation resolution before merging
   ☑️ Include administrators
   ```

5. **В разделе "Status checks required" добавьте:**
   - `lint-backend`
   - `lint-frontend`
   - `test-backend (SQLite + Local)`
   - `test-backend (SQLite + S3)`
   - `test-backend (PostgreSQL + Local)`
   - `test-backend (PostgreSQL + S3)`
   - `build-frontend`
   - `docker-build-test`

6. **Нажмите "Create"**

#### Шаг 2: Настройка develop ветки

1. **Нажмите "Add rule" снова**
2. **Введите "develop" в Branch name pattern**
3. **Включите опции для develop (быстрые тесты):**

   ```
   ☑️ Require a pull request before merging
      ☑️ Require approvals: 1
      ☑️ Dismiss stale reviews when new commits are pushed

   ☑️ Require status checks to pass before merging
      ☑️ Require branches to be up to date before merging

   ☑️ Require conversation resolution before merging
   ☑️ Include administrators
   ```

4. **В разделе "Status checks required" добавьте:**
   - `lint-backend`
   - `lint-frontend`
   - `test-backend (SQLite + Local)`
   - `test-backend (SQLite + S3)`
   - `build-frontend`
   - `docker-build-test`

5. **Нажмите "Create"**

## 🔍 Проверка статус-чеков

### Как узнать имена статус-чеков

1. **Создайте тестовый PR** в develop или main
2. **Перейдите в Actions** → выберите ваш workflow
3. **Найдите имена jobs** в логах:

   ```
   lint-backend
   lint-frontend
   test-backend (SQLite + Local)
   test-backend (SQLite + S3)
   test-backend (PostgreSQL + Local)  # только для main
   test-backend (PostgreSQL + S3)     # только для main
   build-frontend
   docker-build-test
   ```

### Обновление списка статус-чеков

Если вы добавили новые jobs в workflow, обновите список в настройках защиты
веток.

## ⚠️ Важные моменты

### 1. Порядок настройки

- **Сначала** настройте protection rules
- **Затем** создайте PR для тестирования
- **Проверьте**, что все статус-чеки работают

### 2. Emergency bypass

В критических ситуациях администраторы могут:

- Временно отключить protection rules
- Использовать force push через GitHub CLI
- Создать hotfix ветку напрямую в main

### 3. Code Owners

Создайте файл `.github/CODEOWNERS`:

```gitignore
# Global code owners
* @your-team-lead @senior-dev

# Backend specific
/backend/ @backend-team

# Frontend specific
/frontend/ @frontend-team

# CI/CD specific
/.github/ @devops-team
```

## 🧪 Тестирование настроек

### 1. Создайте тестовый PR

```bash
# Создайте тестовую ветку
git checkout -b test/branch-protection
echo "# Test" >> README.md
git add README.md
git commit -m "test: test branch protection"
git push origin test/branch-protection

# Создайте PR в develop
# Проверьте, что merge заблокирован до прохождения тестов
```

### 2. Проверьте блокировку merge

- ✅ **Должно быть заблокировано:** Merge до прохождения тестов
- ✅ **Должно быть доступно:** Merge после успешных тестов
- ✅ **Должно работать:** Approve от code owners

### 3. Проверьте обход защиты

- ❌ **Не должно работать:** Force push
- ❌ **Не должно работать:** Direct push в main/develop
- ❌ **Не должно работать:** Merge без approval

## 🔧 Troubleshooting

### Проблема: Статус-чек не появляется в списке

**Решение:**

1. Убедитесь, что workflow запустился
2. Проверьте имена jobs в `.github/workflows/`
3. Дождитесь завершения всех jobs
4. Обновите список в Branch Protection Rules

### Проблема: Merge заблокирован навсегда

**Решение:**

1. Проверьте логи в Actions
2. Исправьте ошибки в коде
3. Push новые коммиты
4. Дождитесь повторного запуска тестов

### Проблема: Не могу сделать hotfix

**Решение:**

1. Создайте hotfix ветку от main
2. Используйте workflow_dispatch с skip_tests=true
3. После hotfix обязательно merge в develop

## 📋 Чеклист настройки

- [ ] Создать Branch Protection Rule для `main`
- [ ] Создать Branch Protection Rule для `develop`
- [ ] Настроить требуемые статус-чеки
- [ ] Включить требование approval
- [ ] Включить Include administrators
- [ ] Создать файл `.github/CODEOWNERS`
- [ ] Протестировать с тестовым PR
- [ ] Убедиться, что merge заблокирован до тестов
- [ ] Убедиться, что merge работает после тестов

---

**Поддержка:** DevOps Team  
**Последнее обновление:** 2025-10-04
