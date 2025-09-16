import '@testing-library/jest-dom';

// Полифилл для fetch в тестах
global.fetch = require('node-fetch');

// Константы для тестов
export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

