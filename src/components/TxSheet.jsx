import React, { useState } from 'react'
import { useStore } from '../store.jsx'

const CATS = {
  income: ['ขายหน้าร้าน', 'ขายออนไลน์', 'รับออเดอร์พิเศษ', 'อื่น ๆ'],
  expense: ['ซื้อสินค้าเข้าร้าน', 'ค่าเช่า', 'ค่าน้ำค่าไฟ', 'เงินเดือนพนักงาน', 'ค่าการตลาด', 'อื่น ๆ'],
}

export default function TxSheet({ onClose }) {
  const { stores, activeStore, addTransaction } = useStore()
  const [type, setType] = useState('income')
  const [store, setStore] = useState(activeStore === 'all' ? stores[0].id : activeStore)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATS.income[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const switchType = (t) => {
    setType(t)
    setCategory(CATS[t][0])
  }

  const valid = Number(amount) > 0

  const submit = () => {
    if (!valid) return
    addTransaction({ store, type, amount: Number(amount), category, note, date })
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <h3>บันทึกรายการ</h3>
        <div className="sheet-sub">บันทึกด่วน — เลือกประเภทและกรอกจำนวนเงิน</div>

        <div className="type-toggle">
          <button className={type === 'income' ? 'on-in' : ''} onClick={() => switchType('income')}>
            💵 รายรับ
          </button>
          <button className={type === 'expense' ? 'on-out' : ''} onClick={() => switchType('expense')}>
            🧾 รายจ่าย
          </button>
        </div>

        <div className="field">
          <label>จำนวนเงิน (บาท)</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            autoFocus
            onChange={(e) => setAmount(e.target.value)}
            style={{ fontSize: 24, fontWeight: 700 }}
          />
        </div>

        <div className="field">
          <label>สาขา</label>
          <select value={store} onChange={(e) => setStore(e.target.value)}>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
        </div>

        <div className="field">
          <label>หมวดหมู่</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATS[type].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label>วันที่</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="field">
          <label>บันทึกช่วยจำ (ไม่บังคับ)</label>
          <input type="text" placeholder="เช่น ขายช่วงเช้า" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 6, background: type === 'income' ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#e11d48,#f43f5e)' }}
          disabled={!valid}
          onClick={submit}
        >
          บันทึก{type === 'income' ? 'รายรับ' : 'รายจ่าย'}
        </button>
        <button className="btn btn-block btn-ghost" style={{ marginTop: 10 }} onClick={onClose}>ยกเลิก</button>
      </div>
    </div>
  )
}
