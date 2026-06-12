import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { createCommunity } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function CommunityCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit(data) {
    setLoading(true)
    try {
      const id = await createCommunity({ ...data, adminIds: [user.uid] }, logoFile, photoFile)
      toast.success('Comunidade criada com sucesso!')
      navigate(`/comunidades/${id}`)
    } catch {
      toast.error('Erro ao criar comunidade.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Nova Comunidade</h1>
        <p>Crie uma comunidade privada para seus membros</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Nome da comunidade *</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Ex: Centro Espírita Fraternidade Humana"
                {...register('name', { required: 'Campo obrigatório' })} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Descrição *</label>
              <textarea className={`form-input ${errors.description ? 'error' : ''}`} rows={3} placeholder="Descreva sua comunidade..."
                {...register('description', { required: 'Campo obrigatório' })} />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Senha de acesso</label>
              <input className="form-input" type="password" placeholder="Senha para entrar na comunidade"
                {...register('password')} />
              <span className="form-hint">Deixe em branco para comunidade aberta</span>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Logo</label>
                <input className="form-input" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label className="form-label">Foto de capa</label>
                <input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Criar Comunidade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
