import '@testing-library/jest-dom';

// Полифилл для fetch в тестах
global.fetch = require('node-fetch');

