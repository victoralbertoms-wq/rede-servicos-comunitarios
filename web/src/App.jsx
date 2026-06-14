import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import Communities from './pages/communities/Communities'
import CommunityDetail from './pages/communities/CommunityDetail'
import CommunityCreate from './pages/communities/CommunityCreate'
import CommunityEdit from './pages/communities/CommunityEdit'
import Services from './pages/services/Services'
import ServiceDetail from './pages/services/ServiceDetail'
import ServiceCreate from './pages/services/ServiceCreate'
import ServiceEdit from './pages/services/ServiceEdit'
import Companies from './pages/companies/Companies'
import CompanyDetail from './pages/companies/CompanyDetail'
import CompanyCreate from './pages/companies/CompanyCreate'
import CompanyEdit from './pages/companies/CompanyEdit'
import Favorites from './pages/favorites/Favorites'
import Messages from './pages/messages/Messages'
import Profile from './pages/profile/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCommunities from './pages/admin/AdminCommunities'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, userProfile, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (userProfile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/esqueci-senha" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Protected */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/comunidades" element={<Communities />} />
        <Route path="/comunidades/nova" element={<AdminRoute><CommunityCreate /></AdminRoute>} />
        <Route path="/comunidades/:id" element={<CommunityDetail />} />
        <Route path="/comunidades/:id/editar" element={<CommunityEdit />} />
        <Route path="/servicos" element={<Services />} />
        <Route path="/servicos/novo" element={<ServiceCreate />} />
        <Route path="/servicos/:id" element={<ServiceDetail />} />
        <Route path="/servicos/:id/editar" element={<ServiceEdit />} />
        <Route path="/empresas" element={<Companies />} />
        <Route path="/empresas/nova" element={<CompanyCreate />} />
        <Route path="/empresas/:id" element={<CompanyDetail />} />
        <Route path="/empresas/:id/editar" element={<CompanyEdit />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/mensagens" element={<Messages />} />
        <Route path="/mensagens/:chatId" element={<Messages />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/usuarios" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/comunidades" element={<AdminRoute><AdminCommunities /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
