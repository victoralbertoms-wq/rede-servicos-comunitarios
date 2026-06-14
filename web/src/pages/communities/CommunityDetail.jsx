import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCommunity, getServices, getCompanies, deleteCommunity } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { HiUserGroup, HiBriefcase, HiOfficeBuilding, HiPencil, HiTrash } from 'react-icons/hi'

export default function CommunityDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [services, setServices] = useState([])
  const [companies, setCompanies] = useState([])
  const [tab, setTab] = useState('services')
  const [loading, setLoading] = useState(true)

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

      {/* Add buttons */}
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
    </div>
  )
}
