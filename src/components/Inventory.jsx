import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import TransferSheet from './TransferSheet.jsx'
import ProductSheet from './ProductSheet.jsx'
import StoreSheet from './StoreSheet.jsx'

const FILTERS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'low', label: '⚠️ ใกล้หมด' },
  { id: 'ok', label: '✅ เพียงพอ' },
]

function statusOf(p) {
  return p.qty === 0 ? 'out' : p.qty <= p.min ? 'low' : 'ok'
}

export default function Inventory() {
  const { stores, products, activeStore, updateStock } = useStore()
  const [filter, setFilter] = useState('all')
  const [transfer, setTransfer] = useState(null)   // product to transfer
  const [editProd, setEditProd] = useState(null)   // product to edit
  const [addTo, setAddTo] = useState(null)         // storeId to add product to
  const [editStore, setEditStore] = useState(null) // store to edit

  const shown = activeStore === 'all' ? stores : stores.filter((s) => s.id === activeStore)
  const canTransfer = stores.length > 1

  const passFilter = (p) => {
    const st = statusOf(p)
    if (filter === 'low') return st !== 'ok'
    if (filter === 'ok') return st === 'ok'
    return true
  }

  return (
    <>
      <div className="section-head">
        <div>
          <h2>สต็อกสินค้า</h2>
          <div className="sub">
            {activeStore === 'all' ? `${stores.length} ร้าน · แยกสินค้าตามร้าน` : 'จัดการสินค้าในร้านนี้'}
          </div>
        </div>
      </div>

      <div className="chip-scroll" style={{ marginBottom: 14 }}>
        {FILTERS.map((f) => (
          <button key={f.id} className={'chip ' + (filter === f.id ? 'active' : '')} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {shown.map((store) => {
        const items = products.filter((p) => p.store === store.id).filter(passFilter)
        return (
          <div key={store.id} style={{ marginBottom: 22 }}>
            <div className="store-block-head">
              <span className="name">
                <span className="dot" style={{ background: store.color }} />
                {store.emoji} {store.name}
              </span>
              <div className="btn-row">
                <button className="btn btn-sm btn-ghost" onClick={() => setEditStore(store)}>✏️</button>
                <button className="btn btn-sm" onClick={() => setAddTo(store.id)}>＋ สินค้า</button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="empty" style={{ padding: '18px 10px' }}>ไม่มีสินค้าในหมวดนี้</div>
            ) : (
              items.map((p) => {
                const st = statusOf(p)
                return (
                  <div className="prod" key={p.id}>
                    <div className="emoji">{p.emoji}</div>
                    <div className="info">
                      <div className="n" onClick={() => setEditProd(p)} style={{ cursor: 'pointer' }}>{p.name}</div>
                      <div className="m">
                        ทุน ฿{p.cost} · ขาย ฿{p.price} · ขั้นต่ำ {p.min}{' '}
                        <span className={'tag ' + (st === 'out' ? 'tag-low' : st === 'low' ? 'tag-warn' : 'tag-ok')}>
                          {st === 'out' ? 'หมด' : st === 'low' ? 'ใกล้หมด' : 'พอ'}
                        </span>
                      </div>
                      <div className="btn-row" style={{ marginTop: 10 }}>
                        <button className="btn btn-sm" onClick={() => updateStock(p.id, p.qty - 1)}>−1</button>
                        <button className="btn btn-sm" onClick={() => updateStock(p.id, p.qty + 1)}>+1</button>
                        {canTransfer && (
                          <button className="btn btn-sm btn-ghost" onClick={() => setTransfer(p)}>🔄 โอนย้าย</button>
                        )}
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditProd(p)}>✏️</button>
                      </div>
                    </div>
                    <div className="qty">
                      <div className="num" style={{ color: st === 'out' ? 'var(--red)' : st === 'low' ? 'var(--amber)' : 'var(--text)' }}>
                        {p.qty}
                      </div>
                      <div className="unit">{p.unit}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )
      })}

      {transfer && <TransferSheet product={transfer} onClose={() => setTransfer(null)} />}
      {editProd && <ProductSheet editing={editProd} onClose={() => setEditProd(null)} />}
      {addTo && <ProductSheet storeId={addTo} onClose={() => setAddTo(null)} />}
      {editStore && <StoreSheet editing={editStore} onClose={() => setEditStore(null)} />}
    </>
  )
}
