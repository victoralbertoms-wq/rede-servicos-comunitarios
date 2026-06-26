import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCommunities, joinCommunity } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { HiUserGroup, HiLockClosed, HiSearch, HiPlus } from 'react-icons/hi'

function JoinModal({ community, onClose, onJoined }) {
  const { user, fetchUserProfile } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    setLoading(true)
    try {
      await joinCommunity(community.id, user.uid, password)
      await fetchUserProfile(user.uid)
      toast.success(`Você entrou em ${community.name}!`)
      onJoined()
      navigate(`/comunidades/${community.id}`)
    } catch (err) {
      toast.error(err.message || 'Erro ao entrar na comunidade.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Entrar em {community.name}</h2>
          <button className="btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {community.password && (
            <div className="form-group">
              <label className="form-label"><HiLockClosed style={{ display: 'inline' }} /> Senha da comunidade</label>
              <input
                className="form-input"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
            </div>
          )}
          <p style={{ fontSize: '.88rem', color: 'var(--text-muted)' }}>{community.description}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleJoin} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Communities() {
  const { isAdmin, userProfile } = useAuth()
  const [allCommunities, setAllCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [joining, setJoining] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getCommunities(100)
      .then(({ docs }) => setAllCommunities(docs))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return allCommunities
    const s = search.toLowerCase()
    return allCommunities.filter(c =>
      c.name?.toLowerCase().includes(s) ||
      c.description?.toLowerCase().includes(s)
    )
  }, [allCommunities, search])

  const isMember = (community) => userProfile?.communities?.includes(community.id)

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Comunidades</h1>
            <p>Encontre e entre em comunidades da sua região</p>
          </div>
          {isAdmin && (
            <Link to="/comunidades/nova" className="btn btn-primary">
              <HiPlus /> Nova Comunidade
            </Link>
          )}
        </div>
      </div>

      <div className="search-box" style={{ marginBottom: '1.75rem', maxWidth: 480 }}>
        <HiSearch className="search-icon" size={18} />
        <input
          className="form-input"
          style={{ paddingLeft: '2.5rem' }}
          placeholder="Buscar comunidades..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <HiUserGroup />
          <h3>Nenhuma comunidade encontrada</h3>
          <p>{search ? 'Tente outro termo de busca.' : 'Nenhuma comunidade cadastrada ainda.'}</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(community => (
            <div key={community.id} className="card">
              <div style={{
                height: 120,
                background: community.photoURL
                  ? `url(${community.photoURL}) center/cover`
                  : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }} />
              <div className="card-body">
                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: community.logoURL ? `url(${community.logoURL}) center/cover` : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800,
                  }}>
                    {!community.logoURL && community.name?.[0]}
                  </div>
                  <div>
                    <h3 className="card-title">{community.name}</h3>
                    <span className="badge badge-info">{community.memberCount || 0} membros</span>
                  </div>
                </div>
                <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {community.description}
                </p>
                {community.password && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>
                    <HiLockClosed /> Comunidade privada
                  </div>
                )}
              </div>
              <div className="card-footer">
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/comunidades/${community.id}`)}>
                  Ver detalhes
                </button>
                {!isMember(community) ? (
                  <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setJoining(community)}>
                    Entrar
                  </button>
                ) : (
                  <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Membro</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {joining && (
        <JoinModal
          community={joining}
          onClose={() => setJoining(null)}
          onJoined={() => {
            setJoining(null)
            getCommunities(100).then(({ docs }) => setAllCommunities(docs))
          }}
        />
      )}
    </div>
  )
}
