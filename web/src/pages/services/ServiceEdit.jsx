import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getService, updateService } from '../../services/firestoreService'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Construção Civil', 'Elétrica', 'Hidráulica', 'Advocacia', 'Contabilidade',
  'Saúde', 'Psicologia', 'Educação', 'Mecânica', 'Tecnologia',
  'Beleza & Estética', 'Gastronomia', 'Transporte', 'Outros',
]

const STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
]

export default function ServiceEdit() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [service, setService] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getService(id).then(s => {
      setService(s)
      reset({
        name: s.name, category: s.category, specialty: s.specialty,
        description: s.description, phone: s.phone, whatsapp: s.whatsapp,
        email: s.email, city: s.city, state: s.state, address: s.address,
        website: s.website, workingHours: s.workingHours,
        instagram: s.instagram, facebook: s.facebook,
      })
    }).finally(() => setFetching(false))
  }, [id, reset])

  async function onSubmit(data) {
    setLoading(true)
    try {
      const updates = { ...data }
      if (photoFile) updates.photoURL = await uploadToCloudinary(photoFile, 'services')
      else if (removePhoto) updates.photoURL = ''
      await updateService(id, updates)
      toast.success('Serviço atualizado!')
      navigate(`/servicos/${id}`)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao atualizar serviço.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
  if (!service) return <div className="empty-state"><h3>Serviço não encontrado</h3></div>

  const canEdit = isAdmin || service.userId === user?.uid
  if (!canEdit) return <div className="empty-state"><h3>Acesso negado</h3></div>

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Editar Serviço</h1>
        <p>Atualize as informações do seu serviço</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nome do profissional *</label>
                <input className={`form-input ${errors.name ? 'error' : ''}`}
                  {...register('name', { required: 'Campo obrigatório' })} />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select className={`form-input ${errors.category ? 'error' : ''}`}
                  {...register('category', { required: 'Selecione a categoria' })}>
                  <option value="">Selecione...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.category && <span className="form-error">{errors.category.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Especialidade</label>
              <input className="form-input" {...register('specialty')} />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea className="form-input" rows={4} {...register('description')} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-input" {...register('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp</label>
                <input className="form-input" {...register('whatsapp')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-input" type="email" {...register('email')} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Cidade *</label>
                <input className={`form-input ${errors.city ? 'error' : ''}`}
                  {...register('city', { required: 'Campo obrigatório' })} />
                {errors.city && <span className="form-error">{errors.city.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Estado *</label>
                <select className={`form-input ${errors.state ? 'error' : ''}`}
                  {...register('state', { required: 'Selecione o estado' })}>
                  <option value="">UF</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <span className="form-error">{errors.state.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Endereço</label>
              <input className="form-input" {...register('address')} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Site</label>
                <input className="form-input" {...register('website')} />
              </div>
              <div className="form-group">
                <label className="form-label">Horário de atendimento</label>
                <input className="form-input" {...register('workingHours')} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" {...register('instagram')} />
              </div>
              <div className="form-group">
                <label className="form-label">Facebook</label>
                <input className="form-input" {...register('facebook')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Foto</label>
              {service.photoURL && !removePhoto ? (
                <div style={{ marginBottom: '.5rem' }}>
                  <img src={service.photoURL} alt="foto atual" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: '.4rem' }} />
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff' }} onClick={() => setRemovePhoto(true)}>
                    Remover foto
                  </button>
                </div>
              ) : removePhoto ? (
                <div style={{ marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Foto será removida ao salvar.</span>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setRemovePhoto(false)}>Desfazer</button>
                </div>
              ) : null}
              {!removePhoto && <input className="form-input" type="file" accept="image/*" onChange={e => { setPhotoFile(e.target.files[0]); setRemovePhoto(false) }} />}
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/servicos/${id}`)}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
