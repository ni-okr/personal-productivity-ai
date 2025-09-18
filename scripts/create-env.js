#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Функция для получения секрета из pass
function getSecret(passPath) {
  try {
    const result = execSync(`pass show ${passPath}`, { encoding: 'utf8' });
    return result.trim();
  } catch {
    return null;
  }
}

// Пути к секретам в pass
const secretsList = {
  NEXT_PUBLIC_SUPABASE_URL: 'personal-productivity-ai/supabase/url',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'personal-productivity-ai/supabase/anon-key',
  TINKOFF_TERMINAL_KEY_TEST: 'personal-productivity-ai/tinkoff/terminal-key-test',
  TINKOFF_SECRET_KEY_TEST: 'personal-productivity-ai/tinkoff/secret-key-test',
  TINKOFF_TERMINAL_KEY_LIVE: 'personal-productivity-ai/tinkoff/terminal-key-live',
  TINKOFF_SECRET_KEY_LIVE: 'personal-productivity-ai/tinkoff/secret-key-live'
};

// Формируем объект секретов
const secrets = {};
for (const [key, passPath] of Object.entries(secretsList)) {
  const value = getSecret(passPath) || process.env[key];
  if (!value) {
    console.warn(`⚠️ Секрет ${key} не получен`);
  }
  secrets[key] = value || '';
}

// Значения по умолчанию
secrets.TINKOFF_TERMINAL_KEY = secrets.TINKOFF_TERMINAL_KEY_TEST;
secrets.TINKOFF_SECRET_KEY = secrets.TINKOFF_SECRET_KEY_TEST;

// Записываем .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const content = Object.entries(secrets)
  .map(([k, v]) => `${k}=${v}`)
  .join('\n');
fs.writeFileSync(envLocalPath, content, 'utf8');
console.log(`✅ .env.local создан: ${envLocalPath}`);
// Записываем аналогично в .env для Vercel
const envPath = path.resolve(process.cwd(), '.env');
fs.writeFileSync(envPath, content, 'utf8');
console.log(`✅ .env создан: ${envPath}`);
