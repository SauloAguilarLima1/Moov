import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'

type Mode = 'login' | 'signup'

export function Landing() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
      } else {
        const { needsConfirmation } = await signUp(name.trim(), email.trim(), password)
        if (needsConfirmation) {
          setInfo('Conta criada! Enviamos um e-mail de confirmação — confirme e depois entre.')
          setMode('login')
        }
      }
      // Em caso de sucesso com sessão, o redirect acontece pelo guard de rota.
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      {/* HERO */}
      <section className="landing-hero">
        <div className="brand brand-lg">
          <span className="brand-mark">M</span>
          <span className="brand-name">Moov</span>
        </div>
        <h1 className="hero-title">Suas finanças,<br />em movimento.</h1>
        <p className="hero-sub">
          Controle contas, cartões, fluxo de caixa e relatórios num só lugar — simples,
          rápido e com seus dados protegidos e separados só para você.
        </p>
        <ul className="hero-bullets">
          <li><span>📊</span> Dashboard com saldo geral e contas</li>
          <li><span>🔁</span> Receitas, despesas e transferências</li>
          <li><span>🏷️</span> Categorias, tags e relatórios visuais</li>
        </ul>
      </section>

      {/* AUTH CARD */}
      <section className="landing-auth">
        <div className="auth-card card">
          <div className="segmented" style={{ marginBottom: 'var(--s-xl)' }}>
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setInfo('') }}>Entrar</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); setInfo('') }}>Criar conta</button>
          </div>

          <form onSubmit={submit}>
            {mode === 'signup' && (
              <div className="field">
                <label className="label" htmlFor="name">Nome</label>
                <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te chamar?" autoComplete="name" required />
              </div>
            )}
            <div className="field">
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com" autoComplete="email" required />
            </div>
            <div className="field">
              <label className="label" htmlFor="password">Senha</label>
              <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6} required />
            </div>

            {error && <p className="field-error" style={{ marginBottom: 'var(--s-md)' }}>{error}</p>}
            {info && <p className="auth-info">{info}</p>}

            <Button type="submit" block loading={loading}>
              {mode === 'login' ? 'Entrar' : 'Criar minha conta'}
            </Button>
          </form>

          <p className="auth-foot t-caption">
            {mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <button className="link-btn" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo('') }}>
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
        <p className="auth-secure t-caption">🔒 Seus dados ficam isolados por usuário (RLS no Supabase).</p>
      </section>
    </div>
  )
}
