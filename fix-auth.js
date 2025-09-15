const fs = require('fs');

// Читаем файл
let content = fs.readFileSync('src/lib/auth.ts', 'utf8');

// Заменяем все вхождения supabase. на getSupabaseClient() + supabase.
const functions = [
    'signIn',
    'signOut',
    'resetPassword',
    'getCurrentUser',
    'verifyEmail',
    'updateProfile',
    'onAuthStateChange',
    'signInWithOAuth'
];

functions.forEach(funcName => {
    // Находим функцию и добавляем getSupabaseClient() в начало try блока
    const funcRegex = new RegExp(`(export async function ${funcName}\\([^}]+}\\): [^{]+\\{[^}]*try \\{[^}]*)(await supabase\\.)`, 'g');
    content = content.replace(funcRegex, '$1const supabase = getSupabaseClient()\n        \n        $2');
});

// Записываем обратно
fs.writeFileSync('src/lib/auth.ts', content);
console.log('Auth.ts обновлен!');
