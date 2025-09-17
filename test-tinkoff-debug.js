// 🔍 Тест для отладки Тинькофф API
const crypto = require('crypto');

// Тестовые данные
const terminalKey = 'TestTerminalKey';
const secretKey = 'usaf8fw8fsw21g';

// Данные запроса
const requestData = {
    TerminalKey: terminalKey,
    Amount: 99900, // 999 рублей в копейках
    OrderId: 'test_123',
    Description: 'Тест Premium',
    CustomerKey: 'test_customer',
    PayType: 'T',
    Language: 'ru',
    Email: 'test@taskai.space',
    NotificationURL: 'https://taskai.space/api/tinkoff/webhook',
    SuccessURL: 'https://taskai.space/planner?payment=success',
    FailURL: 'https://taskai.space/planner?payment=failed',
    Receipt: {
        EmailCompany: 'support@taskai.space',
        Taxation: 'usn_income',
        Items: [{
            Name: 'Тест Premium',
            Price: 99900,
            Quantity: 1,
            Amount: 99900,
            Tax: 'vat20'
        }]
    }
};

// Генерация токена
function generateToken(data) {
    const pairs = Object.keys(data)
        .filter(key => key !== 'Token')
        .map(key => ({
            key,
            value: String(data[key])
        }));

    pairs.push({ key: 'Password', value: secretKey });
    pairs.sort((a, b) => a.key.localeCompare(b.key));
    
    const tokenString = pairs.map(pair => pair.value).join('');
    console.log('🔐 Токен строка:', tokenString.substring(0, 100) + '...');
    
    return crypto.createHash('sha256').update(tokenString, 'utf8').digest('hex');
}

const token = generateToken(requestData);
console.log('🔐 Сгенерированный токен:', token);

// Отправка запроса
const payload = {
    ...requestData,
    Token: token
};

console.log('📤 Отправляемые данные:');
console.log(JSON.stringify(payload, null, 2));

// Проверяем, есть ли Email в корне
console.log('📧 Email в корне:', payload.Email);
console.log('📧 Email в Receipt:', payload.Receipt?.Email);
