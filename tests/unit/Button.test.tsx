import { testUtils } from '../framework'

/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.028Z
 * Оригинальный файл сохранен как: tests/unit/Button.test.tsx.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

import { Button } from '@/components/ui/Button'
import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'

describe('Button Component', () => {
    test('рендерится с текстом', () => {
        testUtils.renderWithProviders(<Button>Тестовая кнопка</Button>)
        expect(screen.getByText('Тестовая кнопка')).toBeTruthy()
    })

    test('обрабатывает клики', () => {
        const handleClick = jest.fn()
        testUtils.renderWithProviders(<Button onClick={handleClick}>Кликни меня</Button>)

        fireEvent.click(screen.getByText('Кликни меня'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('показывает состояние загрузки', () => {
        testUtils.renderWithProviders(<Button isLoading>Загружается</Button>)

        // Кнопка должна быть отключена
        expect(screen.getByRole('button')).toBeDisabled()

        // Должен быть спиннер
        expect(document.querySelector('.animate-spin')).toBeTruthy()
    })

    test('применяет правильные варианты стилей', () => {
        const { rerender } = testUtils.renderWithProviders(<Button variant="primary">Primary</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-indigo-600')

        rerender(<Button variant="secondary">Secondary</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-gray-100')

        rerender(<Button variant="danger">Danger</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-red-600')
    })

    test('применяет правильные размеры', () => {
        const { rerender } = testUtils.renderWithProviders(<Button size="sm">Small</Button>)
        expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5')

        rerender(<Button size="md">Medium</Button>)
        expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2')

        rerender(<Button size="lg">Large</Button>)
        expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3')
    })

    test('отключается при disabled', () => {
        testUtils.renderWithProviders(<Button disabled>Отключена</Button>)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    test('показывает иконки', () => {
        const leftIcon = <span data-testid="left-icon">←</span>
        const rightIcon = <span data-testid="right-icon">→</span>

        testUtils.renderWithProviders(
            <Button leftIcon={leftIcon} rightIcon={rightIcon}>
                С иконками
            </Button>
        )

        expect(screen.getByTestId('left-icon')).toBeTruthy()
        expect(screen.getByTestId('right-icon')).toBeTruthy()
    })
})
