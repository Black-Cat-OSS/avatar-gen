# 🌿 GitFlow & CI/CD Strategy

**Дата создания:** 2025-10-04  
**Версия:** 1.0

## 🎯 Обзор

Проект использует модифицированную GitFlow стратегию с автоматизированным CI/CD
pipeline.

## 🌳 Структура веток

```
main (production)
  ↑
  │ PR + Full Tests
  │
develop (staging)
  ↑
  │ PR + Fast Tests
  │
feature/*, fix/* (development)
```

### Описание веток

| Ветка       | Назначение          | Защита           | Деплой         |
| ----------- | ------------------- | ---------------- | -------------- |
| `main`      | Production код      | ✅ Protected     | ✅ Auto deploy |
| `develop`   | Staging/интеграция  | ✅ Protected     | ❌ No deploy   |
| `feature/*` | Новые фичи          | ❌ Not protected | ❌ No deploy   |
| `fix/*`     | Исправления багов   | ❌ Not protected | ❌ No deploy   |
| `hotfix/*`  | Срочные исправления | ⚠️ Special rules | ⚡ Fast deploy |

---

## 🔄 Workflow: Разработка новой фичи

### 1. Создание feature ветки

```bash
# Обновляем develop
git checkout develop
git pull origin develop

# Создаем feature ветку
git checkout -b feature/9

# Или для багфикса
git checkout -b fix/123
```

### 2. Разработка и коммиты

```bash
# Делаем изменения
# ...

# Коммитим (следуя conventional commits)
git add .
git commit -m "feat: add user avatar generation"

# Push в GitHub
git push origin feature/9
```

### 3. Pull Request в develop

```bash
# Создаем PR: feature/9 → develop
```

**Что происходит автоматически:**

✅ **CI Workflow запускается**

- Lint backend & frontend
- **Быстрые тесты:** SQLite + Local/S3 (~5-7 минут)
- Build frontend
- Docker build test

**Критерии мерджа:**

- ✅ Все тесты пройдены
- ✅ Code review одобрен
- ✅ Нет конфликтов

### 4. Merge в develop

```bash
# После одобрения PR
# Merge через GitHub UI
```

**Что происходит автоматически:**

✅ **CI Workflow запускается снова**

- Быстрые тесты для develop ветки
- Подтверждение стабильности

---

## 🚀 Workflow: Релиз в Production

### 1. Подготовка к релизу

```bash
# Убедитесь, что develop стабилен
# Все фичи протестированы
# Все PR смержены в develop
```

### 2. Pull Request: develop → main

```bash
# Создаем PR: develop → main
```

**Что происходит автоматически:**

✅ **CI Workflow с полными тестами**

- Lint backend & frontend
- **Полные тесты:** SQLite + PostgreSQL × Local/S3 (~15-20 минут)
- Build frontend
- Docker build test

**Критерии мерджа:**

- ✅ Все полные тесты пройдены
- ✅ Code review от lead/senior
- ✅ Changelog обновлен
- ✅ Версия обновлена

### 3. Merge в main

```bash
# После одобрения PR
# Merge через GitHub UI (Squash или Merge commit)
```

**Что происходит автоматически:**

✅ **Deploy Workflow запускается**

1. **Pre-Deploy тесты** (быстрые, ~5 минут)
   - Финальная проверка
2. **Build Docker Images**
   - Сборка всех образов
3. **Deploy to Production**
   - SSH подключение к серверу
   - Pull изменений
   - Rebuild & restart контейнеров
4. **Verification**
   - Health checks
   - Rollback при ошибках

---

## ⚡ Workflow: Hotfix (срочное исправление)

Используется для критических багов в production.

### 1. Создание hotfix ветки от main

```bash
# Создаем от main!
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug
```

### 2. Исправление и тестирование

```bash
# Исправляем баг
# Тестируем локально
pnpm run test

# Коммитим
git commit -m "fix: critical security issue"
git push origin hotfix/critical-bug
```

### 3. PR напрямую в main

```bash
# Создаем PR: hotfix/critical-bug → main
# Пометить как "urgent" или "hotfix"
```

**Быстрый путь:** После review сразу merge в main

### 4. Автоматический deploy

Deploy запустится автоматически.

**Опция для экстренных случаев:**

```bash
# Ручной запуск с пропуском тестов (только для критических случаев!)
Actions → Deploy to Production → Run workflow
- skip_tests: true
```

⚠️ **ВАЖНО:** После hotfix обязательно merge main → develop!

```bash
git checkout develop
git merge main
git push origin develop
```

---

## 📊 Матрица тестов

### PR в develop (быстрые тесты)

| Database | Storage | Duration |
| -------- | ------- | -------- |
| SQLite   | Local   | ~2 min   |
| SQLite   | S3      | ~3 min   |

**Итого:** ~5-7 минут

### PR в main (полные тесты)

| Database   | Storage | Duration |
| ---------- | ------- | -------- |
| SQLite     | Local   | ~2 min   |
| SQLite     | S3      | ~3 min   |
| PostgreSQL | Local   | ~5 min   |
| PostgreSQL | S3      | ~6 min   |

**Итого:** ~15-20 минут

---

## 🛡️ Правила защиты веток

### Настройки для `main`

```yaml
Branch protection rules:
  ✅ Require pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale reviews
  ✅ Require status checks to pass
     - lint-backend
     - lint-frontend
     - test-backend (all matrix jobs)
     - build-frontend
     - docker-build-test
  ✅ Require conversation resolution
  ✅ Include administrators
  ❌ Allow force pushes: Never
  ❌ Allow deletions: Never
```

### Настройки для `develop`

```yaml
Branch protection rules:
  ✅ Require pull request before merging
  ✅ Require approvals: 1
  ✅ Require status checks to pass
     - lint-backend
     - lint-frontend
     - test-backend (fast tests)
  ✅ Require conversation resolution
  ❌ Allow force pushes: Never
```

---

## 📝 Чеклист перед релизом

### Developer Checklist

- [ ] Все фичи протестированы локально
- [ ] Unit тесты написаны и пройдены
- [ ] E2E тесты обновлены (если нужно)
- [ ] Документация обновлена
- [ ] Нет TODO или FIXME в коде
- [ ] Миграции БД протестированы
- [ ] Переменные окружения задокументированы

### Release Manager Checklist

- [ ] Changelog обновлен
- [ ] Версия обновлена (package.json)
- [ ] Все PR в develop смержены
- [ ] Develop ветка стабильна
- [ ] CI тесты в develop проходят
- [ ] Staging environment протестирован (если есть)
- [ ] Backup production БД создан
- [ ] Rollback план готов

### Post-Deploy Checklist

- [ ] Health checks прошли
- [ ] Основная функциональность работает
- [ ] Нет критических ошибок в логах
- [ ] Мониторинг показывает норму
- [ ] Users не сообщают о проблемах

---

## 🚨 Rollback Strategy

### Автоматический Rollback

Deploy workflow автоматически откатывается при:

- ❌ Health check провалился
- ❌ Контейнеры не запустились
- ❌ Критическая ошибка в логах

### Ручной Rollback

```bash
# 1. SSH на сервер
ssh -p $SSH_PORT $SSH_USERNAME@$SSH_HOST

# 2. Перейти в директорию приложения
cd $APP_PATH

# 3. Откатиться на предыдущую версию
git checkout HEAD~1

# 4. Пересобрать и перезапустить
docker compose -f docker/docker-compose.yml down
docker compose -f docker/docker-compose.yml up -d --build

# 5. Проверить health
curl http://localhost:3000/api/health
```

### Rollback через GitHub

```bash
# 1. Revert commit в main
git revert HEAD

# 2. Push (запустит новый deploy)
git push origin main
```

---

## 📈 Мониторинг и логирование

### GitHub Actions

- Все запуски логируются
- Доступны в `Actions` табе
- Хранятся 90 дней

### Production Logs

```bash
# Просмотр логов
docker compose -f docker/docker-compose.yml logs -f

# Только backend
docker compose -f docker/docker-compose.yml logs -f avatar-backend

# Последние 100 строк
docker compose -f docker/docker-compose.yml logs --tail=100 avatar-backend
```

---

## 🔗 Связанные документы

- [Workflows Guide](WORKFLOWS_GUIDE.md)
- [GitHub Secrets Configuration](GITHUB_SECRETS_CONFIGURATION.md)
- [DevOps Integration Guide](DEVOPS_INTEGRATION_GUIDE.md)

---

## 📞 Контакты

- **Emergency Hotline:** [Your Contact]
- **Team Lead:** [Lead Contact]
- **DevOps:** [DevOps Contact]

---

**Поддержка:** DevOps Team  
**Последнее обновление:** 2025-10-04
