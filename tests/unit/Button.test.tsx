import { Button } from '@/components/ui/Button'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

describe('Button Component', () => {
    test('рендерится с текстом', () => {
        render(<Button>Тестовая кнопка</Button>)
        expect(screen.getByText('Тестовая кнопка')).toBeInTheDocument()
    })

    test('обрабатывает клики', () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Кликни меня</Button>)

        fireEvent.click(screen.getByText('Кликни меня'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('показывает состояние загрузки', () => {
        render(<Button isLoading>Загружается</Button>)

        // Кнопка должна быть отключена
        expect(screen.getByRole('button')).toBeDisabled()

        // Должен быть спиннер
        expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    test('применяет правильные варианты стилей', () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-indigo-600')

        rerender(<Button variant="secondary">Secondary</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-gray-100')

        rerender(<Button variant="danger">Danger</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-red-600')
    })

    test('применяет правильные размеры', () => {
        const { rerender } = render(<Button size="sm">Small</Button>)
        expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5')

        rerender(<Button size="md">Medium</Button>)
        expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2')

        rerender(<Button size="lg">Large</Button>)
        expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3')
    })

    test('отключается при disabled', () => {
        render(<Button disabled>Отключена</Button>)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    test('показывает иконки', () => {
        const leftIcon = <span data-testid="left-icon">←</span>
        const rightIcon = <span data-testid="right-icon">→</span>

        render(
            <Button leftIcon={leftIcon} rightIcon={rightIcon}>
                С иконками
            </Button>
        )

        expect(screen.getByTestId('left-icon')).toBeInTheDocument()
        expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
})
