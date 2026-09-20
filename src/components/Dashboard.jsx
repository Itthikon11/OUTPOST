import React from 'react'
import { useStore, fmt } from '../store.jsx'

export default function Dashboard({ onQuickAdd, goTab, onAddStore }) {
  const { stores, products, transactions, activeStore } = useStore()

  const scoped = activeStore === 'all'
    ? transactions
    : transactions.filter((t) => t.store === activeStore)

  const income = scoped.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expense = scoped.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const profit = income - expense

  // ยอดขายต่อร้าน (สำหรับกราฟเปรียบเทียบ)
  const perStore = stores.map((s) => {
    const inc = transactions
      .filter((t) => t.store === s.id && t.type === 'income')
      .reduce((a, t) => a + t.amount, 0)
    return { ...s, inc }
  })
  const maxInc = Math.max(...perStore.map((s) => s.inc), 1)
  const topStore = [...perStore].sort((a, b) => b.inc - a.inc)[0]

  // แจ้งเตือนสินค้าใกล้หมด/หมด
  const alerts = products
    .filter((p) => (activeStore === 'all' || p.store === activeStore) && p.qty <= p.min)
    .map((p) => ({ p, store: stores.find((s) => s.id === p.store), out: p.qty === 0 }))
    .sort((a, b) => a.p.qty - b.p.qty)

  return (
    <>
      <div className="section-head">
        <div>
          <h2>ภาพรวม{activeStore === 'all' ? 'ทุกร้าน' : ''}</h2>
          <div className="sub">
            {activeStore === 'all'
              ? `รวม ${stores.length} ร้าน · อัปเดตล่าสุดวันนี้`
              : stores.find((s) => s.id === activeStore)?.name}
          </div>
        </div>
        <span className="pill">📅 วันนี้</span>
      </div>

      {/* KPI */}
      <div className="grid grid-2">
        <div className="card kpi">
          <div className="label">💵 ยอดขายรวม</div>
          <div className="value">{fmt(income)}</div>
          <div className="delta up">▲ 12.4% จากสัปดาห์ก่อน</div>
          <div className="ic ic-green">💵</div>
        </div>
        <div className="card kpi">
          <div className="label">📈 กำไรสุทธิ</div>
          <div className="value" style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(profit)}</div>
          <div className={'delta ' + (profit >= 0 ? 'up' : 'down')}>
            {profit >= 0 ? '▲ กำไร' : '▼ ขาดทุน'} · มาร์จิ้น {income ? Math.round((profit / income) * 100) : 0}%
          </div>
          <div className="ic ic-blue">📈</div>
        </div>
        <div className="card kpi">
          <div className="label">🧾 ค่าใช้จ่ายรวม</div>
          <div className="value">{fmt(expense)}</div>
          <div className="delta down">▲ 3.1% จากสัปดาห์ก่อน</div>
          <div className="ic ic-red">🧾</div>
        </div>
        <div className="card kpi">
          <div className="label">⚠️ แจ้งเตือน</div>
          <div className="value">{alerts.length} <span style={{ fontSize: 14, color: 'var(--muted)' }}>รายการ</span></div>
          <div className="delta down">สินค้าใกล้หมด/หมดสต็อก</div>
          <div className="ic ic-amber">⚠️</div>
        </div>
      </div>

      {/* Store comparison */}
      {activeStore === 'all' && (
        <>
          <div className="section-head">
            <div>
              <h2>เปรียบเทียบร้าน</h2>
              <div className="sub">ยอดขายสะสมแต่ละร้าน</div>
            </div>
            <span className="pill">🏆 {topStore.emoji} {topStore.name}</span>
          </div>
          <div className="card">
            {perStore.map((s) => (
              <div className="cmp-item" key={s.id}>
                <div className="cmp-top">
                  <span className="name"><span>{s.emoji}</span>{s.name}</span>
                  <span className="amt">{fmt(s.inc)}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: (s.inc / maxInc) * 100 + '%', background: s.color }} />
                </div>
              </div>
            ))}
            <button className="btn btn-sm btn-ghost btn-block" style={{ marginTop: 8 }} onClick={onAddStore}>
              ➕ เพิ่มร้านใหม่
            </button>
          </div>
        </>
      )}

      {/* Quick alerts */}
      <div className="section-head">
        <div>
          <h2>แจ้งเตือนด่วน</h2>
          <div className="sub">สินค้าที่ต้องเติมสต็อก</div>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={() => goTab('stock')}>ดูทั้งหมด →</button>
      </div>
      <div className="card">
        {alerts.length === 0 ? (
          <div className="empty"><div className="big">✅</div>สต็อกทุกอย่างเพียงพอ</div>
        ) : (
          alerts.slice(0, 5).map((a) => (
            <div className="alert-row" key={a.p.id}>
              <div className="badge" style={{ background: a.out ? 'var(--red-soft)' : 'var(--amber-soft)' }}>
                {a.p.emoji}
              </div>
              <div className="txt">
                <div className="t">{a.p.name}</div>
                <div className="d">{a.store?.emoji} {a.store?.name}</div>
              </div>
              <span className={'tag ' + (a.out ? 'tag-low' : 'tag-warn')}>
                {a.out ? 'หมดสต็อก' : `เหลือ ${a.p.qty} ${a.p.unit}`}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="section-head">
        <h2>บันทึกด่วน</h2>
      </div>
      <button className="btn btn-primary btn-block" onClick={onQuickAdd}>
        ＋ บันทึกรายรับ / รายจ่าย
      </button>
      <div className="hint">ข้อมูลจำลอง (mock) · บันทึกไว้ในเครื่องผ่าน localStorage</div>
    </>
  )
}
