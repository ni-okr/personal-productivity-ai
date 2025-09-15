#!/bin/bash

echo "🔧 Автоматическое исправление тестов..."

# Исправляем auth-components.test.tsx
echo "📝 Исправляем auth-components.test.tsx..."

# Заменяем все локальные моки на глобальные
sed -i 's/const mockSignIn = jest\.fn()\.mockResolvedValue(/mockSignIn.mockResolvedValue(/g' tests/unit/auth-components.test.tsx
sed -i 's/const mockSignUp = jest\.fn()\.mockResolvedValue(/mockSignUp.mockResolvedValue(/g' tests/unit/auth-components.test.tsx
sed -i 's/const mockResetPassword = jest\.fn()\.mockResolvedValue(/mockResetPassword.mockResolvedValue(/g' tests/unit/auth-components.test.tsx

# Удаляем строки с jest.mocked
sed -i '/jest\.mocked.*import.*auth.*signIn/d' tests/unit/auth-components.test.tsx
sed -i '/jest\.mocked.*import.*auth.*signUp/d' tests/unit/auth-components.test.tsx
sed -i '/jest\.mocked.*import.*auth.*resetPassword/d' tests/unit/auth-components.test.tsx

echo "✅ Исправления применены!"

# Запускаем тесты
echo "🧪 Запускаем тесты..."
npm test -- --testPathPattern=auth-components.test.tsx --verbose
