const fs = require('fs');
const path = require('path');

const filesToFix = [
    'tests/unit/tasks-store-migrated.test.ts',
];

filesToFix.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Pattern to find test blocks where user setup is missing
    const testBlockPattern = /(test\(['"].*?['"],\s*(?:async)?\s*=>\s*{[\s\S]*?)(testLogger\.step\(['"]Setting user['"]\)\s*await act\(async \(\) => \{\s*result\.current\.setUser\(mockUser\)\s*\}\)\s*)(testLogger\.step\(['"]Attempting to)/g;

    content = content.replace(testBlockPattern, (match, p1, p2, p3) => {
        if (!p1.includes('await testUtils.waitForCondition(() => result.current.user !== null)')) {
            return `${p1}${p2}await testUtils.waitForCondition(() => result.current.user !== null)\n\n            ${p3}`;
        }
        return match;
    });

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ Файл исправлен: ${file}`);
    } else {
        console.log(`ℹ️ В файле не найдено изменений: ${file}`);
    }
});

console.log('🎉 Все тесты исправлены!');
