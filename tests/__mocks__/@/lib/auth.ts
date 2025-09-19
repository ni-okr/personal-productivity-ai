// 🧪 Mock для auth функций

export const signUp = jest.fn(async ({ email, password, name }) => ({
  success: true,
  user: { id: 'test-user-id', email, name: name ?? 'Test User' },
  message: 'Регистрация успешна'
}))

export const signIn = jest.fn(async ({ email, password }) => ({
  success: true,
  user: { id: 'test-user-id', email, name: 'Test User', subscription: 'free', createdAt: new Date(), lastLoginAt: new Date() },
  message: 'Вход выполнен'
}))

export const signOut = jest.fn(async () => ({
  success: true,
  message: 'Выход выполнен'
}))

export const resetPassword = jest.fn(async () => ({
  success: true,
  message: 'Письмо отправлено'
}))

export const updatePassword = jest.fn(async () => ({
  success: true,
  message: 'Пароль обновлен'
}))

export const confirmEmail = jest.fn(async (token) => {
  if (typeof token === 'string' && token.includes('invalid')) {
    return { success: false, error: 'Неверные учетные данные' }
  }
  return { success: true, message: 'Email успешно подтвержден!' }
})

export const signInWithGoogle = jest.fn(async () => ({
  success: true,
  message: 'Перенаправление на Google...'
}))

export const signInWithGitHub = jest.fn(async () => ({
  success: true,
  message: 'Перенаправление на GitHub...'
}))

export const getUserProfile = jest.fn(async (userId) => {
  if (userId === 'test-user-id') {
    return { id: userId, email: 'test@taskai.space', name: 'Test User', subscription: 'free', createdAt: new Date(), lastLoginAt: new Date() }
  }
  return null
})

export const getCurrentUser = jest.fn(async () => null)

export const getCurrentUserFromRequest = jest.fn(async () => null)

export const updateUserProfile = jest.fn(async (userId, updates) => ({
  success: true,
  message: 'Профиль успешно обновлен',
  user: { id: userId, email: 'test@taskai.space', name: updates.name || 'Test User', subscription: updates.subscription || 'free', createdAt: new Date(), lastLoginAt: new Date() }
}))
