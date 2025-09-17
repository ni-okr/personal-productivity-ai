#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Функция для исправления тестов
function fixTestFile(filePath) {
    console.log(`Исправляем файл: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');

    // Паттерн для поиска и замены установки пользователя
    const userSetupPattern = /(\s+)(testLogger\.step\('Setting up user'\)\s+testMocks\.addUser\(mockUser\)\s+)(\/\/ Устанавливаем пользователя в store перед вызовом \w+\s+await act\(async \(\) => \{\s+result\.current\.setUser\(mockUser\)\s+\}\)\s+)(\s+)(testLogger\.step\('\w+'\))/g;

    // Заменяем на версию с ожиданием установки пользователя
    content = content.replace(userSetupPattern, (match, indent1, setup, userSet, indent2, nextStep) => {
        return `${indent1}${setup}${userSet}
            // Ждем, пока пользователь установится
            await testUtils.waitForCondition(() => result.current.user !== null)
${indent2}${nextStep}`;
    });

    // Также исправляем случаи, где нет комментария об установке пользователя
    const simpleUserSetupPattern = /(\s+)(testLogger\.step\('Setting up user'\)\s+testMocks\.addUser\(mockUser\)\s+)(\s+)(testLogger\.step\('\w+'\))/g;

    content = content.replace(simpleUserSetupPattern, (match, indent1, setup, indent2, nextStep) => {
        return `${indent1}${setup}
            // Устанавливаем пользователя в store перед вызовом
            await act(async () => {
                result.current.setUser(mockUser)
            })
            
            // Ждем, пока пользователь установится
            await testUtils.waitForCondition(() => result.current.user !== null)
${indent2}${nextStep}`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`✅ Файл исправлен: ${filePath}`);
}

// Основная функция
function main() {
    const testFiles = [
        'tests/unit/tasks-store-dependency-injection.test.ts',
        'tests/unit/tasks-store-migrated.test.ts'
    ];

    testFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            fixTestFile(filePath);
        } else {
            console.log(`❌ Файл не найден: ${filePath}`);
        }
    });

    console.log('🎉 Все тесты исправлены!');
}

main();
