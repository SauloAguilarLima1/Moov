import type { ReactElement } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { AppShell } from './components/AppShell'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Cashflow } from './pages/Cashflow'
import { Reports } from './pages/Reports'
import { Profile } from './pages/Profile'
import { AccountsPage } from './pages/manage/AccountsPage'
import { CardsPage } from './pages/manage/CardsPage'
import { CategoriesPage } from './pages/manage/CategoriesPage'
import { TagsPage } from './pages/manage/TagsPage'

function Splash() {
  return (
    <div className="splash">
      <div className="brand brand-lg"><span className="brand-mark">M</span><span className="brand-name">Moov</span></div>
      <div className="spinner spinner-dark" />
    </div>
  )
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth()
  if (loading) return <Splash />
  if (!session) return <Navigate to="/" replace />
  return children
}

function PublicOnly({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth()
  if (loading) return <Splash />
  if (session) return <Navigate to="/app" replace />
  return children
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PublicOnly><Landing /></PublicOnly>} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <DataProvider>
                <AppShell />
              </DataProvider>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="cashflow" element={<Cashflow />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="cards" element={<CardsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="tags" element={<TagsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
