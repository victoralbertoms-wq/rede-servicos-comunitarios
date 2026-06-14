import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getCommunity, updateCommunity } from '../../services/firestoreService'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function CommunityEdit() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [community, setCommunity] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [removePhoto, setRemovePhoto] = useState(false)
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
      else if (removeLogo) updates.logoURL = ''
      if (photoFile) updates.photoURL = await uploadToCloudinary(photoFile, 'communities')
      else if (removePhoto) updates.photoURL = ''
      await updateCommunity(id, updates)
      toast.success('Comunidade atualizada!')
      navigate(`/comunidades/${id}`)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao atualizar comunidade.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
  if (!community) return <div className="empty-state"><h3>Comunidade não encontrada</h3></div>

  const canEdit = isAdmin || (user && community.adminIds?.includes(user.uid))
  if (!canEdit) return <div className="empty-state"><h3>Acesso negado</h3></div>

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
                <label className="form-label">Logo</label>
                {community.logoURL && !removeLogo ? (
                  <div style={{ marginBottom: '.5rem' }}>
                    <img src={community.logoURL} alt="logo atual" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', display: 'block', marginBottom: '.4rem' }} />
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
                {community.photoURL && !removePhoto ? (
                  <div style={{ marginBottom: '.5rem' }}>
                    <img src={community.photoURL} alt="capa atual" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: '.4rem' }} />
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
