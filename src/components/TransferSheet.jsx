import React, { useState } from 'react'
import { useStore } from '../store.jsx'

export default function TransferSheet({ product, onClose }) {
  const { stores, stock, transferStock } = useStore()
  const [from, setFrom] = useState(stores[0].id)
  const [to, setTo] = useState(stores[1].id)
  const [amount, setAmount] = useState(1)

  const fromQty = stock[product.id][from].qty
  const invalid = from === to || amount < 1 || amount > fromQty

  const submit = () => {
    if (invalid) return
    transferStock(product.id, from, to, Number(amount))
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <h3>🔄 โอนย้ายสินค้า</h3>
        <div className="sheet-sub">{product.emoji} {product.name}</div>

        <div className="field">
          <label>จากสาขา (มี {fromQty} {product.unit})</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.emoji} {s.name} — {stock[product.id][s.id].qty} {product.unit}</option>
            ))}
          </select>
        </div>

        <div style={{ textAlign: 'center', fontSize: 22, margin: '-4px 0 8px', color: 'var(--muted)' }}>↓</div>

        <div className="field">
          <label>ไปยังสาขา</label>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.emoji} {s.name} — {stock[product.id][s.id].qty} {product.unit}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>จำนวนที่โอน ({product.unit})</label>
          <input
            type="number"
            min="1"
            max={fromQty}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {from === to && <div className="hint" style={{ color: 'var(--red)' }}>เลือกสาขาต้นทางและปลายทางให้ต่างกัน</div>}
        {amount > fromQty && <div className="hint" style={{ color: 'var(--red)' }}>จำนวนเกินสต็อกที่มี</div>}

        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={invalid} onClick={submit}>
          ยืนยันการโอน
        </button>
        <button className="btn btn-block btn-ghost" style={{ marginTop: 10 }} onClick={onClose}>ยกเลิก</button>
      </div>
    </div>
  )
}
