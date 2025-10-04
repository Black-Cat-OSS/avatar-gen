# 🚀 Deployment Flow Diagram

## Полная схема CI/CD процесса

```mermaid
graph TD
    A[Feature Branch] -->|PR| B{CI: develop}
    B -->|Fast Tests| C[SQLite + Local/S3]
    C -->|✅ Pass| D[Merge to develop]
    C -->|❌ Fail| A

    D -->|Push| E{CI: develop}
    E -->|Fast Tests| F[Confirm Stability]

    F -->|Накопление фич| G[develop Branch]

    G -->|PR to main| H{CI: main}
    H -->|Full Tests| I[SQLite + PostgreSQL<br/>× Local/S3]
    I -->|✅ Pass| J[Merge to main]
    I -->|❌ Fail| G

    J -->|Push| K{Deploy Workflow}
    K -->|Pre-Deploy Tests| L[Final Check]
    L -->|Build| M[Docker Images]
    M -->|Deploy| N[Production Server]
    N -->|Verify| O{Health Check}
    O -->|✅ OK| P[✅ Success]
    O -->|❌ Fail| Q[🔄 Rollback]

    R[Hotfix Branch] -->|Direct PR| H

    style A fill:#e1f5ff
    style G fill:#fff3cd
    style J fill:#d4edda
    style P fill:#28a745
    style Q fill:#dc3545
```

## Временные затраты

| Этап                     | Время     | Описание                           |
| ------------------------ | --------- | ---------------------------------- |
| **Feature → develop**    | 5-7 мин   | Быстрые тесты (SQLite)             |
| **develop → main**       | 15-20 мин | Полные тесты (SQLite + PostgreSQL) |
| **Deploy to Production** | 10-15 мин | Build + Deploy + Verify            |
| **Общее время релиза**   | 30-42 мин | От merge в develop до production   |

## Критерии качества

### ✅ Merge в develop

- Линтер пройден
- Быстрые тесты пройдены
- Code review одобрен
- Нет конфликтов

### ✅ Merge в main

- Все полные тесты пройдены
- Lead/Senior review
- Changelog обновлен
- Версия обновлена

### ✅ Production Deploy

- Pre-deploy тесты пройдены
- Health checks успешны
- Мониторинг в норме

---

**Поддержка:** DevOps Team  
**Последнее обновление:** 2025-10-04
