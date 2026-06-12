import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { createCompany } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['Comércio', 'Alimentação', 'Saúde', 'Educação', 'Tecnologia', 'Serviços', 'Beleza', 'Transporte', 'Outros']
const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export default function CompanyCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const communityId = searchParams.get('community') || ''
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { communityId } })

  async function onSubmit(data) {
    setLoading(true)
    try {
      const id = await createCompany(data, logoFile, photoFile, user.uid)
      toast.success('Empresa cadastrada! Aguarde aprovação.')
      navigate(`/empresas/${id}`)
    } catch {
      toast.error('Erro ao cadastrar empresa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Cadastrar Empresa</h1>
        <p>Divulgue sua empresa na comunidade</p>
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
                <input className="form-input" placeholder="00.000.000/0000-00" {...register('cnpj')} />
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
              <textarea className="form-input" rows={4} placeholder="Descreva sua empresa..."
                {...register('description')} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-input" placeholder="(00) 00000-0000" {...register('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp</label>
                <input className="form-input" placeholder="(00) 00000-0000" {...register('whatsapp')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-input" type="email" {...register('email')} />
            </div>

            <div className="form-group">
              <label className="form-label">Endereço completo</label>
              <input className="form-input" placeholder="Rua, número, bairro, cidade - UF" {...register('address')} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Site</label>
                <input className="form-input" placeholder="https://..." {...register('website')} />
              </div>
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" placeholder="@empresa" {...register('instagram')} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Logo</label>
                <input className="form-input" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label className="form-label">Foto da fachada</label>
                <input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
              </div>
            </div>

            <input type="hidden" {...register('communityId')} />

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Cadastrar Empresa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
