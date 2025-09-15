#!/bin/bash

# 🔍 Скрипт мониторинга фоновых агентов Cursor
# Показывает статус работы агентов и автоматических исправлений

echo "🤖 Мониторинг фоновых агентов Cursor"
echo "=================================="

# Загружаем переменные
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Переменные загружены из .env.local"
else
    echo "❌ Файл .env.local не найден"
    exit 1
fi

echo ""
echo "📊 Статус системы:"
echo "  - Cursor API Key: ${CURSOR_API_KEY:0:20}..."
echo "  - Рабочая директория: $(pwd)"
echo "  - Время: $(date)"

echo ""
echo "🧪 Проверка тестов:"
if npm test --silent > /dev/null 2>&1; then
    echo "  ✅ Тесты проходят успешно"
else
    echo "  ❌ Есть ошибки в тестах"
    echo "  🔧 Агенты должны исправить их автоматически"
fi

echo ""
echo "🏗️ Проверка сборки:"
if npm run build --silent > /dev/null 2>&1; then
    echo "  ✅ Сборка проходит успешно"
else
    echo "  ❌ Есть ошибки сборки"
    echo "  🔧 Агенты должны исправить их автоматически"
fi

echo ""
echo "📈 Статистика коммитов (последние 10):"
git log --oneline -10 --grep="fix:" --grep="feat:" --grep="test:" | head -5

echo ""
echo "🔍 Мониторинг в реальном времени:"
echo "  - Следите за изменениями в файлах тестов"
echo "  - Проверяйте автоматические коммиты"
echo "  - Мониторьте GitHub Actions"

echo ""
echo "💡 Команды для мониторинга:"
echo "  - ./cursor/monitor-agents.sh  # Этот скрипт"
echo "  - git log --oneline -10       # Последние коммиты"
echo "  - npm test                    # Запуск тестов"
echo "  - npm run build               # Проверка сборки"

echo ""
echo "🎯 Фоновые агенты работают автоматически!"
echo "   Они исправляют ошибки тестов и TypeScript в фоновом режиме."
