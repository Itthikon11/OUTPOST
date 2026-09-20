import React, { useState } from 'react'
import { useStore } from '../store.jsx'

const EMOJIS = ['📦', '🖱️', '⌨️', '💾', '🧠', '🔌', '📱', '🔋', '🛡️', '⚡', '🌾', '🍚', '🧂', '🛢️', '☕', '🍜', '👕', '💊', '🔩', '🎮']

export default function ProductSheet({ storeId, editing, onClose }) {
  const { addProduct, updateProduct, deleteProduct } = useStore()
  const [name, setName] = useState(editing?.name ?? '')
  const [emoji, setEmoji] = useState(editing?.emoji ?? '📦')
  const [price, setPrice] = useState(editing?.price ?? '')
  const [cost, setCost] = useState(editing?.cost ?? '')
  const [unit, setUnit] = useState(editing?.unit ?? 'ชิ้น')
  const [qty, setQty] = useState(editing?.qty ?? '')
  const [min, setMin] = useState(editing?.min ?? '')

  const valid = name.trim().length > 0

  const submit = () => {
    if (!valid) return
    const payload = {
      name: name.trim(), emoji, unit: unit.trim() || 'ชิ้น',
      price: Number(price) || 0, cost: Number(cost) || 0,
      qty: Number(qty) || 0, min: Number(min) || 0,
    }
    if (editing) updateProduct(editing.id, payload)
    else addProduct({ ...payload, store: storeId })
    onClose()
  }

  const remove = () => {
    if (confirm(`ลบสินค้า "${editing.name}"?`)) { deleteProduct(editing.id); onClose() }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <h3>{editing ? 'แก้ไขสินค้า' : '➕ เพิ่มสินค้า'}</h3>
        <div className="sheet-sub">กรอกข้อมูลสินค้าในร้าน</div>

        <div className="field">
          <label>ชื่อสินค้า</label>
          <input type="text" placeholder="เช่น เมาส์ไร้สาย" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>ไอคอน</label>
          <div className="emoji-grid">
            {EMOJIS.map((e) => (
              <button key={e} type="button" className={'emoji-pick ' + (emoji === e ? 'on' : '')} onClick={() => setEmoji(e)}>{e}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="field">
            <label>ราคาขาย (บาท)</label>
            <input type="number" inputMode="decimal" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="field">
            <label>ราคาทุน (บาท)</label>
            <input type="number" inputMode="decimal" placeholder="0" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div className="field">
            <label>จำนวนคงเหลือ</label>
            <input type="number" inputMode="numeric" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="field">
            <label>แจ้งเตือนเมื่อต่ำกว่า</label>
            <input type="number" inputMode="numeric" placeholder="0" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>หน่วยนับ</label>
          <input type="text" placeholder="ชิ้น / ถุง / ขวด" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 6 }} disabled={!valid} onClick={submit}>
          {editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
        </button>
        {editing && (
          <button className="btn btn-block btn-ghost btn-danger" style={{ marginTop: 10 }} onClick={remove}>ลบสินค้านี้</button>
        )}
        <button className="btn btn-block btn-ghost" style={{ marginTop: 10 }} onClick={onClose}>ยกเลิก</button>
      </div>
    </div>
  )
}
