import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import TransferSheet from './TransferSheet.jsx'

const FILTERS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'low', label: '⚠️ ใกล้หมด' },
  { id: 'ok', label: '✅ เพียงพอ' },
]

export default function Inventory() {
  const { stores, products, stock, activeStore, updateStock } = useStore()
  const [filter, setFilter] = useState('all')
  const [transfer, setTransfer] = useState(null) // product being transferred

  // ถ้าเลือก "ทุกสาขา" ให้ยึดสาขาแรกเป็นค่าเริ่มต้นในการแสดงจำนวน
  const viewStore = activeStore === 'all' ? stores[0].id : activeStore
  const viewStoreObj = stores.find((s) => s.id === viewStore)

  const rows = useMemo(() => {
    return products.map((p) => {
      const st = stock[p.id][viewStore]
      const status = st.qty === 0 ? 'out' : st.qty <= st.min ? 'low' : 'ok'
      const totalAll = stores.reduce((a, s) => a + stock[p.id][s.id].qty, 0)
      return { p, st, status, totalAll }
    })
  }, [products, stock, viewStore, stores])

  const filtered = rows.filter((r) => {
    if (filter === 'low') return r.status !== 'ok'
    if (filter === 'ok') return r.status === 'ok'
    return true
  })

  return (
    <>
      <div className="section-head">
        <div>
          <h2>สต็อกสินค้า</h2>
          <div className="sub">
            {activeStore === 'all'
              ? `กำลังดู ${viewStoreObj.emoji} ${viewStoreObj.name} — สลับสาขาที่มุมขวาบน`
              : `${viewStoreObj.emoji} ${viewStoreObj.name}`}
          </div>
        </div>
        <span className="pill">{products.length} รายการ</span>
      </div>

      <div className="chip-scroll" style={{ marginBottom: 14 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={'chip ' + (filter === f.id ? 'active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty"><div className="big">🔍</div>ไม่มีสินค้าในหมวดนี้</div>}

      {filtered.map(({ p, st, status, totalAll }) => (
        <div className="prod" key={p.id}>
          <div className="emoji">{p.emoji}</div>
          <div className="info">
            <div className="n">{p.name}</div>
            <div className="m">
              ขั้นต่ำ {st.min} {p.unit} · ทุกสาขารวม {totalAll} {p.unit}
              {' · '}
              <span className={'tag ' + (status === 'out' ? 'tag-low' : status === 'low' ? 'tag-warn' : 'tag-ok')}>
                {status === 'out' ? 'หมด' : status === 'low' ? 'ใกล้หมด' : 'พอ'}
              </span>
            </div>
            <div className="btn-row" style={{ marginTop: 10 }}>
              <button className="btn btn-sm" onClick={() => updateStock(p.id, viewStore, st.qty - 1)}>−1</button>
              <button className="btn btn-sm" onClick={() => updateStock(p.id, viewStore, st.qty + 1)}>+1</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setTransfer(p)}>🔄 โอนย้าย</button>
            </div>
          </div>
          <div className="qty">
            <div className="num" style={{ color: status === 'out' ? 'var(--red)' : status === 'low' ? 'var(--amber)' : 'var(--text)' }}>
              {st.qty}
            </div>
            <div className="unit">{p.unit}</div>
          </div>
        </div>
      ))}

      {transfer && (
        <TransferSheet product={transfer} onClose={() => setTransfer(null)} />
      )}
    </>
  )
}
