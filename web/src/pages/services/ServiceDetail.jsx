import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getService, getReviews, addReview, toggleFavorite, deleteService } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { HiStar, HiHeart, HiShare, HiChat, HiPhone, HiMail, HiGlobeAlt, HiLocationMarker, HiClock, HiPencil, HiTrash } from 'react-icons/hi'
import { SiWhatsapp } from 'react-icons/si'

function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '.25rem' }}>
      {[1,2,3,4,5].map(i => (
        <HiStar
          key={i}
          onClick={() => onChange && onChange(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            width: 28, height: 28, cursor: onChange ? 'pointer' : 'default',
            color: i <= (hover || value) ? 'var(--accent)' : 'var(--border)',
            transition: 'color .15s',
          }}
        />
      ))}
    </div>
  )
}

export default function ServiceDetail() {
  const { id } = useParams()
  const { user, userProfile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getService(id), getReviews(id)])
      .then(([s, r]) => { setService(s); setReviews(r) })
      .finally(() => setLoading(false))
    const favs = userProfile?.favorites?.services || []
    setIsFav(favs.includes(id))
  }, [id, userProfile])

  async function handleFavorite() {
    const added = await toggleFavorite(user.uid, id, 'service')
    setIsFav(added)
    toast.success(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.')
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir o serviço "${service.name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteService(id)
      toast.success('Serviço excluído.')
      navigate('/servicos')
    } catch {
      toast.error('Erro ao excluir serviço.')
    }
  }

  async function submitReview() {
    if (!newReview.rating) return toast.error('Selecione uma nota.')
    setSubmitting(true)
    try {
      const rev = await addReview({
        targetId: id, targetType: 'service',
        userId: user.uid, userName: userProfile.displayName,
        userPhoto: userProfile.photoURL, ...newReview,
      })
      setReviews(prev => [{ id: rev, ...newReview, userName: userProfile.displayName, createdAt: { toDate: () => new Date() } }, ...prev])
      setNewReview({ rating: 0, comment: '' })
      toast.success('Avaliação enviada!')
    } catch {
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
  if (!service) return <div className="empty-state"><h3>Serviço não encontrado</h3></div>

  const whatsUrl = service.whatsapp ? `https://wa.me/55${service.whatsapp.replace(/\D/g,'')}` : null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Cover */}
      <div style={{
        height: 260, borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem',
        background: service.photoURL ? `url(${service.photoURL}) center/cover` : 'linear-gradient(135deg,#4f46e5,#0ea5e9)',
      }} />

      {/* Main card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '.5rem' }}>{service.category}</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{service.name}</h1>
            {service.specialty && <p style={{ color: 'var(--text-muted)', marginTop: '.25rem' }}>{service.specialty}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.5rem' }}>
              <Stars value={Math.round(service.rating || 0)} />
              <span style={{ fontWeight: 700 }}>{(service.rating || 0).toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>({service.reviewCount || 0} avaliações)</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button className="btn-icon" onClick={handleFavorite} title={isFav ? 'Remover dos favoritos' : 'Favoritar'}>
              <HiHeart size={20} style={{ color: isFav ? 'var(--error)' : undefined }} />
            </button>
            <button className="btn-icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copiado!') }} title="Compartilhar">
              <HiShare size={20} />
            </button>
            {(isAdmin || service.userId === user?.uid) && (
              <>
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/servicos/${id}/editar`)}>
                  <HiPencil /> Editar
                </button>
                <button className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff' }} onClick={handleDelete}>
                  <HiTrash /> Excluir
                </button>
              </>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/mensagens?to=${service.userId}`)}>
              <HiChat /> Mensagem
            </button>
          </div>
        </div>

        {service.description && (
          <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{service.description}</p>
        )}

        {/* Contact */}
        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '.75rem' }}>
          {service.phone && (
            <a href={`tel:${service.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              <HiPhone /> {service.phone}
            </a>
          )}
          {whatsUrl && (
            <a href={whatsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: '#25d366', color: '#fff', textDecoration: 'none' }}>
              <SiWhatsapp /> WhatsApp
            </a>
          )}
          {service.email && (
            <a href={`mailto:${service.email}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              <HiMail /> {service.email}
            </a>
          )}
          {service.website && (
            <a href={service.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              <HiGlobeAlt /> Site
            </a>
          )}
        </div>

        {/* Info */}
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '.85rem', color: 'var(--text-muted)' }}>
          {(service.city || service.state) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <HiLocationMarker /> {service.city}, {service.state}
            </span>
          )}
          {service.workingHours && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <HiClock /> {service.workingHours}
            </span>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>Avaliações</h2>

        {/* New review */}
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '.75rem' }}>Deixe sua avaliação</p>
          <Stars value={newReview.rating} onChange={r => setNewReview(p => ({ ...p, rating: r }))} />
          <textarea
            className="form-input"
            style={{ marginTop: '.75rem' }}
            rows={3}
            placeholder="Conte sua experiência..."
            value={newReview.comment}
            onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))}
          />
          <button className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }} onClick={submitReview} disabled={submitting}>
            {submitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Enviar avaliação'}
          </button>
        </div>

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Nenhuma avaliação ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(r => (
              <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '.5rem' }}>
                  <div className="avatar avatar-sm avatar-placeholder" style={{ width: 36, height: 36, fontSize: 14 }}>
                    {r.userName?.[0]}
                  </div>
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
