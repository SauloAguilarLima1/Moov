import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'

const INTERVAL = 60 // segundos entre reenvios automáticos

export function ConfirmPending({ email, onBack }: { email: string; onBack: () => void }) {
  const { resendConfirmation } = useAuth()
  const [seconds, setSeconds] = useState(INTERVAL)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [autoCount, setAutoCount] = useState(0)

  // refs p/ o interval enxergar sempre o estado/handler atuais (sem closure velha)
  const sendingRef = useRef(false)
  const secondsRef = useRef(INTERVAL)
  const resendRef = useRef<(auto: boolean) => void>(() => {})

  async function doResend(auto: boolean) {
    if (sendingRef.current) return
    sendingRef.current = true
    setSending(true); setError(''); setMsg('')
    try {
      await resendConfirmation(email)
      setMsg(auto
        ? 'Reenviamos um novo e-mail automaticamente. Confira a caixa de entrada e o spam.'
        : 'E-mail reenviado! Confira a caixa de entrada e o spam.')
      if (auto) setAutoCount((c) => c + 1)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      sendingRef.current = false
      setSending(false)
      secondsRef.current = INTERVAL
      setSeconds(INTERVAL)
    }
  }
  resendRef.current = doResend

  // cronômetro: conta 60s e dispara o reenvio automático
  useEffect(() => {
    const id = setInterval(() => {
      secondsRef.current -= 1
      if (secondsRef.current <= 0) {
        secondsRef.current = INTERVAL
        resendRef.current(true)
      }
      setSeconds(secondsRef.current)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const mm = Math.floor(seconds / 60)
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="confirm-pending">
      <div className="cp-icon" aria-hidden>📩</div>
      <h2 className="t-h1" style={{ textAlign: 'center' }}>Confirme seu e-mail</h2>
      <p className="t-body muted cp-text">
        Enviamos um link de confirmação para<br />
        <strong style={{ color: 'var(--ink)' }}>{email}</strong>.<br />
        Clique no link do e-mail para ativar sua conta. Não esqueça de olhar o <strong>spam</strong>.
      </p>

      <div className="cp-timer">
        <span className="cp-timer-label">Reenvio automático em</span>
        <span className="cp-timer-val tnum">{mm}:{ss}</span>
      </div>

      <Button block loading={sending} onClick={() => doResend(false)}>
        Reenviar e-mail agora
      </Button>

      {msg && <p className="auth-info" style={{ marginTop: 'var(--s-md)', marginBottom: 0 }}>{msg}</p>}
      {error && <p className="field-error" style={{ marginTop: 'var(--s-md)' }}>{error}</p>}
      {autoCount > 0 && <p className="t-caption cp-count">Reenviado automaticamente {autoCount}x nesta tela.</p>}

      <div className="cp-foot">
        <button className="link-btn" onClick={onBack}>Já confirmei — Entrar</button>
      </div>
    </div>
  )
}
