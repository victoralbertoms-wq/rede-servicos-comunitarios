import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStats, getPendingItems, updateService } from '../../services/firestoreService'
import { doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { updateDoc as fbUpdateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { HiUsers, HiUserGroup, HiBriefcase, HiOfficeBuilding, HiStar, HiCheck, HiX } from 'react-icons/hi'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

async function approveItem(col, id) {
  await fbUpdateDoc(doc(db, col, id), { status: 'approved' })
}

async function rejectItem(col, id) {
  await fbUpdateDoc(doc(db, col, id), { status: 'rejected' })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState({ services: [], companies: [], members: [] })
  const [loading, setLoading] = useState(true)

  async function load() {
    const [s, p] = await Promise.all([getAdminStats(), getPendingItems()])
    setStats(s)
    setPending(p)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleApprove(col, id) {
    await approveItem(col, id)
    toast.success('Aprovado!')
    load()
  }

  async function handleReject(col, id) {
    await rejectItem(col, id)
    toast.success('Rejeitado.')
    load()
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>

  const chartData = {
    labels: ['Usuários', 'Comunidades', 'Serviços', 'Empresas', 'Avaliações'],
    datasets: [{
      label: 'Total',
      data: [stats.users, stats.communities, stats.services, stats.companies, stats.reviews],
      backgroundColor: ['#4f46e5', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'],
      borderRadius: 8,
    }]
  }

  const statCards = [
    { icon: HiUsers, label: 'Usuários', value: stats.users, color: '#4f46e5', to: '/admin/usuarios' },
    { icon: HiUserGroup, label: 'Comunidades', value: stats.communities, color: '#0ea5e9', to: '/admin/comunidades' },
    { icon: HiBriefcase, label: 'Serviços', value: stats.services, color: '#22c55e', to: '/servicos' },
    { icon: HiOfficeBuilding, label: 'Empresas', value: stats.companies, color: '#f59e0b', to: '/empresas' },
    { icon: HiStar, label: 'Avaliações', value: stats.reviews, color: '#ef4444', to: null },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Painel Administrativo</h1>
        <p>Gerencie o sistema completo da plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {statCards.slice(0, 4).map(({ icon: Icon, label, value, color, to }) => (
          <div key={label} className="stat-card" style={{ cursor: to ? 'pointer' : 'default' }} onClick={() => to && (window.location.href = to)}>
            <div className="stat-icon" style={{ background: `${color}18` }}>
              <Icon size={24} style={{ color }} />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Visão Geral</h2>
        <Bar data={chartData} options={{
          responsive: true, plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
        }} />
      </div>

      {/* Pending items */}
      <div className="grid-2">
        {/* Pending services */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Serviços Pendentes</h3>
            <span className="badge badge-warning">{pending.services.length}</span>
          </div>
          <div>
            {pending.services.length === 0 ? (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.88rem' }}>Nenhum pendente</p>
            ) : (
              pending.services.map(s => (
                <div key={s.id} style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontWeight: 600, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{s.category}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                    <button className="btn-icon btn-sm" style={{ color: 'var(--success)' }} onClick={() => handleApprove('services', s.id)} title="Aprovar">
                      <HiCheck />
                    </button>
                    <button className="btn-icon btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleReject('services', s.id)} title="Rejeitar">
                      <HiX />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending companies */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Empresas Pendentes</h3>
            <span className="badge badge-warning">{pending.companies.length}</span>
          </div>
          <div>
            {pending.companies.length === 0 ? (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.88rem' }}>Nenhuma pendente</p>
            ) : (
              pending.companies.map(c => (
                <div key={c.id} style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontWeight: 600, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{c.category}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                    <button className="btn-icon btn-sm" style={{ color: 'var(--success)' }} onClick={() => handleApprove('companies', c.id)} title="Aprovar">
                      <HiCheck />
                    </button>
                    <button className="btn-icon btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleReject('companies', c.id)} title="Rejeitar">
                      <HiX />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin links */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <Link to="/admin/usuarios" className="btn btn-secondary">Gerenciar Usuários</Link>
        <Link to="/admin/comunidades" className="btn btn-secondary">Gerenciar Comunidades</Link>
        <Link to="/comunidades/nova" className="btn btn-primary">+ Nova Comunidade</Link>
      </div>
    </div>
  )
}
