#!/bin/bash

# 🤖 Скрипт активации фоновых агентов Cursor
# Автоматически исправляет ошибки тестов и TypeScript

echo "🚀 Активация фоновых агентов Cursor..."

# Проверяем наличие Cursor
if ! command -v cursor &> /dev/null; then
    echo "❌ Cursor не найден. Установите Cursor IDE."
    exit 1
fi

# Загружаем переменные из .env.local
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Переменные загружены из .env.local"
fi

# Проверяем наличие API ключа
if [ -z "$CURSOR_API_KEY" ]; then
    echo "⚠️  CURSOR_API_KEY не установлен. Установите переменную окружения."
    echo "   export CURSOR_API_KEY=your_api_key_here"
    exit 1
fi

echo "✅ Cursor найден"
echo "✅ API ключ установлен"

# Активируем фоновых агентов
echo "🤖 Активация агентов..."

# Test Fixer Agent
echo "  🧪 Test Fixer Agent - исправляет ошибки тестов"
cursor agent enable test_fixer

# TypeScript Fixer Agent  
echo "  🔧 TypeScript Fixer Agent - исправляет ошибки TypeScript"
cursor agent enable typescript_fixer

# Jest Configurator Agent
echo "  ⚙️  Jest Configurator Agent - настраивает Jest"
cursor agent enable jest_configurator

# GitHub Actions Monitor Agent
echo "  🚀 GitHub Actions Monitor Agent - мониторит CI/CD"
cursor agent enable github_actions_monitor

echo ""
echo "🎉 Фоновые агенты активированы!"
echo ""
echo "📊 Статус агентов:"
cursor agent status

echo ""
echo "🔍 Мониторинг:"
echo "  - Логи: cursor agent logs"
echo "  - Статус: cursor agent status"
echo "  - Остановка: cursor agent stop"
echo ""
echo "💡 Агенты будут автоматически исправлять ошибки тестов!"
