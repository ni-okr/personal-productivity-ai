'use client'

import React from 'react'

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        // В продакшене можно отправлять ошибки в сервис мониторинга
        if (process.env.NODE_ENV === 'production') {
            // TODO: Отправить в Sentry или другой сервис
            // sendErrorToService(error, errorInfo)
        }
    }

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback

            return (
                <FallbackComponent
                    error={this.state.error!}
                    reset={() => this.setState({ hasError: false, error: undefined })}
                />
            )
        }

        return this.props.children
    }
}

// Компонент по умолчанию для отображения ошибок
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Что-то пошло не так
                </h2>

                <p className="text-gray-600 mb-6">
                    Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <details className="text-left mb-4 p-3 bg-gray-100 rounded text-sm">
                        <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                            Детали ошибки (только в разработке)
                        </summary>
                        <pre className="whitespace-pre-wrap text-red-600 text-xs">
                            {error.message}
                            {error.stack && '\n\n' + error.stack}
                        </pre>
                    </details>
                )}

                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Попробовать снова
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Вернуться на главную
                    </button>
                </div>
            </div>
        </div>
    )
}

// HOC для оборачивания компонентов в ErrorBoundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    )

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

    return WrappedComponent
}
