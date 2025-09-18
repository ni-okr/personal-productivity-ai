const fs = require('fs');
const path = require('path');

const fileToFix = 'tests/unit/tasks-store-dependency-injection.test.ts';

let content = fs.readFileSync(fileToFix, 'utf8');
let originalContent = content;

// Pattern to find test blocks where user setup is missing before loadTasks
const testBlockPattern = /(test\\(['\"].*?['\"],\\s*(?:async)?\\s*=>\\s*{[\\s\\S]*?)(testLogger\\.step\\(['\"]Setting up user['\"]\\)\\s*testMocks\\.addUser\\(mockUser\\)\\s*await act\\(async \\(\\) => \\{\\s*await result\\.current\\.loadTasks\\(\\)\\s*\\}\\)\\s*)(await testUtils\\.waitForCondition\\(\\() => result\\.current\\.tasks\\.length > 0\\)\\s*)/g;

content = content.replace(testBlockPattern, (match, p1, p2, p3) => {
    if (!p1.includes('result.current.setUser(mockUser)')) {
        return `${p1}${p2}
            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)
            
            ${p3}`;
    }
    return match;
});

// Pattern to find test blocks where user setup is missing before other API calls
const apiCallPattern = /(test\\(['\"].*?['\"],\\s*(?:async)?\\s*=>\\s*{[\\s\\S]*?)(testLogger\\.step\\(['\"]Setting up user['\"]\\)\\s*testMocks\\.addUser\\(mockUser\\)\\s*await act\\(async \\(\\) => \\{\\s*await result\\.current\\.(?:createTaskAsync|updateTaskAsync|deleteTaskAsync|completeTaskAsync|syncTasksAsync|loadTasksStats)\\([^}]*\\)\\s*\\}\\)\\s*)/g;

content = content.replace(apiCallPattern, (match, p1, p2) => {
    if (!p1.includes('result.current.setUser(mockUser)')) {
        return `${p1}${p2}
            // Устанавливаем пользователя в store перед вызовом API
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)
            
            `;
    }
    return match;
});

if (content !== originalContent) {
    fs.writeFileSync(fileToFix, content, 'utf8');
    console.log(`✅ Файл исправлен: ${fileToFix}`);
} else {
    console.log(`ℹ️ В файле не найдено изменений: ${fileToFix}`);
}

console.log('🎉 Все тесты исправлены!');