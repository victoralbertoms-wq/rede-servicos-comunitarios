import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiMenu, HiSearch, HiBell, HiChat } from 'react-icons/hi'
import { useAuth } from '../../contexts/AuthContext'

export default function TopHeader({ onMenuToggle }) {
  const [query, setQuery] = useState('')
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/servicos?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="top-header">
      <button className="menu-toggle btn-icon" onClick={onMenuToggle} aria-label="Abrir menu">
        <HiMenu size={22} />
      </button>

      <form className="search-wrap" onSubmit={handleSearch}>
        <div className="search-box">
          <HiSearch className="search-icon" size={18} />
          <input
            className="form-input"
            style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)', fontSize: '.88rem' }}
            type="search"
            placeholder="Buscar serviços, empresas, profissionais..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="header-actions">
        <button className="btn-icon" onClick={() => navigate('/mensagens')} title="Mensagens">
          <HiChat size={20} />
        </button>
        <button className="btn-icon" title="Notificações">
          <HiBell size={20} />
        </button>
        <button
          onClick={() => navigate('/perfil')}
          className="avatar avatar-sm avatar-placeholder"
          style={{ width: 36, height: 36, fontSize: 14, border: 'none', cursor: 'pointer' }}
          title="Meu perfil"
        >
          {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  )
}
