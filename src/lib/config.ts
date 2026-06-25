// Credenciais do Supabase do projeto "Moov".
// A chave abaixo é a "anon key" — PÚBLICA por design: pode ir no bundle do site.
// A segurança real vem da Row Level Security (RLS) no banco: cada usuário só
// lê/escreve as próprias linhas. Em dev você pode sobrescrever via .env
// (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://noqfyxymskgitkxumoef.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcWZ5eHltc2tnaXRreHVtb2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTA2NTksImV4cCI6MjA5Nzk4NjY1OX0.ky4EKKYyAqEWe-oWgyVW2KBK-7nHv6gY_93z-fbY7CA'
