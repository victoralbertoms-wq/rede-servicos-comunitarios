import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCompany, getReviews, addReview, toggleFavorite } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { HiStar, HiHeart, HiShare, HiPhone, HiMail, HiGlobeAlt, HiLocationMarker, HiChat } from 'react-icons/hi'
import { SiWhatsapp } from 'react-icons/si'

function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '.25rem' }}>
      {[1,2,3,4,5].map(i => (
        <HiStar key={i}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ width: 26, height: 26, cursor: onChange ? 'pointer' : 'default', color: i <= (hover || value) ? 'var(--accent)' : 'var(--border)' }} />
      ))}
    </div>
  )
}

export default function CompanyDetail() {
  const { id } = useParams()
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getCompany(id), getReviews(id)])
      .then(([c, r]) => { setCompany(c); setReviews(r) })
      .finally(() => setLoading(false))
    setIsFav((userProfile?.favorites?.companies || []).includes(id))
  }, [id, userProfile])

  async function handleFavorite() {
    const added = await toggleFavorite(user.uid, id, 'company')
    setIsFav(added)
    toast.success(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.')
  }

  async function submitReview() {
    if (!newReview.rating) return toast.error('Selecione uma nota.')
    setSubmitting(true)
    try {
      await addReview({ targetId: id, targetType: 'company', userId: user.uid, userName: userProfile.displayName, userPhoto: userProfile.photoURL, ...newReview })
      setReviews(prev => [{ id: Date.now(), ...newReview, userName: userProfile.displayName }, ...prev])
      setNewReview({ rating: 0, comment: '' })
      toast.success('Avaliação enviada!')
    } catch {
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
  if (!company) return <div className="empty-state"><h3>Empresa não encontrada</h3></div>

  const whatsUrl = company.whatsapp ? `https://wa.me/55${company.whatsapp.replace(/\D/g,'')}` : null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ height: 240, borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem', background: company.photoURL ? `url(${company.photoURL}) center/cover` : 'linear-gradient(135deg,#0ea5e9,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {company.logoURL && <img src={company.logoURL} alt="" style={{ width: 80, height: 80, borderRadius: 16, border: '4px solid rgba(255,255,255,.9)', objectFit: 'cover' }} />}
      </div>

      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-info" style={{ marginBottom: '.5rem' }}>{company.category}</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{company.name}</h1>
            {company.legalName && <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{company.legalName}</p>}
            {company.cnpj && <p style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>CNPJ: {company.cnpj}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.5rem' }}>
              <Stars value={Math.round(company.rating || 0)} />
              <span style={{ fontWeight: 700 }}>{(company.rating || 0).toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>({company.reviewCount || 0})</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button className="btn-icon" onClick={handleFavorite}><HiHeart size={20} style={{ color: isFav ? 'var(--error)' : undefined }} /></button>
            <button className="btn-icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copiado!') }}><HiShare size={20} /></button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/mensagens?to=${company.userId}`)}><HiChat /> Mensagem</button>
          </div>
        </div>

        {company.description && <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{company.description}</p>}

        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
          {company.phone && <a href={`tel:${company.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}><HiPhone /> {company.phone}</a>}
          {whatsUrl && <a href={whatsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: '#25d366', color: '#fff', textDecoration: 'none' }}><SiWhatsapp /> WhatsApp</a>}
          {company.email && <a href={`mailto:${company.email}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}><HiMail /> E-mail</a>}
          {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}><HiGlobeAlt /> Site</a>}
        </div>

        {company.address && (
          <p style={{ marginTop: '1rem', fontSize: '.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
            <HiLocationMarker /> {company.address}
          </p>
        )}
      </div>

      <div className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>Avaliações</h2>
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '.75rem' }}>Deixe sua avaliação</p>
          <Stars value={newReview.rating} onChange={r => setNewReview(p => ({ ...p, rating: r }))} />
          <textarea className="form-input" style={{ marginTop: '.75rem' }} rows={3} placeholder="Conte sua experiência..."
            value={newReview.comment} onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))} />
          <button className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }} onClick={submitReview} disabled={submitting}>
            {submitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Enviar avaliação'}
          </button>
        </div>
        {reviews.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma avaliação ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(r => (
              <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '.5rem' }}>
                  <div className="avatar avatar-sm avatar-placeholder" style={{ width: 36, height: 36, fontSize: 14 }}>{r.userName?.[0]}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '.88rem' }}>{r.userName}</p>
                    <Stars value={r.rating} />
                  </div>
                </div>
                {r.comment && <p style={{ fontSize: '.88rem', color: 'var(--text-muted)' }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
