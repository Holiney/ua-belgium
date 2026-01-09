# Telegram Auth Edge Function

Edge Function для авторизації через Telegram Login Widget.

## Як це працює

1. Користувач натискає кнопку "Увійти через Telegram"
2. Telegram повертає підписані дані користувача
3. Frontend викликає цю Edge Function
4. Функція валідує підпис через Bot Token
5. Створює або знаходить користувача в Supabase
6. Повертає JWT токен для авторизації

## Деплой

### 1. Встановити Supabase CLI

```bash
npm install -g supabase
```

### 2. Залогінитись

```bash
supabase login
```

### 3. Зв'язати з проектом

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Project ref можна знайти в Supabase Dashboard → Settings → General.

### 4. Встановити секрети

```bash
# Telegram Bot Token (отримати від @BotFather)
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token

# JWT Secret (знайти в Supabase Dashboard → Settings → API → JWT Secret)
supabase secrets set SUPABASE_JWT_SECRET=your_jwt_secret
```

### 5. Задеплоїти функцію

```bash
supabase functions deploy telegram-auth
```

## Змінні середовища

Функція автоматично має доступ до:
- `SUPABASE_URL` - URL вашого Supabase проекту
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ

Потрібно вручну додати:
- `TELEGRAM_BOT_TOKEN` - токен вашого Telegram бота
- `SUPABASE_JWT_SECRET` - JWT секрет для підпису токенів

## Тестування локально

```bash
supabase functions serve telegram-auth --env-file .env.local
```

Створіть `.env.local`:
```
TELEGRAM_BOT_TOKEN=your_bot_token
SUPABASE_JWT_SECRET=your_jwt_secret
```

## Безпека

- Функція валідує HMAC-SHA256 підпис від Telegram
- Перевіряє що auth_date не старіший 24 годин
- Використовує Service Role для створення користувачів
- JWT токени дійсні 7 днів
