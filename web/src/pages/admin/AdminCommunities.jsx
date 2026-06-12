import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDocs, collection, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import toast from 'react-hot-toast'
import { HiPlus, HiSearch, HiTrash, HiPencil } from 'react-icons/hi'

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    const snap = await getDocs(collection(db, 'communities'))
    setCommunities(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleActive(id, current) {
    await updateDoc(doc(db, 'communities', id), { isActive: !current })
    toast.success(!current ? 'Comunidade ativada.' : 'Comunidade desativada.')
    load()
  }

  async function handleDelete(id, name) {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return
    await deleteDoc(doc(db, 'communities', id))
    toast.success('Comunidade excluída.')
    load()
  }

  const filtered = communities.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Comunidades</h1>
            <p>Gerencie todas as comunidades da plataforma</p>
          </div>
          <Link to="/comunidades/nova" className="btn btn-primary"><HiPlus /> Nova Comunidade</Link>
        </div>
      </div>

      <div className="search-box" style={{ marginBottom: '1.5rem', maxWidth: 380 }}>
        <HiSearch className="search-icon" size={18} />
        <input className="form-input" style={{ paddingLeft: '2.5rem' }}
          placeholder="Buscar comunidade..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {['Comunidade', 'Membros', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '.875rem 1.25rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: c.logoURL ? `url(${c.logoURL}) center/cover` : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                          {!c.logoURL && c.name?.[0]}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '.88rem' }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '.875rem 1.25rem', fontSize: '.85rem', color: 'var(--text-muted)' }}>{c.memberCount || 0}</td>
                    <td style={{ padding: '.875rem 1.25rem' }}>
                      <span className={`badge ${c.isActive ? 'badge-success' : 'badge-error'}`}>{c.isActive ? 'Ativa' : 'Inativa'}</span>
                    </td>
                    <td style={{ padding: '.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        <Link to={`/comunidades/${c.id}`} className="btn btn-secondary btn-sm">Ver</Link>
                        <button className="btn btn-outline btn-sm" onClick={() => toggleActive(c.id, c.isActive)}>
                          {c.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
