import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function ManageHeader({ title, onAdd, addLabel = 'Novo' }: { title: string; onAdd: () => void; addLabel?: string }) {
  const navigate = useNavigate()
  return (
    <header className="manage-head">
      <button className="back-btn" onClick={() => navigate('/app/profile')} aria-label="Voltar">‹</button>
      <h1 className="t-h1">{title}</h1>
      <Button className="btn-sm" onClick={onAdd}>+ {addLabel}</Button>
    </header>
  )
}
