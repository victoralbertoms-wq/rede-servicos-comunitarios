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
const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export default function ServiceEdit() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [service, setService] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getService(id).then(s => {
      if (!s) return navigate('/servicos')
      setService(s)
      reset(s)
    }).finally(() => setFetching(false))
  }, [id, reset, navigate])

  async function onSubmit(data) {
    if (!isAdmin && service.userId !== user.uid) return toast.error('Sem permissão.')
    setLoading(true)
    try {
      const updates = { ...data }
      if (photoFile) updates.photoURL = await uploadToCloudinary(photoFile, 'services')
      await updateService(id, updates)
      toast.success('Serviço atualizado!')
      navigate(`/servicos/${id}`)
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar serviço.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Editar Serviço</h1>
        <p>Atualize as informações do seu serviço</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="form-group">
              <label className="form-label">Foto atual</label>
              {service?.photoURL
                ? <img src={service.photoURL} alt="foto atual" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, marginBottom: '.5rem' }} />
                : <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Sem foto</p>
              }
              <input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nome do profissional *</label>
                <input className={`form-input ${errors.name ? 'error' : ''}`} {...register('name', { required: 'Obrigatório' })} />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select className={`form-input ${errors.category ? 'error' : ''}`} {...register('category', { required: 'Obrigatório' })}>
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
                <input className={`form-input ${errors.city ? 'error' : ''}`} {...register('city', { required: 'Obrigatório' })} />
                {errors.city && <span className="form-error">{errors.city.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Estado *</label>
                <select className={`form-input ${errors.state ? 'error' : ''}`} {...register('state', { required: 'Obrigatório' })}>
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
