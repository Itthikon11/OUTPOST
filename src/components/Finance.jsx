import React, { useState } from 'react'
import { useStore, fmt, storeName } from '../store.jsx'

const today = new Date().toISOString().slice(0, 10)

export default function Finance({ onAdd }) {
  const { stores, transactions, activeStore, deleteTransaction } = useStore()
  const [tab, setTab] = useState('all') // all | income | expense

  const scoped = transactions.filter((t) => activeStore === 'all' || t.store === activeStore)

  const income = scoped.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expense = scoped.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const profit = income - expense

  // สรุปเงินสดวันนี้
  const todayTx = scoped.filter((t) => t.date === today)
  const todayIn = todayTx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const todayOut = todayTx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)

  const list = scoped
    .filter((t) => tab === 'all' || t.type === tab)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <>
      <div className="section-head">
        <div>
          <h2>รายรับ-รายจ่าย</h2>
          <div className="sub">{activeStore === 'all' ? 'รวมทุกร้าน' : storeName(stores, activeStore)}</div>
        </div>
        <button className="btn btn-sm btn-primary" onClick={onAdd}>＋ เพิ่ม</button>
      </div>

      {/* สรุปกำไรสุทธิ */}
      <div className="card card-dark">
        <div className="label muted" style={{ fontSize: 13 }}>กำไรสุทธิสะสม</div>
        <div style={{ fontSize: 30, fontWeight: 800, margin: '6px 0 14px', color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {fmt(profit)}
        </div>
        <div className="row-between">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>รายรับ</div>
            <div style={{ fontWeight: 700, color: 'var(--green)' }}>{fmt(income)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="muted" style={{ fontSize: 12 }}>รายจ่าย</div>
            <div style={{ fontWeight: 700, color: 'var(--red)' }}>{fmt(expense)}</div>
          </div>
        </div>
      </div>

      {/* สรุปเงินสดสิ้นวัน */}
      <div className="section-head">
        <div>
          <h2>ปิดยอดเงินสดวันนี้</h2>
          <div className="sub">กระทบยอดเงินในลิ้นชัก</div>
        </div>
        <span className="pill">🧮 {todayTx.length} รายการ</span>
      </div>
      <div className="card">
        <div className="row-between" style={{ padding: '4px 0' }}>
          <span className="muted">💵 เงินเข้า</span>
          <span style={{ fontWeight: 700, color: 'var(--green)' }}>+{fmt(todayIn)}</span>
        </div>
        <div className="row-between" style={{ padding: '4px 0' }}>
          <span className="muted">🧾 เงินออก</span>
          <span style={{ fontWeight: 700, color: 'var(--red)' }}>−{fmt(todayOut)}</span>
        </div>
        <div className="row-between" style={{ padding: '10px 0 4px', borderTop: '1px solid var(--border)', marginTop: 6 }}>
          <span style={{ fontWeight: 700 }}>เงินสดคงเหลือควรมี</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>{fmt(todayIn - todayOut)}</span>
        </div>
      </div>

      {/* รายการ */}
      <div className="section-head">
        <h2>ประวัติรายการ</h2>
      </div>
      <div className="seg" style={{ marginBottom: 14 }}>
        {[['all', 'ทั้งหมด'], ['income', 'รายรับ'], ['expense', 'รายจ่าย']].map(([id, l]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      <div className="card">
        {list.length === 0 ? (
          <div className="empty"><div className="big">📭</div>ยังไม่มีรายการ</div>
        ) : (
          list.map((t) => (
            <div className="tx" key={t.id}>
              <div className="icon" style={{ background: t.type === 'income' ? 'var(--green-soft)' : 'var(--red-soft)' }}>
                {t.type === 'income' ? '💵' : '🧾'}
              </div>
              <div className="meta">
                <div className="t">{t.category}</div>
                <div className="d">
                  {activeStore === 'all' && storeName(stores, t.store) + ' · '}
                  {t.date}{t.note ? ' · ' + t.note : ''}
                </div>
              </div>
              <div className="val" style={{ color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
              </div>
              <button
                className="btn btn-sm btn-ghost btn-danger"
                style={{ padding: '4px 8px' }}
                onClick={() => deleteTransaction(t.id)}
                aria-label="ลบ"
              >✕</button>
            </div>
          ))
        )}
      </div>
    </>
  )
}
