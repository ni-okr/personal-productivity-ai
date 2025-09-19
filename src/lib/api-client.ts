// 🌐 API клиент с автоматической авторизацией
'use client'

import { supabase } from './supabase'

/**
 * Получение JWT токена из Supabase
 */
export async function getAuthToken(): Promise<string | null> {
    try {
        // В mock режиме возвращаем null
        if (process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true') {
            return null
        }

        const { data: { session } } = await supabase.auth.getSession()

        return session?.access_token || null
    } catch (error) {
        console.error('Ошибка получения токена:', error)
        return null
    }
}

/**
 * Выполнение API запроса с автоматической авторизацией
 */
export async function apiRequest(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = await getAuthToken()

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    }

    // Добавляем JWT токен если есть
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    return fetch(url, {
        ...options,
        headers,
    })
}

/**
 * Выполнение GET запроса с авторизацией
 */
export async function apiGet(url: string): Promise<Response> {
    return apiRequest(url, { method: 'GET' })
}

/**
 * Выполнение POST запроса с авторизацией
 */
export async function apiPost(url: string, data?: any): Promise<Response> {
    return apiRequest(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    })
}

/**
 * Выполнение PUT запроса с авторизацией
 */
export async function apiPut(url: string, data?: any): Promise<Response> {
    return apiRequest(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    })
}

/**
 * Выполнение DELETE запроса с авторизацией
 */
export async function apiDelete(url: string): Promise<Response> {
    return apiRequest(url, { method: 'DELETE' })
}
