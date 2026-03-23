# Social Network API

Социальная сеть с поддержкой друзей, чатов и новостной ленты. Сессии — используются для аутентификации.
## Технологии

- **Java 17**
- **Spring Boot** — основной фреймворк
- **Spring Security** — аутентификация и авторизация
- **Spring Data JPA** — работа с PostgreSQL
- **Spring Data MongoDB** — работа с сообщениями и новостями
- **Spring WebSocket** — real-time чат и лента новостей
- **PostgreSQL** — хранение пользователей и дружеских связей
- **MongoDB** — хранение сообщений и новостей
- **Liquibase** — миграции базы данных
- **Maven** — сборка проекта
- **Angular** - фронтенд-фреймоворк
- **Docker-compose** - для запуска postgres и mongodb

## Функциональность

### Пользователи
- Регистрация и авторизация
- Просмотр списка пользователей
- Обновление профиля (ФИО, email, дата рождения, фото)
- Удаление аккаунта

### Друзья
- Добавление в друзья
- Удаление из друзей
- Просмотр списка друзей

### Чат (WebSocket)
- Отправка сообщений в реальном времени
- Удаление сообщений
- История переписки

### Новостная лента (WebSocket)
- Создание новостей
- Удаление новостей
- Лента новостей от себя и друзей в реальном времени

## API Endpoints

### Аутентификация

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/auth/check` | Проверка сессии |

### Пользователи

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/users` | Получить всех пользователей |
| PUT | `/api/user/{id}` | Обновить профиль (multipart/form-data) |
| DELETE | `/api/user/{id}` | Удалить пользователя |
| GET | `/api/user/{id}/name` | Получить имя пользователя |

### Друзья

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/user/{id}/friends` | Получить список друзей |
| POST | `/api/user/{id}/friends` | Добавить друга (body: Long friendId) |
| DELETE | `/api/user/{id}/friends/{friendId}` | Удалить из друзей |

### Статические ресурсы

| Эндпоинт | Описание |
|----------|----------|
| `/photos/**` | Фото пользователей |

## WebSocket

**Подключение:** `ws://localhost:3001/ws?userId={id}&chatId={chatId}`

### Каналы

#### Чат (`chat`)
- `type: "chat"` — отправка сообщения
- `type: "deleteMessage"` — удаление сообщения

#### Новости (`news`)
- `type: "add"` — добавить новость
- `type: "delete"` — удалить новость

## Схема базы данных

### PostgreSQL (users, friendship)

```sql
-- users
id BIGSERIAL PRIMARY KEY
last_name VARCHAR(50) NOT NULL
first_name VARCHAR(50) NOT NULL
middle_name VARCHAR(50)
birth_date DATE
email VARCHAR(255) UNIQUE NOT NULL
photo VARCHAR(500)
role VARCHAR(20) DEFAULT 'user'
status VARCHAR(20) DEFAULT 'active'
password VARCHAR(255) NOT NULL

-- friendship
first_friend_id BIGINT
second_friend_id BIGINT
PRIMARY KEY (first_friend_id, second_friend_id)
```



### MongoDB

Коллекция messages
```json
{
  "_id": "4_5",
  "messages": [
    {
      "id": "uuid",
      "senderId": "4",
      "receiverId": "5",
      "text": "Привет!",
      "date": "2024-01-01T12:00:00"
    }
  ]
}
```

Коллекция user_news
```json
{
  "_id": "4",
  "news": [
    {
      "id": "n4_1",
      "title": "Заголовок",
      "content": "Содержание",
      "date": "2024-01-01T12:00:00"
    }
  ]
}
```

