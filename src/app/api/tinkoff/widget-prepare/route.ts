// ☑️ Подготовка данных для платежной формы/виджета Т‑Кассы (без обращения к /Init)
// Сервер рассчитывает Token и возвращает набор полей, которые клиент отправит
// на https://securepay.tinkoff.ru/html/payForm/index.html методом POST

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

function generateToken(payload: Record<string, any>, secretKey: string): string {
  // В Token не входят Token/Receipt/DATA и любые объектные поля
  const EXCLUDE = new Set(['Token', 'Receipt', 'DATA'])
  const pairs = Object.keys(payload)
    .filter((k) => !EXCLUDE.has(k))
    .filter((k) => payload[k] !== undefined && payload[k] !== null)
    .filter((k) => typeof payload[k] !== 'object')
    .map((k) => ({ key: k, value: String(payload[k]) }))

  pairs.push({ key: 'Password', value: secretKey })
  pairs.sort((a, b) => a.key.localeCompare(b.key))
  const concat = pairs.map((p) => p.value).join('')
  return sha256(concat)
}

export async function POST(request: NextRequest) {
  try {
    const { amount, description, planId } = await request.json()

    const isTest = (process.env.TINKOFF_ENV || 'test') === 'test'
    const terminalKey = process.env.TINKOFF_TERMINAL_KEY_TEST || process.env.TINKOFF_TERMINAL_KEY || ''
    const secretKey = process.env.TINKOFF_SECRET_KEY_TEST || process.env.TINKOFF_SECRET_KEY || ''

    if (!terminalKey || !secretKey) {
      return NextResponse.json({ success: false, error: 'Нет ключей терминала' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://preview.taskai.space'
    const orderId = `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const amountCents = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0

    // Поля формы (минимально достаточный набор)
    const fields: Record<string, any> = {
      TerminalKey: terminalKey,
      Amount: amountCents, // в копейках
      OrderId: orderId,
      Description: description || 'Оплата',
      Frame: 'Y',
      Language: 'ru',
      SuccessURL: `${appUrl.replace(/\/$/, '')}/planner?payment=success&plan=${planId || ''}`,
      FailURL: `${appUrl.replace(/\/$/, '')}/planner?payment=failed&plan=${planId || ''}`,
      NotificationURL: `${appUrl.replace(/\/$/, '')}/api/tinkoff/webhook`,
      DATA: JSON.stringify({ connection_type: 'integrationjs' })
    }

    const token = generateToken(fields, secretKey)
    const actionUrl = 'https://securepay.tinkoff.ru/html/payForm/index.html'

    return NextResponse.json({ success: true, data: { actionUrl, fields: { ...fields, Token: token } } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Ошибка подготовки данных' }, { status: 500 })
  }
}


