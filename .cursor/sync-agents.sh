#!/bin/bash

# 🤖 Автоматическая синхронизация с фоновыми агентами
# Запускать каждые 5 минут для подтягивания исправлений

echo "🔄 Проверка новых изменений от фоновых агентов..."

# Подтягиваем все ветки
git fetch --all

# Получаем список веток агентов
AGENT_BRANCHES=$(git branch -r | grep -E "(agent|fix|feature)" | grep -v "origin/main")

if [ -z "$AGENT_BRANCHES" ]; then
    echo "✅ Нет новых веток агентов"
    exit 0
fi

echo "📋 Найдены ветки агентов:"
echo "$AGENT_BRANCHES"

# Проверяем каждую ветку на новые коммиты
for branch in $AGENT_BRANCHES; do
    echo "🔍 Проверяем ветку: $branch"
    
    # Получаем последний коммит ветки
    LAST_COMMIT=$(git log -1 --format="%H" $branch)
    
    # Проверяем есть ли этот коммит в main
    if ! git merge-base --is-ancestor $LAST_COMMIT main; then
        echo "🆕 Найдены новые изменения в $branch"
        
        # Показываем что изменилось
        echo "📝 Изменения:"
        git log --oneline main..$branch
        
        # Спрашиваем пользователя что делать
        echo "❓ Хотите смержить $branch в main? (y/n)"
        read -r response
        
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo "🔄 Мержим $branch в main..."
            git merge $branch
            echo "✅ Ветка $branch успешно смержена"
        else
            echo "⏭️ Пропускаем $branch"
        fi
    else
        echo "✅ Ветка $branch уже в main"
    fi
done

echo "🎉 Синхронизация завершена!"
