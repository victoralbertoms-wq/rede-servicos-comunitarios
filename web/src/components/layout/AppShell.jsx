import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-content">
        <TopHeader onMenuToggle={() => setSidebarOpen(true)} />
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
