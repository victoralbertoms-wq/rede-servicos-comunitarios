import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { HiHeart, HiBriefcase, HiOfficeBuilding } from 'react-icons/hi'

export default function Favorites() {
  const { user, userProfile } = useAuth()
  const [services, setServices] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('services')

  useEffect(() => {
    async function load() {
      const favServices = userProfile?.favorites?.services || []
      const favCompanies = userProfile?.favorites?.companies || []

      const [svcDocs, compDocs] = await Promise.all([
        Promise.all(favServices.map(id => getDoc(doc(db, 'services', id)))),
        Promise.all(favCompanies.map(id => getDoc(doc(db, 'companies', id)))),
      ])

      setServices(svcDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })))
      setCompanies(compDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [userProfile])

  return (
    <div>
      <div className="page-header">
        <h1>Favoritos</h1>
        <p>Profissionais e empresas que você salvou</p>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${tab === 'services' ? 'active' : ''}`} onClick={() => setTab('services')}>
          Serviços ({services.length})
        </button>
        <button className={`tab ${tab === 'companies' ? 'active' : ''}`} onClick={() => setTab('companies')}>
          Empresas ({companies.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : tab === 'services' ? (
        services.length === 0 ? (
          <div className="empty-state">
            <HiHeart />
            <h3>Nenhum serviço favorito</h3>
            <p>Explore serviços e adicione aos favoritos.</p>
            <Link to="/servicos" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Ver Serviços</Link>
          </div>
        ) : (
          <div className="grid-3">
            {services.map(s => (
              <Link key={s.id} to={`/servicos/${s.id}`} className="card" style={{ textDecoration: 'none' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                      <HiBriefcase />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '.95rem' }}>{s.name}</h3>
                      <span className="badge badge-primary">{s.category}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{s.specialty}</p>
                  <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.5rem' }}>{s.city}, {s.state}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        companies.length === 0 ? (
          <div className="empty-state">
            <HiHeart />
            <h3>Nenhuma empresa favorita</h3>
            <p>Explore empresas e adicione aos favoritos.</p>
            <Link to="/empresas" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Ver Empresas</Link>
          </div>
        ) : (
          <div className="grid-3">
            {companies.map(c => (
              <Link key={c.id} to={`/empresas/${c.id}`} className="card" style={{ textDecoration: 'none' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#0ea5e9,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                      <HiOfficeBuilding />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '.95rem' }}>{c.name}</h3>
                      <span className="badge badge-info">{c.category}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}
