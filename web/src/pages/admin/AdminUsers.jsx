import { useState, useEffect } from 'react'
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import toast from 'react-hot-toast'
import { HiSearch, HiShieldCheck, HiUser, HiBan } from 'react-icons/hi'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function changeRole(userId, role) {
    await updateDoc(doc(db, 'users', userId), { role })
    toast.success('Papel atualizado!')
    load()
  }

  const filtered = users.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const roleColors = { admin: 'badge-error', community_admin: 'badge-warning', user: 'badge-primary' }
  const roleLabels = { admin: 'Administrador', community_admin: 'Admin Comunidade', user: 'Membro' }

  return (
    <div>
      <div className="page-header">
        <h1>Usuários</h1>
        <p>Gerencie todos os usuários da plataforma</p>
      </div>

      <div className="search-box" style={{ marginBottom: '1.5rem', maxWidth: 380 }}>
        <HiSearch className="search-icon" size={18} />
        <input className="form-input" style={{ paddingLeft: '2.5rem' }}
          placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {['Usuário', 'Email', 'Papel', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '.875rem 1.25rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div className="avatar-placeholder" style={{ width: 36, height: 36, borderRadius: '50%', fontSize: 14, flexShrink: 0, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {u.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '.88rem' }}>{u.displayName || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '.875rem 1.25rem', fontSize: '.85rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '.875rem 1.25rem' }}>
                      <span className={`badge ${roleColors[u.role] || 'badge-primary'}`}>{roleLabels[u.role] || u.role}</span>
                    </td>
                    <td style={{ padding: '.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        {u.role !== 'admin' && (
                          <button className="btn btn-outline btn-sm" onClick={() => changeRole(u.id, 'admin')} title="Tornar admin">
                            <HiShieldCheck /> Admin
                          </button>
                        )}
                        {u.role !== 'user' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => changeRole(u.id, 'user')} title="Tornar membro">
                            <HiUser /> Membro
                          </button>
                        )}
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
