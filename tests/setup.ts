import '@testing-library/jest-dom';

// Полифилл для fetch в тестах
global.fetch = require('node-fetch');

// Константы для тестов
export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

// Mock для console.log в тестах
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Отключаем логи в тестах, кроме ошибок
beforeAll(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    // Оставляем console.error для отладки
});

afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});

// Mock для window.location
Object.defineProperty(window, 'location', {
    value: {
        href: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn()
    },
    writable: true
});

// Mock для window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock для IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

// Mock для ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

