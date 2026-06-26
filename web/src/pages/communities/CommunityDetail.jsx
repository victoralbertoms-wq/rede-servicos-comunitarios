import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { getCommunity, getServices, getCompanies, deleteCommunity, getCommunityMembers } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  HiUserGroup, HiBriefcase, HiOfficeBuilding, HiPencil, HiTrash,
  HiUser, HiChat, HiX, HiStar,
} from 'react-icons/hi'

function MemberProfileModal({ member, onClose }) {
  const navigate = useNavigate()
  const user = member.user
  const name = user?.displayName || 'Usuário'
  const [services, setServices] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [sSnap, cSnap] = await Promise.all([
        getDocs(query(collection(db, 'services'), where('userId', '==', member.userId))),
        getDocs(query(collection(db, 'companies'), where('userId', '==', member.userId))),
      ])
      setServices(sSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.status === 'approved'))
      setCompanies(cSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.status === 'approved'))
      setLoading(false)
    }
    load()
  }, [member.userId])

  function handleMessage() {
    onClose()
    navigate(`/mensagens?to=${member.userId}`)
  }

  const joinedDate = member.joinedAt?.toDate
    ? member.joinedAt.toDate().toLocaleDateString('pt-BR')
    : ''

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Perfil do Membro</h2>
          <button className="btn-icon btn-sm" onClick={onClose}><HiX /></button>
        </div>

        {/* Avatar + info */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: user?.photoURL ? `url(${user.photoURL}) center/cover` : 'linear-gradient(135deg,var(--primary),var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 26,
          }}>
            {!user?.photoURL && name[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{name}</p>
            {user?.email && <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: '.15rem' }}>{user.email}</p>}
            {joinedDate && <p style={{ fontSize: '.78rem', color: 'var(--text-light)', marginTop: '.15rem' }}>Membro desde {joinedDate}</p>}
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleMessage} style={{ flexShrink: 0 }}>
            <HiChat /> Mensagem
          </button>
        </div>

        {/* Services & Companies */}
        <div style={{ padding: '1rem 1.5rem 1.5rem', maxHeight: 360, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
          ) : (
            <>
              {/* Services */}
              {services.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.6rem' }}>
                    <HiBriefcase style={{ display: 'inline', marginRight: 4 }} />Serviços ({services.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {services.map(s => (
                      <Link
                        key={s.id}
                        to={`/servicos/${s.id}`}
                        onClick={onClose}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{
                          padding: '.65rem .875rem', borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)', background: 'var(--surface)',
                          display: 'flex', alignItems: 'center', gap: '.75rem',
                        }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                            background: s.photoURL ? `url(${s.photoURL}) center/cover` : 'linear-gradient(135deg,var(--primary),var(--secondary))',
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{s.category} · {s.city}</p>
                          </div>
                          {s.rating > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '.2rem', fontSize: '.75rem', color: 'var(--accent)', flexShrink: 0 }}>
                              <HiStar /> {s.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Companies */}
              {companies.length > 0 && (
                <div>
                  <p style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.6rem' }}>
                    <HiOfficeBuilding style={{ display: 'inline', marginRight: 4 }} />Empresas ({companies.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {companies.map(c => (
                      <Link
                        key={c.id}
                        to={`/empresas/${c.id}`}
                        onClick={onClose}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{
                          padding: '.65rem .875rem', borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)', background: 'var(--surface)',
                          display: 'flex', alignItems: 'center', gap: '.75rem',
                        }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                            background: c.logoURL ? `url(${c.logoURL}) center/cover` : 'linear-gradient(135deg,var(--secondary),var(--success))',
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{c.category}</p>
                          </div>
                          {c.rating > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '.2rem', fontSize: '.75rem', color: 'var(--accent)', flexShrink: 0 }}>
                              <HiStar /> {c.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {services.length === 0 && companies.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '.88rem', padding: '1rem 0' }}>
                  Este membro ainda não tem serviços ou empresas cadastrados.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MemberCard({ member, onClick }) {
  const user = member.user
  const name = user?.displayName || 'Usuário'
  const initial = name[0]?.toUpperCase() || 'U'
  const joinedDate = member.joinedAt?.toDate
    ? member.joinedAt.toDate().toLocaleDateString('pt-BR')
    : ''

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        background: 'var(--surface)', cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.875rem 1rem',
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-alpha)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: user?.photoURL ? `url(${user.photoURL}) center/cover` : 'linear-gradient(135deg,var(--primary),var(--secondary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: '.9rem',
      }}>
        {!user?.photoURL && initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
        {joinedDate && <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Desde {joinedDate}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem', color: 'var(--primary)', flexShrink: 0 }}>
        <HiChat /> Ver perfil
      </div>
    </button>
  )
}

export default function CommunityDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [services, setServices] = useState([])
  const [companies, setCompanies] = useState([])
  const [members, setMembers] = useState([])
  const [tab, setTab] = useState('services')
  const [loading, setLoading] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    Promise.all([
      getCommunity(id),
      getServices({ communityId: id, pageSize: 20 }),
      getCompanies({ communityId: id, pageSize: 20 }),
    ]).then(([c, s, co]) => {
      setCommunity(c)
      setServices(s.docs)
      setCompanies(co.docs)
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (tab !== 'members') return
    if (members.length > 0) return
    setLoadingMembers(true)
    getCommunityMembers(id)
      .then(setMembers)
      .catch(() => toast.error('Erro ao carregar membros.'))
      .finally(() => setLoadingMembers(false))
  }, [tab, id])

  async function handleDelete() {
    if (!window.confirm(`Excluir a comunidade "${community.name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteCommunity(id)
      toast.success('Comunidade excluída.')
      navigate('/comunidades')
    } catch {
      toast.error('Erro ao excluir comunidade.')
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
  if (!community) return <div className="empty-state"><h3>Comunidade não encontrada</h3></div>

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{
          height: 200,
          background: community.photoURL ? `url(${community.photoURL}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
        }} />
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '-2.5rem', marginBottom: '1rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16, border: '3px solid var(--surface)',
              background: community.logoURL ? `url(${community.logoURL}) center/cover` : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 28, flexShrink: 0,
            }}>
              {!community.logoURL && community.name?.[0]}
            </div>
            <div style={{ paddingBottom: '.25rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{community.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '.82rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>
                <span><HiUserGroup style={{ display: 'inline' }} /> {community.memberCount || 0} membros</span>
                <span><HiBriefcase style={{ display: 'inline' }} /> {services.length} serviços</span>
                <span><HiOfficeBuilding style={{ display: 'inline' }} /> {companies.length} empresas</span>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>{community.description}</p>
        </div>
      </div>

      {/* Admin buttons */}
      {(isAdmin || (user && community.adminIds?.includes(user.uid))) && (
        <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link to={`/comunidades/${id}/editar`} className="btn btn-outline btn-sm">
            <HiPencil /> Editar
          </Link>
          <button className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff' }} onClick={handleDelete}>
            <HiTrash /> Excluir
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to={`/servicos/novo?community=${id}`} className="btn btn-primary btn-sm">
          + Cadastrar Serviço
        </Link>
        <Link to={`/empresas/nova?community=${id}`} className="btn btn-outline btn-sm">
          + Cadastrar Empresa
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${tab === 'services' ? 'active' : ''}`} onClick={() => setTab('services')}>
          Serviços ({services.length})
        </button>
        <button className={`tab ${tab === 'companies' ? 'active' : ''}`} onClick={() => setTab('companies')}>
          Empresas ({companies.length})
        </button>
        <button className={`tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
          Membros ({community.memberCount || 0})
        </button>
      </div>

      {tab === 'services' && (
        services.length === 0 ? (
          <div className="empty-state"><HiBriefcase /><h3>Nenhum serviço cadastrado</h3></div>
        ) : (
          <div className="grid-3">
            {services.map(s => (
              <Link key={s.id} to={`/servicos/${s.id}`} className="card" style={{ textDecoration: 'none' }}>
                <div className="card-body">
                  <span className="badge badge-primary" style={{ marginBottom: '.5rem' }}>{s.category}</span>
                  <h3 className="card-title">{s.name}</h3>
                  <p className="card-subtitle">{s.specialty}</p>
                  <p style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{s.city}, {s.state}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === 'companies' && (
        companies.length === 0 ? (
          <div className="empty-state"><HiOfficeBuilding /><h3>Nenhuma empresa cadastrada</h3></div>
        ) : (
          <div className="grid-3">
            {companies.map(c => (
              <Link key={c.id} to={`/empresas/${c.id}`} className="card" style={{ textDecoration: 'none' }}>
                <div className="card-body">
                  <span className="badge badge-info" style={{ marginBottom: '.5rem' }}>{c.category}</span>
                  <h3 className="card-title">{c.name}</h3>
                  <p className="card-subtitle">{c.description?.substring(0, 80)}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === 'members' && (
        loadingMembers ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
        ) : members.length === 0 ? (
          <div className="empty-state"><HiUser /><h3>Nenhum membro ainda</h3></div>
        ) : (
          <div className="grid-2">
            {members.map(m => (
              <MemberCard key={m.id} member={m} onClick={() => setSelectedMember(m)} />
            ))}
          </div>
        )
      )}

      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  )
}
