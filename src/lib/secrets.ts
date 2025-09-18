/**
 * 🔐 Утилиты для работы с секретами проекта
 * Интеграция с pass (Password Store) для безопасного хранения секретов
 */

import { execSync } from 'child_process';

/**
 * Получить секрет из pass
 * @param path - путь к секрету в pass (например: 'personal-productivity-ai/supabase/url')
 * @returns значение секрета или null если не найден
 */
export function getSecret(path: string): string | null {
    try {
        const result = execSync(`pass show ${path}`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
        });
        return result.trim();
    } catch (error) {
        console.warn(`⚠️ Не удалось получить секрет ${path}:`, error);
        return null;
    }
}

/**
 * Получить все секреты проекта
 * @returns объект с секретами или null если не удалось загрузить
 */
export function getAllSecrets(): Record<string, string> | null {
    try {
        const secrets = {
            NEXT_PUBLIC_SUPABASE_URL: getSecret('personal-productivity-ai/supabase/url'),
            NEXT_PUBLIC_SUPABASE_ANON_KEY: getSecret('personal-productivity-ai/supabase/anon-key'),
            TINKOFF_TERMINAL_KEY_TEST: getSecret('personal-productivity-ai/tinkoff/terminal-key-test'),
            TINKOFF_SECRET_KEY_TEST: getSecret('personal-productivity-ai/tinkoff/secret-key-test'),
            TINKOFF_TERMINAL_KEY_LIVE: getSecret('personal-productivity-ai/tinkoff/terminal-key-live'),
            TINKOFF_SECRET_KEY_LIVE: getSecret('personal-productivity-ai/tinkoff/secret-key-live'),
        };

        // Проверяем, что все секреты загружены
        const missingSecrets = Object.entries(secrets)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingSecrets.length > 0) {
            console.warn(`⚠️ Не удалось загрузить секреты: ${missingSecrets.join(', ')}`);
            return null;
        }

        // Добавляем значения по умолчанию
        return {
            ...secrets,
            TINKOFF_TERMINAL_KEY: secrets.TINKOFF_TERMINAL_KEY_TEST,
            TINKOFF_SECRET_KEY: secrets.TINKOFF_SECRET_KEY_TEST,
        };
    } catch (error) {
        console.error('❌ Ошибка загрузки секретов:', error);
        return null;
    }
}

/**
 * Проверить, что pass установлен и инициализирован
 * @returns true если pass готов к работе
 */
export function isPassReady(): boolean {
    try {
        execSync('pass ls', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Получить список всех секретов проекта
 * @returns массив путей к секретам
 */
export function listSecrets(): string[] {
    try {
        const result = execSync('pass ls personal-productivity-ai', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
        });

        return result
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('personal-productivity-ai'))
            .map(line => line.trim().replace(/^├── |└── /, ''))
            .map(secret => `personal-productivity-ai/${secret}`);
    } catch (error) {
        console.warn('⚠️ Не удалось получить список секретов:', error);
        return [];
    }
}

/**
 * Создать .env.local файл из секретов pass
 * @param outputPath - путь для сохранения .env.local (по умолчанию: .env.local)
 */
export function createEnvFromPass(outputPath: string = '.env.local'): void {
    const secrets = getAllSecrets();
    if (!secrets) {
        throw new Error('Не удалось загрузить секреты из pass');
    }

    const envContent = Object.entries(secrets)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    require('fs').writeFileSync(outputPath, envContent);
    console.log(`✅ .env.local создан из секретов pass: ${outputPath}`);
}

// Экспортируем типы для TypeScript
export type Secrets = {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    TINKOFF_TERMINAL_KEY_TEST: string;
    TINKOFF_SECRET_KEY_TEST: string;
    TINKOFF_TERMINAL_KEY_LIVE: string;
    TINKOFF_SECRET_KEY_LIVE: string;
    TINKOFF_TERMINAL_KEY: string;
    TINKOFF_SECRET_KEY: string;
};
