import { expect, test } from '@playwright/test'

test.describe('Personal Productivity AI - Лендинг страница', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test.describe('📧 Email подписка', () => {

        test('✅ Успешная первая регистрация', async ({ page }) => {
