import React, { useState } from 'react'
import { useStore } from './store.jsx'
import Dashboard from './components/Dashboard.jsx'
import Inventory from './components/Inventory.jsx'
import Finance from './components/Finance.jsx'
import Analytics from './components/Analytics.jsx'
import TxSheet from './components/TxSheet.jsx'
import StoreSheet from './components/StoreSheet.jsx'

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
  const [showStore, setShowStore] = useState(false)

  const current = stores.find((s) => s.id === activeStore)

  // ยังไม่มีร้านเลย
  if (stores.length === 0) {
    return (
      <div className="app">
        <header className="topbar">
          <div className="brand"><img src="/images/LOGO.png" className="logo-img" alt="OUTPOST" /><span>OUTPOST</span></div>
        </header>
        <div className="empty" style={{ marginTop: 80 }}>
          <div className="big">🏪</div>
          ยังไม่มีร้านในระบบ<br />เริ่มต้นด้วยการสร้างร้านแรกของคุณ
        </div>
        <button className="btn btn-primary btn-block" onClick={() => setShowStore(true)}>➕ สร้างร้านแรก</button>
        {showStore && <StoreSheet onClose={() => setShowStore(false)} />}
      </div>
    )
  }

  return (
    <div className="app">
      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <img src="/images/LOGO.png" className="logo-img" alt="OUTPOST" />
          <span>OUTPOST</span>
        </div>

        <label className="store-switch">
          <span className="dot" style={{ background: current ? current.color : '#8b5cf6' }} />
          <select value={activeStore} onChange={(e) => setActiveStore(e.target.value)}>
            <option value="all">ทุกร้าน ({stores.length})</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
            ))}
          </select>
        </label>

        <button className="icon-btn" onClick={() => setShowStore(true)} aria-label="สร้างร้านใหม่" title="สร้างร้านใหม่">＋</button>
      </header>

      {/* Views */}
      {tab === 'dash' && <Dashboard onQuickAdd={() => setShowTx(true)} goTab={setTab} onAddStore={() => setShowStore(true)} />}
      {tab === 'stock' && <Inventory />}
      {tab === 'money' && <Finance onAdd={() => setShowTx(true)} />}
      {tab === 'stats' && <Analytics />}

      {/* FAB — บันทึกด่วน */}
      <button className="fab" onClick={() => setShowTx(true)} aria-label="บันทึกรายการด่วน">＋</button>

      {/* Bottom nav */}
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span className="ti">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {showTx && <TxSheet onClose={() => setShowTx(false)} />}
      {showStore && <StoreSheet onClose={() => setShowStore(false)} />}
    </div>
  )
}
