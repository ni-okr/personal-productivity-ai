#!/bin/bash

# 🔄 Скрипт сброса конфигурации Cursor IDE
# Исправляет проблемы с отображением агентов

echo "🔄 Сброс конфигурации Cursor IDE..."

# Останавливаем Cursor если запущен
if pgrep -f "cursor" > /dev/null; then
    echo "⏹️  Останавливаем Cursor..."
    pkill -f "cursor"
    sleep 2
fi

# Очищаем кеш Cursor
echo "🧹 Очищаем кеш Cursor..."
rm -rf ~/.cursor/logs/* 2>/dev/null || true
rm -rf ~/.cursor/CachedData/* 2>/dev/null || true
rm -rf ~/.cursor/User/workspaceStorage/* 2>/dev/null || true

# Создаем правильную структуру конфигурации
echo "📁 Создаем конфигурацию агентов..."
mkdir -p .cursor/agents
mkdir -p .cursor/config

# Копируем конфигурацию агентов
cp .cursor/agents.json .cursor/agents/agents.json 2>/dev/null || true
cp .cursor/settings.json .cursor/config/settings.json 2>/dev/null || true
cp .cursor/workspace.json .cursor/config/workspace.json 2>/dev/null || true

# Создаем файл активации агентов
cat > .cursor/agents/activate.json << EOF
{
  "status": "active",
  "agents": [
    "test-fixer-agent",
    "typescript-fixer-agent", 
    "jest-configurator-agent",
    "github-actions-monitor-agent"
  ],
  "lastActivated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "✅ Конфигурация сброшена"
echo "🚀 Перезапустите Cursor IDE"
echo ""
echo "💡 После перезапуска:"
echo "  1. Откройте ваш проект"
echo "  2. Перейдите в раздел 'Agents'"
echo "  3. Очистите фильтр 'PROJECT_CONFIG'"
echo "  4. Агенты должны отобразиться в списке"
