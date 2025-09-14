module.exports = {
    // Категории дефектов для Allure отчета
    categories: [
        {
            name: "🔴 Критические дефекты",
            description: "Критические ошибки, блокирующие основную функциональность",
            messageRegex: ".*AssertionError.*|.*Critical.*|.*CRITICAL.*",
            traceRegex: ".*AssertionError.*",
            matchedStatuses: ["failed", "broken"]
        },
        {
            name: "🟡 Проблемы UI/UX",
            description: "Проблемы пользовательского интерфейса и взаимодействия",
            messageRegex: ".*locator.*|.*element.*|.*visible.*|.*click.*",
            matchedStatuses: ["failed"]
        },
        {
            name: "🔵 Проблемы сети",
            description: "Ошибки сетевых запросов и API",
            messageRegex: ".*net::ERR.*|.*fetch.*|.*timeout.*|.*connection.*",
            matchedStatuses: ["failed", "broken"]
        },
        {
            name: "🟣 Таймауты",
            description: "Превышение времени ожидания",
            messageRegex: ".*Timeout.*|.*timeout.*|.*exceeded.*",
            matchedStatuses: ["failed"]
        },
        {
            name: "🟠 Проблемы конфигурации",
            description: "Ошибки настройки тестов и окружения",
            messageRegex: ".*config.*|.*setup.*|.*environment.*",
            matchedStatuses: ["broken"]
        }
    ],

    // Информация об окружении
    environment: {
        "🏷️ Проект": "Personal Productivity AI",
        "📦 Версия": "1.0.0",
        "🌍 Среда": process.env.NODE_ENV || "test",
        "🖥️ ОС": process.platform,
        "🌐 Node.js": process.version,
        "📅 Дата запуска": new Date().toLocaleString('ru-RU'),
        "👤 Запущено": process.env.USER || process.env.USERNAME || "unknown"
    }
}
