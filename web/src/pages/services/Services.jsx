import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getServices } from '../../services/firestoreService'
import { HiBriefcase, HiSearch, HiStar, HiPlus } from 'react-icons/hi'

const CATEGORIES = [
  'Todos', 'Construção Civil', 'Elétrica', 'Hidráulica', 'Advocacia',
  'Contabilidade', 'Saúde', 'Psicologia', 'Educação', 'Mecânica', 'Tecnologia', 'Outros'
]

export default function Services() {
  const [searchParams] = useSearchParams()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setLoading(true)
    getServices({ category: category === 'Todos' ? null : category, search, pageSize: 30 })
      .then(({ docs }) => setServices(docs))
      .finally(() => setLoading(false))
  }, [category, search])

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Serviços</h1>
            <p>Encontre profissionais qualificados da sua comunidade</p>
          </div>
          <Link to="/servicos/novo" className="btn btn-primary">
            <HiPlus /> Cadastrar Serviço
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: '1 1 280px', maxWidth: 380 }}>
          <HiSearch className="search-icon" size={18} />
          <input
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar profissional..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ flex: '0 0 auto', width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <HiBriefcase />
          <h3>Nenhum serviço encontrado</h3>
          <p>Tente outros filtros ou cadastre o seu serviço.</p>
        </div>
      ) : (
        <div className="grid-3">
          {services.map(s => (
            <Link key={s.id} to={`/servicos/${s.id}`} className="card" style={{ textDecoration: 'none' }}>
              <div style={{
                height: 140,
                background: s.photoURL ? `url(${s.photoURL}) center/cover` : 'linear-gradient(135deg,#4f46e5,#0ea5e9)',
                display: 'flex', alignItems: 'flex-end', padding: '.75rem',
              }}>
                {s.isSponsored && <span className="badge badge-warning">Destaque</span>}
              </div>
              <div className="card-body">
                <span className="badge badge-primary" style={{ marginBottom: '.5rem' }}>{s.category}</span>
                <h3 className="card-title">{s.name}</h3>
                <p className="card-subtitle">{s.specialty}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', marginBottom: '.5rem' }}>
                  <HiStar style={{ color: 'var(--accent)', width: 14, height: 14 }} />
                  <span style={{ fontSize: '.78rem', fontWeight: 600 }}>{(s.rating || 0).toFixed(1)}</span>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>({s.reviewCount || 0})</span>
                </div>
                <p style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{s.city}, {s.state}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
