import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  HiHome, HiUserGroup, HiBriefcase, HiOfficeBuilding,
  HiHeart, HiChat, HiUser, HiCog, HiShieldCheck, HiLogout
} from 'react-icons/hi'

const navItems = [
  { to: '/', icon: HiHome, label: 'Início' },
  { to: '/comunidades', icon: HiUserGroup, label: 'Comunidades' },
  { to: '/servicos', icon: HiBriefcase, label: 'Serviços' },
  { to: '/empresas', icon: HiOfficeBuilding, label: 'Empresas' },
  { to: '/favoritos', icon: HiHeart, label: 'Favoritos' },
  { to: '/mensagens', icon: HiChat, label: 'Mensagens' },
]

const accountItems = [
  { to: '/perfil', icon: HiUser, label: 'Meu Perfil' },
]

export default function Sidebar({ onClose }) {
  const { logout, isAdmin, userProfile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('Até logo!')
    navigate('/login')
  }

  return (
    <>
      <div className="sidebar-logo">
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 18,
        }}>R</div>
        <span>Rede de Serviços<br />Comunitários</span>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section">Menu Principal</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon />
            {label}
          </NavLink>
        ))}

        <p className="nav-section" style={{ marginTop: '1rem' }}>Minha Conta</p>
        {accountItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="nav-section" style={{ marginTop: '1rem' }}>Administração</p>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <HiShieldCheck />
              Painel Admin
            </NavLink>
          </>
        )}

        <div style={{ marginTop: 'auto', padding: '1rem .75rem', borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.5rem .5rem 1rem' }}>
            <div className="avatar avatar-sm avatar-placeholder" style={{ width: 36, height: 36, fontSize: 14 }}>
              {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile?.displayName || 'Usuário'}
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                {userProfile?.role === 'admin' ? 'Administrador' : 'Membro'}
              </div>
            </div>
          </div>
          <button className="nav-item" style={{ width: '100%', border: 'none', background: 'none', color: 'var(--error)' }} onClick={handleLogout}>
            <HiLogout />
            Sair
          </button>
        </div>
      </nav>
    </>
  )
}
