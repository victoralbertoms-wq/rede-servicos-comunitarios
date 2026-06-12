import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCompanies } from '../../services/firestoreService'
import { HiOfficeBuilding, HiSearch, HiStar, HiPlus } from 'react-icons/hi'

const CATEGORIES = [
  'Todos', 'Comércio', 'Alimentação', 'Saúde', 'Educação',
  'Tecnologia', 'Serviços', 'Beleza', 'Transporte', 'Outros'
]

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getCompanies({ category: category === 'Todos' ? null : category, search, pageSize: 30 })
      .then(({ docs }) => setCompanies(docs))
      .finally(() => setLoading(false))
  }, [category, search])

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Empresas</h1>
            <p>Comércios e estabelecimentos das comunidades</p>
          </div>
          <Link to="/empresas/nova" className="btn btn-primary">
            <HiPlus /> Cadastrar Empresa
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: '1 1 280px', maxWidth: 380 }}>
          <HiSearch className="search-icon" size={18} />
          <input className="form-input" style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar empresa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ flex: '0 0 auto', width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : companies.length === 0 ? (
        <div className="empty-state">
          <HiOfficeBuilding />
          <h3>Nenhuma empresa encontrada</h3>
          <p>Seja o primeiro a cadastrar sua empresa!</p>
        </div>
      ) : (
        <div className="grid-3">
          {companies.map(c => (
            <Link key={c.id} to={`/empresas/${c.id}`} className="card" style={{ textDecoration: 'none' }}>
              <div style={{
                height: 140,
                background: c.photoURL ? `url(${c.photoURL}) center/cover` : 'linear-gradient(135deg,#0ea5e9,#22c55e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {c.logoURL && <img src={c.logoURL} alt="" style={{ width: 60, height: 60, borderRadius: 12, border: '3px solid rgba(255,255,255,.8)', objectFit: 'cover' }} />}
              </div>
              <div className="card-body">
                <span className="badge badge-info" style={{ marginBottom: '.5rem' }}>{c.category}</span>
                <h3 className="card-title">{c.name}</h3>
                <p className="card-subtitle" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', marginTop: '.5rem' }}>
                  <HiStar style={{ color: 'var(--accent)', width: 14, height: 14 }} />
                  <span style={{ fontSize: '.78rem', fontWeight: 600 }}>{(c.rating || 0).toFixed(1)}</span>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>({c.reviewCount || 0})</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
