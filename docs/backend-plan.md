# План: Реализация бэкенда на Kotlin (Ktor) + автотесты

## Контекст (из изученного проекта)
- Контракт зафиксирован в `main.tsp` → `tsp-output/@typespec/openapi3/openapi.yaml`.
- Фронт (`frontend/`) проксирует `/api` на `http://localhost:4010` (`vite.config.ts`), prism-mock тоже на 4010 → бэкенд по умолчанию слушает порт 4010.
- 6 эндпоинтов, формат ошибок: `{ code, message, details? }` со статусами 404/409/422.
- Хранилище — in-memory (сбрасывается при рестарте).
- Окружение: Java 21 (JBR) есть; Gradle/Kotlin глобально нет → используем Gradle Wrapper.
- Весь проект в итоге упаковывается в Docker-образ.

## Решения (зафиксированы)
- **Стек:** Kotlin + Ktor (Netty), kotlinx-serialization, kotlinx-datetime, Gradle (Kotlin DSL) + wrapper.
- **Порт:** по умолчанию `4010` (совместим с vite-прокси), переопределяется через ENV `PORT`. Слушать на `0.0.0.0` (Docker-ready).
- **Тесты:** интеграционные (Ktor `testApplication`) + unit-тесты сервисов. CI — позже.
- **Docker:** не сейчас; код делаем Docker-ready (ENV PORT, host 0.0.0.0). Dockerfile на шаге деплоя.
- **Хранилище:** in-memory, сбрасывается при рестарте.

## Почему конфликтов порта не будет
- В Docker контейнеры изолированы; внутренний порт задаётся ENV, наружу маппится отдельно. 4010 внутри контейнера ни с чем не конкурирует.
- Для dev сейчас 4010 совпадает с тем, что ждёт фронт (`vite.config.ts`) — ничего менять во фронте не надо.

## Структура `backend/`
```
backend/
  build.gradle.kts, settings.gradle.kts, gradle.properties
  gradlew, gradlew.bat, gradle/wrapper/*        # Gradle wrapper
  .gitignore                                     # build/, .gradle/
  README.md                                      # как запускать
  src/main/kotlin/com/booking/
    Application.kt                # запуск Netty, host 0.0.0.0, port = ENV PORT ?: 4010
    plugins/Serialization.kt      # ContentNegotiation(JSON, ISO-8601 даты)
    plugins/StatusPages.kt        # доменные исключения → {code,message,details} + 404/409/422
    plugins/Routing.kt            # подключение admin + public маршрутов
    model/Models.kt               # Owner, EventType, Slot, GuestContact, Booking (@Serializable)
    model/Requests.kt             # CreateEventTypeRequest, CreateBookingRequest, ErrorBody
    storage/InMemoryStore.kt      # ConcurrentHashMap + seed Owner
    config/SlotConfig.kt          # рабочие часы/дни/шаг/окно — конфигурируемо
    service/SlotService.kt        # генерация и фильтрация свободных слотов
    service/EventTypeService.kt   # создание/список типов
    service/BookingService.kt     # бизнес-правила брони
  src/test/kotlin/com/booking/
    service/SlotServiceTest.kt        # unit: сетка слотов, окно 14 дней, исключение прошлого
    service/BookingServiceTest.kt     # unit: правила (404/422/409, расчёт endTime)
    api/AdminRoutesTest.kt            # интеграц.: owner, create/list event-types (201/409/422)
    api/PublicRoutesTest.kt           # интеграц.: slots(200/404), booking(201/404/422/409)
    api/BookingConflictTest.kt        # интеграц.: повторная бронь того же слота → 409
```

## Эндпоинты (по контракту `openapi.yaml`)
| Метод | Путь | Ответы |
|---|---|---|
| GET | `/api/admin/owner` | 200 Owner |
| POST | `/api/admin/event-types` | 201 / 409 / 422 |
| GET | `/api/admin/event-types` | 200 EventType[] |
| GET | `/api/admin/bookings` | 200 Booking[] |
| GET | `/api/public/event-types` | 200 EventType[] |
| GET | `/api/public/event-types/{eventTypeId}/slots` | 200 Slot[] / 404 |
| POST | `/api/public/bookings` | 201 / 404 / 409 / 422 |

## Бизнес-правила
- **Слоты** (`SlotConfig`, легко менять): рабочие дни Пн–Пт, часы 09:00–17:00, шаг = `durationMinutes`, окно 14 дней от «сейчас»; прошлые и занятые слоты исключаются.
- **createBooking**: тип не найден → 404; невалидные `guest.name`/`email` → 422; `startTime` в прошлом → 422; `startTime` не на сетке слотов → 422; слот занят → **409** (атомарная проверка через synchronized). `endTime = startTime + durationMinutes`.
- **createEventType**: дубликат `id` → 409; пустые поля / `durationMinutes <= 0` → 422.
- Ответы об ошибках строго по контракту: `{ code, message, details? }`.

## Шаги реализации
1. Скелет Gradle-проекта в `backend/` + Gradle wrapper.
2. Модели и тела запросов/ошибок (`@Serializable`, ISO-8601 UTC).
3. `InMemoryStore` + seed владельца (например timezone `Europe/Moscow`).
4. `SlotConfig` + `SlotService`.
5. `EventTypeService`, `BookingService` + доменные исключения.
6. Ktor-плагины: Serialization, StatusPages, Routing (опционально CORS — на случай прямого origin).
7. `Application.kt` — запуск на `0.0.0.0:${PORT:-4010}`.
8. Тесты: unit + интеграционные (`testApplication`), включая сценарий «слот занят → 409».
9. Проверка: `./gradlew test`, `./gradlew run`, curl по эндпоинтам, запуск против живого фронта (`npm run dev`).
10. `backend/README.md` (запуск/тесты); по желанию — секция в корневом README.

## Открытые вопросы / отложено
- CORS: при работе через vite-прокси не нужен; добавить плагин опционально на случай прямого обращения с другого origin.
- CI для бэкенд-тестов — добавить позже.
- Dockerfile — на шаге деплоя.
