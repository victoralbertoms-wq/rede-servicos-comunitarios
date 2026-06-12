import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getCompany, updateCompany } from '../../services/firestoreService'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['Comércio', 'Alimentação', 'Saúde', 'Educação', 'Tecnologia', 'Serviços', 'Beleza', 'Transporte', 'Outros']
const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export default function CompanyEdit() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [company, setCompany] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getCompany(id).then(c => {
      if (!c) return navigate('/empresas')
      setCompany(c)
      reset(c)
    }).finally(() => setFetching(false))
  }, [id, reset, navigate])

  async function onSubmit(data) {
    if (!isAdmin && company.userId !== user.uid) return toast.error('Sem permissão.')
    setLoading(true)
    try {
      const updates = { ...data }
      if (logoFile) updates.logoURL = await uploadToCloudinary(logoFile, 'companies')
      if (photoFile) updates.photoURL = await uploadToCloudinary(photoFile, 'companies')
      await updateCompany(id, updates)
      toast.success('Empresa atualizada!')
      navigate(`/empresas/${id}`)
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar empresa.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Editar Empresa</h1>
        <p>Atualize as informações da empresa</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Logo atual</label>
                {company?.logoURL
                  ? <img src={company.logoURL} alt="logo" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, marginBottom: '.5rem', display: 'block' }} />
                  : <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Sem logo</p>
                }
                <input className="form-input" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label className="form-label">Foto de capa atual</label>
                {company?.photoURL
                  ? <img src={company.photoURL} alt="capa" style={{ width: '100%', height: 64, objectFit: 'cover', borderRadius: 10, marginBottom: '.5rem', display: 'block' }} />
                  : <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Sem foto</p>
                }
                <input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nome da empresa *</label>
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
              <label className="form-label">Descrição</label>
              <textarea className="form-input" rows={3} {...register('description')} />
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
                <label className="form-label">Cidade</label>
                <input className="form-input" {...register('city')} />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-input" {...register('state')}>
                  <option value="">UF</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Endereço</label>
              <input className="form-input" {...register('address')} />
            </div>

            <div className="form-group">
              <label className="form-label">Site</label>
              <input className="form-input" {...register('website')} />
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/empresas/${id}`)}>Cancelar</button>
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
