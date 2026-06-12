import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getCommunity, updateCommunity } from '../../services/firestoreService'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function CommunityEdit() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [community, setCommunity] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getCommunity(id).then(c => {
      setCommunity(c)
      reset({ name: c.name, description: c.description, password: c.password || '' })
    }).finally(() => setFetching(false))
  }, [id, reset])

  async function onSubmit(data) {
    setLoading(true)
    try {
      const updates = { ...data }
      if (logoFile) updates.logoURL = await uploadToCloudinary(logoFile, 'communities')
      if (photoFile) updates.photoURL = await uploadToCloudinary(photoFile, 'communities')
      await updateCommunity(id, updates)
      toast.success('Comunidade atualizada!')
      navigate(`/comunidades/${id}`)
    } catch {
      toast.error('Erro ao atualizar comunidade.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) return <div className="empty-state"><h3>Acesso negado</h3></div>
  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
  if (!community) return <div className="empty-state"><h3>Comunidade não encontrada</h3></div>

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Editar Comunidade</h1>
        <p>Atualize as informações da comunidade</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Nome da comunidade *</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`}
                {...register('name', { required: 'Campo obrigatório' })} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Descrição *</label>
              <textarea className={`form-input ${errors.description ? 'error' : ''}`} rows={3}
                {...register('description', { required: 'Campo obrigatório' })} />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Senha de acesso</label>
              <input className="form-input" type="password" placeholder="Deixe em branco para manter a atual"
                {...register('password')} />
              <span className="form-hint">Deixe em branco para comunidade aberta</span>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nova Logo</label>
                {community.logoURL && (
                  <img src={community.logoURL} alt="logo atual" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', marginBottom: '.5rem', display: 'block' }} />
                )}
                <input className="form-input" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label className="form-label">Nova Foto de Capa</label>
                {community.photoURL && (
                  <img src={community.photoURL} alt="capa atual" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 8, marginBottom: '.5rem', display: 'block' }} />
                )}
                <input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/comunidades/${id}`)}>Cancelar</button>
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
