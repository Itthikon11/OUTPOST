import React, { useState } from 'react'
import { useStore } from './store.jsx'
import Dashboard from './components/Dashboard.jsx'
import Inventory from './components/Inventory.jsx'
import Finance from './components/Finance.jsx'
import Analytics from './components/Analytics.jsx'
import TxSheet from './components/TxSheet.jsx'

const TABS = [
  { id: 'dash', label: 'ภาพรวม', icon: '🏠' },
  { id: 'stock', label: 'สต็อก', icon: '📦' },
  { id: 'money', label: 'การเงิน', icon: '💰' },
  { id: 'stats', label: 'สถิติ', icon: '📊' },
]

export default function App() {
  const { stores, activeStore, setActiveStore } = useStore()
  const [tab, setTab] = useState('dash')
  const [showTx, setShowTx] = useState(false)

  const current = stores.find((s) => s.id === activeStore)

  return (
    <div className="app">
      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <span className="logo">🛰️</span>
          <span>OUTPOST</span>
        </div>

        <label className="store-switch">
          <span
            className="dot"
            style={{ background: current ? current.color : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          />
          <select value={activeStore} onChange={(e) => setActiveStore(e.target.value)}>
            <option value="all">ทุกสาขา</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
      </header>

      {/* Views */}
      {tab === 'dash' && <Dashboard onQuickAdd={() => setShowTx(true)} goTab={setTab} />}
      {tab === 'stock' && <Inventory />}
      {tab === 'money' && <Finance onAdd={() => setShowTx(true)} />}
      {tab === 'stats' && <Analytics />}

      {/* FAB — บันทึกด่วน */}
      <button className="fab" onClick={() => setShowTx(true)} aria-label="บันทึกรายการด่วน">＋</button>

      {/* Bottom nav */}
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            <span className="ti">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Quick add sheet */}
      {showTx && <TxSheet onClose={() => setShowTx(false)} />}
    </div>
  )
}
