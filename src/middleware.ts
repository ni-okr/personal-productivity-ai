import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Защищенные маршруты, требующие авторизации
const protectedRoutes = [
    '/planner',
    '/dashboard',
    '/profile',
    '/settings',
    '/tasks',
    '/analytics'
]

// Публичные маршруты, доступные только неавторизованным пользователям
const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/confirm-email'
]

// Маршруты, которые всегда доступны
const publicRoutes = [
    '/',
    '/about',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms'
]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Получаем токен из cookies
    const token = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value
    
    // Проверяем, авторизован ли пользователь
    const isAuthenticated = !!(token || refreshToken)
    
    // Проверяем, является ли маршрут защищенным
    const isProtectedRoute = protectedRoutes.some(route => 
        pathname.startsWith(route)
    )
    
    // Проверяем, является ли маршрут только для неавторизованных
    const isAuthRoute = authRoutes.some(route => 
        pathname.startsWith(route)
    )
    
    // Проверяем, является ли маршрут публичным
    const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
    )

    // Если пользователь не авторизован и пытается попасть на защищенный маршрут
    if (!isAuthenticated && isProtectedRoute) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Если пользователь авторизован и пытается попасть на страницы авторизации
    if (isAuthenticated && isAuthRoute) {
        const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/planner'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Если маршрут не найден в категориях, разрешаем доступ
    if (!isProtectedRoute && !isAuthRoute && !isPublicRoute) {
        return NextResponse.next()
    }

    // Разрешаем доступ к публичным маршрутам
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Разрешаем доступ к защищенным маршрутам для авторизованных пользователей
    if (isAuthenticated && isProtectedRoute) {
        return NextResponse.next()
    }

    // Разрешаем доступ к страницам авторизации для неавторизованных пользователей
    if (!isAuthenticated && isAuthRoute) {
        return NextResponse.next()
    }

    // По умолчанию разрешаем доступ
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}
