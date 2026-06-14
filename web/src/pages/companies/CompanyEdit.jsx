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
  const [removeLogo, setRemoveLogo] = useState(false)
  const [removePhoto, setRemovePhoto] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getCompany(id).then(c => {
      setCompany(c)
      reset({
        name: c.name, legalName: c.legalName, cnpj: c.cnpj, category: c.category,
        description: c.description, phone: c.phone, whatsapp: c.whatsapp,
        email: c.email, address: c.address, website: c.website, instagram: c.instagram,
        city: c.city, state: c.state,
      })
    }).finally(() => setFetching(false))
  }, [id, reset])

  async function onSubmit(data) {
    setLoading(true)
    try {
      const updates = { ...data }
      if (logoFile) updates.logoURL = await uploadToCloudinary(logoFile, 'companies')
      else if (removeLogo) updates.logoURL = ''
      if (photoFile) updates.photoURL = await uploadToCloudinary(photoFile, 'companies')
      else if (removePhoto) updates.photoURL = ''
      await updateCompany(id, updates)
      toast.success('Empresa atualizada!')
      navigate(`/empresas/${id}`)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao atualizar empresa.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
  if (!company) return <div className="empty-state"><h3>Empresa não encontrada</h3></div>

  const canEdit = isAdmin || company.userId === user?.uid
  if (!canEdit) return <div className="empty-state"><h3>Acesso negado</h3></div>

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Editar Empresa</h1>
        <p>Atualize as informações da sua empresa</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nome da empresa *</label>
                <input className={`form-input ${errors.name ? 'error' : ''}`}
                  {...register('name', { required: 'Campo obrigatório' })} />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Razão social</label>
                <input className="form-input" {...register('legalName')} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">CNPJ</label>
                <input className="form-input" {...register('cnpj')} />
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

            <div className="form-group">
              <label className="form-label">Endereço completo</label>
              <input className="form-input" {...register('address')} />
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

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Site</label>
                <input className="form-input" {...register('website')} />
              </div>
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" {...register('instagram')} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Logo</label>
                {company.logoURL && !removeLogo ? (
                  <div style={{ marginBottom: '.5rem' }}>
                    <img src={company.logoURL} alt="logo atual" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', display: 'block', marginBottom: '.4rem' }} />
                    <button type="button" className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff' }} onClick={() => setRemoveLogo(true)}>Remover</button>
                  </div>
                ) : removeLogo ? (
                  <div style={{ marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Será removida.</span>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setRemoveLogo(false)}>Desfazer</button>
                  </div>
                ) : null}
                {!removeLogo && <input className="form-input" type="file" accept="image/*" onChange={e => { setLogoFile(e.target.files[0]); setRemoveLogo(false) }} />}
              </div>
              <div className="form-group">
                <label className="form-label">Foto de Capa</label>
                {company.photoURL && !removePhoto ? (
                  <div style={{ marginBottom: '.5rem' }}>
                    <img src={company.photoURL} alt="foto atual" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: '.4rem' }} />
                    <button type="button" className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff' }} onClick={() => setRemovePhoto(true)}>Remover</button>
                  </div>
                ) : removePhoto ? (
                  <div style={{ marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Será removida.</span>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setRemovePhoto(false)}>Desfazer</button>
                  </div>
                ) : null}
                {!removePhoto && <input className="form-input" type="file" accept="image/*" onChange={e => { setPhotoFile(e.target.files[0]); setRemovePhoto(false) }} />}
              </div>
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
