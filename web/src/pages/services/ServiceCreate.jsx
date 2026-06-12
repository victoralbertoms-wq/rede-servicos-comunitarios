import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { createService } from '../../services/firestoreService'
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

export default function ServiceCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const communityId = searchParams.get('community') || ''
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { communityId } })

  async function onSubmit(data) {
    setLoading(true)
    try {
      const id = await createService(data, photoFile, user.uid)
      toast.success('Serviço cadastrado! Aguarde aprovação.')
      navigate(`/servicos/${id}`)
    } catch {
      toast.error('Erro ao cadastrar serviço.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Cadastrar Serviço</h1>
        <p>Divulgue seu serviço profissional na comunidade</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nome do profissional *</label>
                <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Seu nome"
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
              <input className="form-input" placeholder="Ex: Instalações elétricas residenciais"
                {...register('specialty')} />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea className="form-input" rows={4} placeholder="Descreva seus serviços..."
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

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Cidade *</label>
                <input className={`form-input ${errors.city ? 'error' : ''}`} placeholder="Sua cidade"
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
              <input className="form-input" placeholder="Rua, número, bairro" {...register('address')} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Site</label>
                <input className="form-input" placeholder="https://..." {...register('website')} />
              </div>
              <div className="form-group">
                <label className="form-label">Horário de atendimento</label>
                <input className="form-input" placeholder="Seg-Sex 8h-18h" {...register('workingHours')} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" placeholder="@seu_instagram" {...register('instagram')} />
              </div>
              <div className="form-group">
                <label className="form-label">Facebook</label>
                <input className="form-input" placeholder="facebook.com/..." {...register('facebook')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Foto do profissional</label>
              <input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
            </div>

            <input type="hidden" {...register('communityId')} />

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Cadastrar Serviço'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
