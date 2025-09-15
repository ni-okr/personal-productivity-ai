#!/bin/bash

# 👀 Скрипт мониторинга фоновых агентов в реальном времени
# Показывает изменения в файлах и коммитах

echo "👀 Мониторинг фоновых агентов в реальном времени"
echo "=============================================="
echo "Нажмите Ctrl+C для остановки"
echo ""

# Функция для обновления статуса
update_status() {
    clear
    echo "👀 Мониторинг фоновых агентов в реальном времени"
    echo "=============================================="
    echo "Время: $(date)"
    echo ""
    
    # Обновляем статус
    ./.cursor/update-agent-status.sh > /dev/null 2>&1
    
    # Показываем краткий статус
    echo "📊 Краткий статус:"
    if npm test --silent > /dev/null 2>&1; then
        echo "  🧪 Тесты: ✅ Проходят"
    else
        echo "  🧪 Тесты: ❌ Есть ошибки (агенты исправляют)"
    fi
    
    if npm run build --silent > /dev/null 2>&1; then
        echo "  🏗️ Сборка: ✅ Проходит"
    else
        echo "  🏗️ Сборка: ❌ Есть ошибки (агенты исправляют)"
    fi
    
    echo ""
    echo "📈 Последние коммиты:"
    git log --oneline -3 --grep="fix:" --grep="feat:" --grep="test:" | head -3
    
    echo ""
    echo "🔍 Мониторинг файлов тестов..."
    echo "  - tests/unit/"
    echo "  - tests/integration/"
    echo "  - jest.config.js"
    echo "  - jest.setup.js"
    
    echo ""
    echo "💡 Агенты работают автоматически!"
    echo "   Следите за изменениями в файлах и коммитах."
}

# Запускаем мониторинг
while true; do
    update_status
    sleep 10
done
