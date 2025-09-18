// 🔌 Клиент Supabase
import { createClient } from '@supabase/supabase-js'

// Создаём клиент с использованием переменных окружения
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)
