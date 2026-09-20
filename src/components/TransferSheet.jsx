import React, { useState } from 'react'
import { useStore, storeById } from '../store.jsx'

export default function TransferSheet({ product, onClose }) {
  const { stores, transferStock } = useStore()
  const others = stores.filter((s) => s.id !== product.store)
  const [to, setTo] = useState(others[0]?.id ?? '')
  const [amount, setAmount] = useState(1)

  const fromStore = storeById(stores, product.store)
  const invalid = !to || amount < 1 || amount > product.qty

  const submit = () => {
    if (invalid) return
    transferStock(product.id, to, Number(amount))
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <h3>🔄 โอนย้ายสินค้า</h3>
        <div className="sheet-sub">{product.emoji} {product.name}</div>

        <div className="field">
          <label>จากร้าน</label>
          <input type="text" value={`${fromStore.emoji} ${fromStore.name} — มี ${product.qty} ${product.unit}`} disabled />
        </div>

        <div style={{ textAlign: 'center', fontSize: 22, margin: '-4px 0 8px', color: 'var(--muted)' }}>↓</div>

        <div className="field">
          <label>ไปยังร้าน</label>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {others.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
        </div>

        <div className="field">
          <label>จำนวนที่โอน ({product.unit})</label>
          <input type="number" min="1" max={product.qty} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        {amount > product.qty && <div className="hint" style={{ color: 'var(--red)' }}>จำนวนเกินสต็อกที่มี</div>}
        <div className="hint">ถ้าร้านปลายทางมีสินค้าชื่อเดียวกันอยู่แล้ว ระบบจะรวมจำนวนให้อัตโนมัติ</div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} disabled={invalid} onClick={submit}>
          ยืนยันการโอน
        </button>
        <button className="btn btn-block btn-ghost" style={{ marginTop: 10 }} onClick={onClose}>ยกเลิก</button>
      </div>
    </div>
  )
}
