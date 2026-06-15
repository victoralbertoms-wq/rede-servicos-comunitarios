import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCommunities, getServices, getCompanies } from '../services/firestoreService'
import { useAuth } from '../contexts/AuthContext'
import { HiSearch, HiUserGroup, HiBriefcase, HiOfficeBuilding, HiStar, HiArrowRight } from 'react-icons/hi'

const APK_URL = 'https://github.com/victoralbertoms-wq/rede-servicos-comunitarios/releases/download/v1.0.0/Rede.de.Servicos.apk'
const EXPO_IOS_URL = 'exp://u.expo.dev/fdef6951-adda-4c6b-abdc-41b60e93d8b9?channel-name=main'
const APP_STORE = 'https://apps.apple.com/app/expo-go/id982107779'

function AppDownloadBanner() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)

  const openIOS = useCallback(() => {
    window.location.href = EXPO_IOS_URL
    setTimeout(() => { window.location.href = APP_STORE }, 2500)
  }, [])

  return (
    <div style={{
      background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-xl)',
      padding: '1.5rem 2rem', marginBottom: '2.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem' }}>
        <span style={{ fontSize: '1.2rem' }}>📱</span>
        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Baixe o App no Celular</h3>
      </div>
      <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
        {isAndroid
          ? 'Toque em "Baixar APK" para instalar o app diretamente no seu Android.'
          : isIOS
          ? 'Toque em "Abrir no iPhone" para abrir o app via Expo Go.'
          : 'Acesse este site pelo celular para baixar o aplicativo.'}
      </p>
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        {(isAndroid || (!isIOS && !isAndroid)) && (
          <a
            href={APK_URL}
            download
            style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.65rem 1.4rem', borderRadius: 'var(--radius-full)', background: '#3ddc84', color: '#000', textDecoration: 'none', fontSize: '.9rem', fontWeight: 700 }}
          >
            ▶ Baixar APK — Android
          </a>
        )}
        {(isIOS || (!isIOS && !isAndroid)) && (
          <>
            <a
              href={APP_STORE}
              target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.65rem 1.4rem', borderRadius: 'var(--radius-full)', background: '#1a1a2e', color: '#fff', textDecoration: 'none', fontSize: '.9rem', fontWeight: 700 }}
            >
              🍎 1. Instalar Expo Go
            </a>
            <button
              onClick={openIOS}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.65rem 1.4rem', borderRadius: 'var(--radius-full)', background: 'var(--primary)', color: '#fff', border: 'none', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer' }}
            >
              ▶ 2. Abrir o App
            </button>
          </>
        )}
      </div>
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

      {/* App mobile download */}
      <AppDownloadBanner />

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
