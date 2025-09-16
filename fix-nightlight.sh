#!/bin/bash

# Скрипт для принудительного включения ночного света
echo "🌙 Принудительное включение ночного света..."

# Отключаем автоматическое расписание
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-automatic false
dconf write /org/gnome/settings-daemon/plugins/color/night-light-schedule-automatic false

# Включаем ночной свет
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true
dconf write /org/gnome/settings-daemon/plugins/color/night-light-enabled true

# Устанавливаем максимальную температуру (самая теплая)
gsettings set org.gnome.settings-daemon.plugins.color night-light-temperature 2700
dconf write /org/gnome/settings-daemon/plugins/color/night-light-temperature 2700

# Устанавливаем ручное расписание (всегда включено)
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-from 0.0
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-to 24.0

echo "✅ Ночной свет принудительно включен!"
echo "🌡️ Температура: 2700K (максимально теплая)"
echo "⏰ Режим: всегда включен"

# Проверяем статус
echo ""
echo "📊 Текущий статус:"
echo "Включен: $(gsettings get org.gnome.settings-daemon.plugins.color night-light-enabled)"
echo "Автоматическое расписание: $(gsettings get org.gnome.settings-daemon.plugins.color night-light-schedule-automatic)"
echo "Температура: $(gsettings get org.gnome.settings-daemon.plugins.color night-light-temperature)"
