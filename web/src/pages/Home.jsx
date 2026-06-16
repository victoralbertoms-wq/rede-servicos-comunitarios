import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCommunities, getServices, getCompanies } from '../services/firestoreService'
import { useAuth } from '../contexts/AuthContext'
import { HiSearch, HiUserGroup, HiBriefcase, HiOfficeBuilding, HiStar, HiArrowRight } from 'react-icons/hi'

function InstallPwaBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-dismissed') === '1')
  const [prompt, setPrompt] = useState(null)
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
  const isIos = /iPhone|iPad/i.test(navigator.userAgent)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed || isStandalone || !isMobile) return null

  function dismiss() {
    localStorage.setItem('pwa-dismissed', '1')
    setDismissed(true)
  }

  async function handleInstall() {
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') dismiss()
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
      borderRadius: 'var(--radius-xl)', padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: isIos ? '.75rem' : 0 }}>
        <span style={{ fontSize: '1.6rem' }}>📱</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '.9rem' }}>Instale o App no Celular</p>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.78rem', marginTop: '.1rem' }}>Acesse direto da tela inicial, sem abrir o navegador</p>
        </div>
        <button onClick={dismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>✕</button>
      </div>
      {isIos ? (
        <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '.6rem .875rem', fontSize: '.78rem', color: '#fff', lineHeight: 1.6 }}>
          Toque em <strong>Compartilhar</strong> (□↑) → <strong>"Adicionar à Tela de Início"</strong>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
          {prompt ? (
            <button onClick={handleInstall} style={{ flex: 1, padding: '.55rem', borderRadius: 8, background: '#fff', color: '#4f46e5', fontWeight: 700, fontSize: '.85rem', border: 'none', cursor: 'pointer' }}>
              Instalar agora
            </button>
          ) : (
            <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 8, padding: '.55rem .875rem', fontSize: '.78rem', color: '#fff', lineHeight: 1.6 }}>
              No Chrome: toque nos <strong>⋮ três pontos</strong> → <strong>"Adicionar à tela inicial"</strong>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <HiStar key={i} style={{ color: i <= rating ? 'var(--accent)' : 'var(--border)', width: 14, height: 14 }} />
      ))}
      <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginLeft: '.25rem' }}>{rating.toFixed(1)}</span>
    </div>
  )
}

function ServiceCard({ item }) {
  return (
    <Link to={`/servicos/${item.id}`} className="card" style={{ textDecoration: 'none' }}>
      <div style={{
        height: 140, background: item.photoURL ? `url(${item.photoURL}) center/cover` : 'linear-gradient(135deg,#4f46e5,#0ea5e9)',
        display: 'flex', alignItems: 'flex-end', padding: '.75rem',
      }}>
        {item.isSponsored && <span className="badge badge-warning">Destaque</span>}
      </div>
      <div className="card-body">
        <p style={{ fontSize: '.72rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '.2rem' }}>{item.category}</p>
        <h3 className="card-title">{item.name}</h3>
        <p className="card-subtitle">{item.specialty}</p>
        <StarRating rating={item.rating || 0} />
        <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.5rem' }}>{item.city}, {item.state}</p>
      </div>
    </Link>
  )
}

function CompanyCard({ item }) {
  return (
    <Link to={`/empresas/${item.id}`} className="card" style={{ textDecoration: 'none' }}>
      <div style={{
        height: 140, background: item.photoURL ? `url(${item.photoURL}) center/cover` : 'linear-gradient(135deg,#0ea5e9,#22c55e)',
        display: 'flex', alignItems: 'flex-end', padding: '.75rem',
      }} />
      <div className="card-body">
        <p style={{ fontSize: '.72rem', color: 'var(--secondary)', fontWeight: 600, marginBottom: '.2rem' }}>{item.category}</p>
        <h3 className="card-title">{item.name}</h3>
        <p className="card-subtitle">{item.description?.substring(0, 60)}...</p>
        <StarRating rating={item.rating || 0} />
      </div>
    </Link>
  )
}

function CommunityCard({ item }) {
  return (
    <Link to={`/comunidades/${item.id}`} className="card" style={{ textDecoration: 'none', display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12, flexShrink: 0,
        background: item.logoURL ? `url(${item.logoURL}) center/cover` : 'linear-gradient(135deg,#4f46e5,#0ea5e9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 22,
      }}>
        {!item.logoURL && item.name?.[0]}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{item.memberCount || 0} membros</p>
      </div>
      <HiArrowRight style={{ color: 'var(--text-light)' }} />
    </Link>
  )
}

export default function Home() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [communities, setCommunities] = useState([])
  const [services, setServices] = useState([])
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCommunities(6),
      getServices({ pageSize: 6 }),
      getCompanies({ pageSize: 6 }),
    ]).then(([c, s, co]) => {
      setCommunities(c.docs)
      setServices(s.docs)
      setCompanies(co.docs)
    }).finally(() => setLoading(false))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) navigate(`/servicos?q=${encodeURIComponent(search.trim())}`)
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', marginBottom: '2.5rem',
        color: '#fff', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '.5rem' }}>
          Olá, {userProfile?.displayName?.split(' ')[0]}! 👋
        </h1>
        <p style={{ opacity: .9, fontSize: '1.05rem', marginBottom: '1.75rem' }}>
          Encontre profissionais e empresas da sua comunidade
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.5rem', maxWidth: 540, margin: '0 auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <HiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              style={{ width: '100%', padding: '.875rem 1rem .875rem 2.75rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '1rem', outline: 'none' }}
              placeholder="Buscar serviços, profissionais..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,.2)', border: '1.5px solid rgba(255,255,255,.5)', backdropFilter: 'blur(8px)' }}>
            Buscar
          </button>
        </form>
      </div>

      {/* PWA install banner */}
      <InstallPwaBanner />

      {/* Quick links */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {[
          { icon: HiUserGroup, label: 'Comunidades', count: communities.length, to: '/comunidades', color: '#4f46e5' },
          { icon: HiBriefcase, label: 'Serviços', count: services.length, to: '/servicos', color: '#0ea5e9' },
          { icon: HiOfficeBuilding, label: 'Empresas', count: companies.length, to: '/empresas', color: '#22c55e' },
        ].map(({ icon: Icon, label, count, to, color }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: `${color}18` }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{count}+</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Communities */}
      {communities.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Comunidades em Destaque</h2>
            <Link to="/comunidades" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
              Ver todas <HiArrowRight />
            </Link>
          </div>
          <div className="grid-2">
            {communities.slice(0, 4).map(c => <CommunityCard key={c.id} item={c} />)}
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Serviços em Destaque</h2>
            <Link to="/servicos" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
              Ver todos <HiArrowRight />
            </Link>
          </div>
          <div className="grid-3">
            {services.map(s => <ServiceCard key={s.id} item={s} />)}
          </div>
        </section>
      )}

      {/* Companies */}
      {companies.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Empresas em Destaque</h2>
            <Link to="/empresas" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
              Ver todas <HiArrowRight />
            </Link>
          </div>
          <div className="grid-3">
            {companies.map(c => <CompanyCard key={c.id} item={c} />)}
          </div>
        </section>
      )}

      {services.length === 0 && companies.length === 0 && (
        <div className="empty-state">
          <HiBriefcase />
          <h3>Nenhum conteúdo ainda</h3>
          <p>Entre em uma comunidade e cadastre seu serviço!</p>
          <Link to="/comunidades" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Explorar Comunidades
          </Link>
        </div>
      )}
    </div>
  )
}
