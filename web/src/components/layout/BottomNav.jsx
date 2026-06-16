import { NavLink } from 'react-router-dom'
import { HiHome, HiUserGroup, HiBriefcase, HiOfficeBuilding, HiUser } from 'react-icons/hi'

const items = [
  { to: '/', icon: HiHome, label: 'Início' },
  { to: '/comunidades', icon: HiUserGroup, label: 'Comunidades' },
  { to: '/servicos', icon: HiBriefcase, label: 'Serviços' },
  { to: '/empresas', icon: HiOfficeBuilding, label: 'Empresas' },
  { to: '/perfil', icon: HiUser, label: 'Perfil' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
