import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from '../../firebase/config'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { getCurriculo, saveCurriculo } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { HiUser, HiMail, HiPhone, HiPencil, HiPlus, HiTrash } from 'react-icons/hi'

const DISPONIBILIDADE_OPTIONS = ['Freelancer', 'CLT', 'Autônomo', 'PJ', 'Buscando oportunidades', 'Não disponível']

function SkillsInput({ value, onChange }) {
  const [input, setInput] = useState('')
  const skills = value || []

  function addSkill() {
    const trimmed = input.trim()
    if (!trimmed || skills.includes(trimmed)) { setInput(''); return }
    onChange([...skills, trimmed])
    setInput('')
  }

  function removeSkill(s) {
    onChange(skills.filter(x => x !== s))
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
        <input
          className="form-input"
          style={{ flex: 1 }}
          placeholder="Digite uma habilidade e pressione Enter..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={addSkill}>
          <HiPlus /> Adicionar
        </button>
      </div>
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
          {skills.map(s => (
            <span key={s} style={{
              display: 'inline-flex', alignItems: 'center', gap: '.3rem',
              background: 'var(--primary-alpha, rgba(79,70,229,.1))', color: 'var(--primary)',
              borderRadius: 20, padding: '3px 10px', fontSize: '.78rem', fontWeight: 500,
            }}>
              {s}
              <button type="button" onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'inherit', opacity: .6 }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ListSection({ title, items, onAdd, onRemove, renderItem }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
        <p style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{title}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={onAdd} style={{ fontSize: '.75rem' }}>
          <HiPlus /> Adicionar
        </button>
      </div>
      {items.length === 0 ? (
        <p style={{ fontSize: '.82rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Nenhum item adicionado</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {items.map((item, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.875rem 1rem', position: 'relative' }}>
              {renderItem(item, i)}
              <button type="button" onClick={() => onRemove(i)} style={{
                position: 'absolute', top: '.5rem', right: '.5rem',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: 4,
              }}>
                <HiTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CurriculoTab({ userId }) {
  const [curriculo, setCurriculo] = useState({
    titulo: '', area: '', resumo: '', disponibilidade: '', linkedin: '',
    habilidades: [], experiencias: [], formacao: [], cursos: [],
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurriculo(userId)
      .then(data => { if (data) setCurriculo(prev => ({ ...prev, ...data })) })
      .finally(() => setLoading(false))
  }, [userId])

  function setField(field, value) {
    setCurriculo(prev => ({ ...prev, [field]: value }))
  }

  function setListItem(field, index, key, value) {
    setCurriculo(prev => {
      const arr = [...prev[field]]
      arr[index] = { ...arr[index], [key]: value }
      return { ...prev, [field]: arr }
    })
  }

  function addExp() {
    setField('experiencias', [...curriculo.experiencias, { empresa: '', cargo: '', inicio: '', fim: '', descricao: '' }])
  }
  function addFormacao() {
    setField('formacao', [...curriculo.formacao, { instituicao: '', curso: '', inicio: '', fim: '' }])
  }
  function addCurso() {
    setField('cursos', [...curriculo.cursos, { nome: '', instituicao: '', ano: '' }])
  }

  function removeItem(field, index) {
    setField(field, curriculo[field].filter((_, i) => i !== index))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await saveCurriculo(userId, curriculo)
      toast.success('Currículo salvo!')
    } catch {
      toast.error('Erro ao salvar currículo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>

  return (
    <form onSubmit={handleSave}>
      {/* Informações básicas */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.6rem' }}>Informações Gerais</p>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Cargo / Título profissional</label>
            <input className="form-input" placeholder="ex: Eletricista, Desenvolvedor Web..." value={curriculo.titulo} onChange={e => setField('titulo', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Área de atuação</label>
            <input className="form-input" placeholder="ex: Construção, Tecnologia..." value={curriculo.area} onChange={e => setField('area', e.target.value)} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Resumo profissional</label>
          <textarea className="form-input" rows={3} placeholder="Uma breve descrição sobre você e sua experiência..." value={curriculo.resumo} onChange={e => setField('resumo', e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Disponibilidade</label>
            <select className="form-input" value={curriculo.disponibilidade} onChange={e => setField('disponibilidade', e.target.value)}>
              <option value="">Selecione...</option>
              {DISPONIBILIDADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">LinkedIn (opcional)</label>
            <input className="form-input" placeholder="linkedin.com/in/seuperfil" value={curriculo.linkedin} onChange={e => setField('linkedin', e.target.value)} />
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

      {/* Habilidades */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.6rem' }}>Habilidades</p>
        <SkillsInput value={curriculo.habilidades} onChange={v => setField('habilidades', v)} />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

      {/* Experiência */}
      <ListSection
        title="Experiência Profissional"
        items={curriculo.experiencias}
        onAdd={addExp}
        onRemove={i => removeItem('experiencias', i)}
        renderItem={(item, i) => (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Empresa</label>
              <input className="form-input" placeholder="Nome da empresa" value={item.empresa} onChange={e => setListItem('experiencias', i, 'empresa', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Cargo</label>
              <input className="form-input" placeholder="Cargo / Função" value={item.cargo} onChange={e => setListItem('experiencias', i, 'cargo', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Início</label>
              <input className="form-input" placeholder="Jan 2023" value={item.inicio} onChange={e => setListItem('experiencias', i, 'inicio', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Fim</label>
              <input className="form-input" placeholder="Atual" value={item.fim} onChange={e => setListItem('experiencias', i, 'fim', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Descrição (opcional)</label>
              <textarea className="form-input" rows={2} placeholder="Descreva suas atividades..." value={item.descricao} onChange={e => setListItem('experiencias', i, 'descricao', e.target.value)} style={{ resize: 'none' }} />
            </div>
          </div>
        )}
      />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

      {/* Formação */}
      <ListSection
        title="Formação Acadêmica"
        items={curriculo.formacao}
        onAdd={addFormacao}
        onRemove={i => removeItem('formacao', i)}
        renderItem={(item, i) => (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Instituição</label>
              <input className="form-input" placeholder="Nome da escola / faculdade" value={item.instituicao} onChange={e => setListItem('formacao', i, 'instituicao', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Curso</label>
              <input className="form-input" placeholder="Nome do curso" value={item.curso} onChange={e => setListItem('formacao', i, 'curso', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Início</label>
              <input className="form-input" placeholder="2019" value={item.inicio} onChange={e => setListItem('formacao', i, 'inicio', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Conclusão</label>
              <input className="form-input" placeholder="2022 ou Em andamento" value={item.fim} onChange={e => setListItem('formacao', i, 'fim', e.target.value)} />
            </div>
          </div>
        )}
      />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

      {/* Cursos */}
      <ListSection
        title="Cursos e Certificações"
        items={curriculo.cursos}
        onAdd={addCurso}
        onRemove={i => removeItem('cursos', i)}
        renderItem={(item, i) => (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Nome do curso</label>
              <input className="form-input" placeholder="React Avançado..." value={item.nome} onChange={e => setListItem('cursos', i, 'nome', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Instituição</label>
              <input className="form-input" placeholder="Alura, Udemy..." value={item.instituicao} onChange={e => setListItem('cursos', i, 'instituicao', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '.75rem' }}>Ano</label>
              <input className="form-input" placeholder="2024" value={item.ano} onChange={e => setListItem('cursos', i, 'ano', e.target.value)} />
            </div>
          </div>
        )}
      />

      <div style={{ marginTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Salvar Currículo'}
        </button>
      </div>
    </form>
  )
}

export default function Profile() {
  const { user, userProfile, fetchUserProfile } = useAuth()
  const [tab, setTab] = useState('perfil')
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
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
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
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${tab === 'perfil' ? 'active' : ''}`} onClick={() => setTab('perfil')}>Perfil</button>
        <button className={`tab ${tab === 'curriculo' ? 'active' : ''}`} onClick={() => setTab('curriculo')}>Currículo</button>
      </div>

      {tab === 'perfil' && (
        <>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
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
        </>
      )}

      {tab === 'curriculo' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <CurriculoTab userId={user.uid} />
        </div>
      )}
    </div>
  )
}
