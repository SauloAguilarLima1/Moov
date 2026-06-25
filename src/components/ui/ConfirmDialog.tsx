import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Excluir', onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  async function handle() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="t-body muted" style={{ marginBottom: 'var(--s-xl)' }}>{message}</p>
      <div className="row gap-md" style={{ justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" loading={loading} onClick={handle}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
