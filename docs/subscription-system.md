# 💳 Система подписок и монетизации

## 📋 Обзор

Система подписок интегрирована с Тинькофф Эквайринг для обработки платежей и управления подписками. Поддерживает несколько тарифных планов с разными возможностями ИИ.

## 🏗️ Архитектура

### Компоненты системы:

1. **Тинькофф Integration** (`src/lib/tinkoff.ts`)
   - Создание клиентов
   - Payment сессии
   - Customer Portal
   - Webhook обработка

2. **Subscription Management** (`src/lib/subscriptions.ts`)
   - CRUD операции с подписками
   - Управление планами
   - Интеграция с Supabase

3. **UI Components**
   - `SubscriptionModal` - выбор плана
   - `SubscriptionStatus` - статус подписки
   - `SubscriptionCard` - карточка плана

4. **API Routes**
   - `/api/subscriptions/create-checkout` - создание checkout
   - `/api/subscriptions/portal` - customer portal
   - `/api/subscriptions/webhook` - webhook обработка
   - `/api/subscriptions/status` - статус подписки
   - `/api/subscriptions/plans` - планы подписок

## 💰 Тарифные планы

### Free Tier
- **Цена**: Бесплатно
- **Задачи**: 50
- **ИИ запросы**: 10/день
- **Хранилище**: 100 MB
- **Функции**: Базовый планировщик, Mock AI

### Premium Tier
- **Цена**: ₽999/месяц
- **Задачи**: 500
- **ИИ запросы**: 1000/день
- **Хранилище**: 1 GB
- **Функции**: OpenAI GPT-4o Mini, приоритетная поддержка

### Pro Tier
- **Цена**: ₽1999/месяц
- **Задачи**: Неограниченно
- **ИИ запросы**: Неограниченно
- **Хранилище**: 10 GB
- **Функции**: Все ИИ модели, аналитика, API доступ

### Enterprise Tier
- **Цена**: По запросу
- **Функции**: Белый лейбл, интеграции, персональный менеджер

## 🔧 Настройка

### 1. Тинькофф Configuration

```env
TINKOFF_TERMINAL_KEY=your_terminal_key
TINKOFF_SECRET_KEY=your_secret_key
TINKOFF_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Database Schema

```sql
-- Таблица подписок
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  status subscription_status NOT NULL,
  tinkoff_customer_id TEXT,
  tinkoff_payment_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица планов подписок
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier subscription_tier NOT NULL,
  price INTEGER NOT NULL, -- в копейках
  currency TEXT DEFAULT 'RUB',
  interval TEXT NOT NULL, -- 'month' или 'year'
  features TEXT[] NOT NULL,
  limits JSONB NOT NULL,
  tinkoff_price_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. RLS Policies

```sql
-- Пользователи видят только свои подписки
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои подписки
CREATE POLICY "Users can create own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои подписки
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Планы подписок доступны всем
CREATE POLICY "Subscription plans are public" ON subscription_plans
  FOR SELECT USING (is_active = TRUE);
```

## 🚀 Использование

### Создание checkout сессии

```typescript
import { useSubscription } from '@/hooks/useSubscription'

function UpgradeButton() {
  const { createCheckoutSession } = useSubscription()

  const handleUpgrade = async () => {
    const result = await createCheckoutSession('plan-premium')
    
    if (result.success && result.url) {
      window.location.href = result.url
    }
  }

  return <button onClick={handleUpgrade}>Обновить до Premium</button>
}
```

### Проверка статуса подписки

```typescript
import { useSubscription } from '@/hooks/useSubscription'

function SubscriptionInfo() {
  const { subscription, plan, isLoading } = useSubscription()

  if (isLoading) return <div>Загрузка...</div>

  return (
    <div>
      <h3>{plan?.name}</h3>
      <p>Статус: {subscription?.status}</p>
      <p>Следующее списание: {subscription?.currentPeriodEnd}</p>
    </div>
  )
}
```

### Управление подпиской

```typescript
import { useSubscription } from '@/hooks/useSubscription'

function ManageSubscription() {
  const { createPortalSession } = useSubscription()

  const handleManage = async () => {
    const result = await createPortalSession()
    
    if (result.success && result.url) {
      window.open(result.url, '_blank')
    }
  }

  return <button onClick={handleManage}>Управление подпиской</button>
}
```

## 🔔 Webhook Events

### Обрабатываемые события:

1. **customer.subscription.created** - новая подписка
2. **customer.subscription.updated** - обновление подписки
3. **customer.subscription.deleted** - отмена подписки
4. **invoice.payment_succeeded** - успешная оплата
5. **invoice.payment_failed** - неудачная оплата

### Webhook Handler

```typescript
// src/app/api/subscriptions/webhook/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  const result = await handleStripeWebhook(body, signature)
  
  if (result.success) {
    return NextResponse.json({ received: true })
  } else {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
}
```

## 🧪 Тестирование

### Unit Tests
- `tests/unit/subscriptions.test.ts` - тесты управления подписками
- `tests/unit/tinkoff.test.ts` - тесты Тинькофф интеграции

### Integration Tests
- `tests/integration/subscription-integration.test.tsx` - тесты UI компонентов

### Запуск тестов

```bash
# Unit тесты
npm run test:unit

# Integration тесты
npm run test:integration

# Все тесты
npm run test
```

## 🔒 Безопасность

### 1. Webhook Verification
- Проверка подписи Тинькофф
- Валидация событий
- Idempotency обработка

### 2. RLS Policies
- Пользователи видят только свои данные
- Администраторы имеют полный доступ
- Аудит изменений

### 3. API Security
- Проверка авторизации
- Валидация входных данных
- Rate limiting

## 📊 Мониторинг

### Метрики для отслеживания:

1. **Конверсия**: Free → Premium → Pro
2. **Churn Rate**: Процент отмен подписок
3. **MRR**: Monthly Recurring Revenue
4. **ARPU**: Average Revenue Per User
5. **LTV**: Lifetime Value

### Логирование:

```typescript
// Логирование событий подписки
console.log('Subscription created:', {
  userId: subscription.userId,
  tier: subscription.tier,
  amount: plan.price,
  timestamp: new Date().toISOString()
})
```

## 🚨 Troubleshooting

### Частые проблемы:

1. **Webhook не работает**
   - Проверить URL в Тинькофф Dashboard
   - Проверить подпись webhook
   - Проверить логи сервера

2. **Payment не открывается**
   - Проверить Тинькофф ключи
   - Проверить CORS настройки
   - Проверить валидность плана

3. **Portal не работает**
   - Проверить customer ID
   - Проверить настройки Portal в Тинькофф
   - Проверить return URL

### Debug режим:

```typescript
// Включить debug логи
process.env.TINKOFF_DEBUG = 'true'
```

## 🔄 Обновления

### Миграции базы данных:

```sql
-- Добавление нового поля
ALTER TABLE subscriptions ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE;

-- Обновление существующих записей
UPDATE subscriptions SET trial_end = current_period_end WHERE tier = 'premium';
```

### Версионирование API:

- v1: Базовая функциональность
- v2: Добавление Enterprise планов
- v3: Планируется: семейные подписки

## 📈 Roadmap

### Q1 2025:
- [ ] Семейные подписки
- [ ] Годовые скидки
- [ ] Промокоды

### Q2 2025:
- [ ] Корпоративные планы
- [ ] API для партнеров
- [ ] Аффилиатная программа

### Q3 2025:
- [ ] Криптовалютные платежи
- [ ] Локальные платежные системы
- [ ] Мобильные платежи
