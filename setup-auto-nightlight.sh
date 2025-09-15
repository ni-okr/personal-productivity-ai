#!/bin/bash

echo "🌅 Настройка автоматического ночного света по закату/рассвету..."

# Включаем геолокацию
gsettings set org.gnome.system.location enabled true
dconf write /org/gnome/system/location/enabled true

# Включаем автоматическое расписание
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-automatic true
dconf write /org/gnome/settings-daemon/plugins/color/night-light-schedule-automatic true

# Включаем ночной свет
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true
dconf write /org/gnome/settings-daemon/plugins/color/night-light-enabled true

# Устанавливаем приятную температуру
gsettings set org.gnome.settings-daemon.plugins.color night-light-temperature 3000
dconf write /org/gnome/settings-daemon/plugins/color/night-light-temperature 3000

echo "✅ Автоматический ночной свет настроен!"
echo "🌍 Геолокация: включена"
echo "🌅 Режим: автоматический (закат → рассвет)"
echo "🌡️ Температура: 3000K"

echo ""
echo "📊 Текущий статус:"
echo "Включен: $(gsettings get org.gnome.settings-daemon.plugins.color night-light-enabled)"
echo "Автоматическое расписание: $(gsettings get org.gnome.settings-daemon.plugins.color night-light-schedule-automatic)"
echo "Геолокация: $(gsettings get org.gnome.system.location enabled)"
echo "Температура: $(gsettings get org.gnome.settings-daemon.plugins.color night-light-temperature)"

echo ""
echo "🌅 Система будет автоматически включать ночной свет с закатом"
echo "🌅 и выключать с рассветом на основе вашего местоположения"
