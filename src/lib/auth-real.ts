// 🔐 Реализация функций авторизации (auth-real.ts)
import { User } from '@/types'
import { validateEmail, validateName } from '@/utils/validation'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  subscription: 'free' | 'premium' | 'pro'
  createdAt: Date
  lastLoginAt: Date
}

export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
  message?: string
}

/** Регистрация нового пользователя */
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
  // Валидация email
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) return { success: false, error: emailValidation.errors[0] }
  // Валидация пароля
  if (!password || password.length < 6) return { success: false, error: 'Пароль должен содержать минимум 6 символов' }
  // Валидация имени
  const nameValidation = validateName(name)
  if (!nameValidation.isValid) return { success: false, error: nameValidation.errors[0] }

  const { error: signupError, data } = await supabase.auth.signUp({ email, password })
  if (signupError) return { success: false, error: signupError.message }
  return { success: true, user: data.user, message: 'Регистрация успешна' }
}

/** Вход пользователя */
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) return { success: false, error: emailValidation.errors[0] }
  if (!password) return { success: false, error: 'Пароль обязателен' }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  if (!data.user) return { success: false, error: 'Не удалось войти в систему' }

  await (supabase as any)
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.user.id)

  const profile = await getUserProfile(data.user.id)
  return { success: true, user: profile.user, message: 'Вход выполнен' }
}

/** Выход пользователя */
export async function signOut(): Promise<AuthResponse> {
  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, error: error.message }
  return { success: true, message: 'Вы успешно вышли из системы' }
}

/** Получение профиля пользователя */
export async function getUserProfile(userId: string): Promise<AuthResponse> {
  const { data, error } = await (supabase as any)
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return { success: false, error: 'Профиль не найден' }
  return { success: true, user: { ...data, createdAt: new Date(data.created_at), updatedAt: new Date(data.updated_at || data.created_at) } }
}

/** Обновление профиля пользователя */
export async function updateUserProfile(userId: string, updates: Partial<Pick<AuthUser, 'name' | 'subscription'>>): Promise<AuthResponse> {
  const { data, error } = await (supabase as any)
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, user: { ...data, createdAt: new Date(data.created_at), updatedAt: new Date(data.updated_at || data.created_at) }, message: 'Профиль успешно обновлен' }
}

/** Подтверждение email */
export async function confirmEmail(token: string): Promise<AuthResponse> {
  // Заглушка
  return { success: false, error: 'Неверные учетные данные' }
}

/** Обновление пароля */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { success: false, error: error.message }
  return { success: true, message: 'Пароль успешно обновлен' }
}

/** Вход через Google */
export async function signInWithGoogle(): Promise<AuthResponse> {
  return { success: false, error: 'Google OAuth временно недоступен. Используйте вход по email/паролю.' }
}

/** Вход через GitHub */
export async function signInWithGitHub(): Promise<AuthResponse> {
  return { success: false, error: 'GitHub OAuth временно недоступен.' }
}
