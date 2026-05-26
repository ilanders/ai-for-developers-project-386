# Calendar Booking — Frontend

Frontend часть приложения для бронирования временных слотов.

Стек: TypeScript + Vite + React + Mantine

## Разработка

### 1. Запуск mock API (Prism)

```bash
npm run mock
```

Prism запускается на `http://localhost:4010` и эмулирует бэкенд по OpenAPI-спецификации.

### 2. Запуск фронтенда (в отдельном терминале)

```bash
npm run dev
```

Vite dev server на `http://localhost:5173`. Запросы к `/api/*` проксируются на Prism.

### 3. Остановка

```bash
lsof -ti :4010 -ti :5173 | xargs kill -9   # остановить всё сразу
```

### Регенерация типов

При изменении API-контракта (`main.tsp` в корне проекта):

```bash
# из корня проекта
npm run generate
```

Это скомпилирует TypeSpec в OpenAPI и сгенерирует TypeScript-типы в `src/types/api.ts`.

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск Vite dev server |
| `npm run build` | Сборка для production |
| `npm run mock` | Запуск Prism mock API |
| `npm run preview` | Preview production-сборки |
