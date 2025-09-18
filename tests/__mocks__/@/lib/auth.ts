/**
 * Mock для auth функций
 */

// Создаем mock функции с правильной типизацией
const createMockFunction = (defaultValue: any) => {
    const mockFn = jest.fn()
    mockFn.mockResolvedValue = jest.fn().mockReturnValue(mockFn)
    mockFn.mockRejectedValue = jest.fn().mockReturnValue(mockFn)
    mockFn.mockImplementation = jest.fn().mockReturnValue(mockFn)
    mockFn.mockReturnValue = jest.fn().mockReturnValue(mockFn)
    mockFn.mockResolvedValue(defaultValue)
    return mockFn
}

export const signUp = createMockFunction({ success: true, message: 'Регистрация успешна' })
export const signIn = createMockFunction({ success: true, message: 'Вход выполнен' })
export const signOut = createMockFunction({ success: true, message: 'Выход выполнен' })
export const resetPassword = createMockFunction({ success: true, message: 'Письмо отправлено' })
export const updatePassword = createMockFunction({ success: true, message: 'Пароль обновлен' })
export const confirmEmail = createMockFunction({ success: true, message: 'Email подтвержден' })
export const signInWithGoogle = createMockFunction({ success: true, message: 'Вход через Google выполнен' })
export const signInWithGitHub = createMockFunction({ success: true, message: 'Вход через GitHub выполнен' })
export const getCurrentUser = createMockFunction(null)
export const getUserProfile = createMockFunction(null)
export const getCurrentUserFromRequest = createMockFunction(null)
