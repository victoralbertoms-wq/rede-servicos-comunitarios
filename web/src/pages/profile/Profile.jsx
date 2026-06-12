import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from '../../firebase/config'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { HiUser, HiMail, HiPhone, HiPencil } from 'react-icons/hi'

export default function Profile() {
  const { user, userProfile, fetchUserProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
    }
  })

  async function onSubmit({ displayName, phone }) {
    setLoading(true)
    try {
      let photoURL = userProfile?.photoURL || ''
      if (photoFile) {
        photoURL = await uploadToCloudinary(photoFile, 'users')
      }
      await updateProfile(auth.currentUser, { displayName, photoURL })
      await updateDoc(doc(db, 'users', user.uid), { displayName, phone, photoURL, updatedAt: new Date() })
      await fetchUserProfile(user.uid)
      toast.success('Perfil atualizado!')
      setEditing(false)
    } catch {
      toast.error('Erro ao atualizar perfil.')
    } finally {
      setLoading(false)
    }
  }

  const roleBadge = { admin: { label: 'Administrador', cls: 'badge-error' }, community_admin: { label: 'Admin Comunidade', cls: 'badge-warning' }, user: { label: 'Membro', cls: 'badge-primary' } }
  const rb = roleBadge[userProfile?.role] || roleBadge.user

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Meu Perfil</h1>
      </div>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,var(--primary),var(--secondary))', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#fff' }}>
          <div className="avatar-placeholder" style={{ width: 80, height: 80, fontSize: 32, borderRadius: '50%', border: '4px solid rgba(255,255,255,.4)' }}>
            {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.3rem' }}>{userProfile?.displayName}</h2>
            <p style={{ opacity: .9, fontSize: '.9rem' }}>{userProfile?.email}</p>
            <span className={`badge ${rb.cls}`} style={{ marginTop: '.5rem' }}>{rb.label}</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {!editing ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: 'var(--text-muted)', fontSize: '.9rem' }}>
                  <HiUser /> <span>{userProfile?.displayName || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: 'var(--text-muted)', fontSize: '.9rem' }}>
                  <HiMail /> <span>{userProfile?.email || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: 'var(--text-muted)', fontSize: '.9rem' }}>
                  <HiPhone /> <span>{userProfile?.phone || 'Não informado'}</span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '1.25rem' }} onClick={() => setEditing(true)}>
                <HiPencil /> Editar perfil
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input className={`form-input ${errors.displayName ? 'error' : ''}`}
                  {...register('displayName', { required: 'Campo obrigatório' })} />
                {errors.displayName && <span className="form-error">{errors.displayName.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-input" placeholder="(00) 00000-0000" {...register('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Foto de perfil</label>
                <input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancelar</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Salvar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-2">
        {[
          { label: 'Comunidades', value: userProfile?.communities?.length || 0, color: 'var(--primary)' },
          { label: 'Favoritos', value: (userProfile?.favorites?.services?.length || 0) + (userProfile?.favorites?.companies?.length || 0), color: 'var(--error)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '.88rem' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
