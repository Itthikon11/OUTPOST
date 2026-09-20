import React, { useState } from 'react'
import { useStore, STORE_COLORS, STORE_EMOJIS } from '../store.jsx'

export default function StoreSheet({ editing, onClose }) {
  const { addStore, updateStore, deleteStore } = useStore()
  const [name, setName] = useState(editing?.name ?? '')
  const [type, setType] = useState(editing?.type ?? '')
  const [emoji, setEmoji] = useState(editing?.emoji ?? '🏪')
  const [color, setColor] = useState(editing?.color ?? STORE_COLORS[0])

  const valid = name.trim().length > 0

  const submit = () => {
    if (!valid) return
    if (editing) updateStore(editing.id, { name: name.trim(), type: type.trim(), emoji, color })
    else addStore({ name: name.trim(), type: type.trim(), emoji, color })
    onClose()
  }

  const remove = () => {
    if (confirm(`ลบร้าน "${editing.name}" และข้อมูลทั้งหมดของร้านนี้?`)) {
      deleteStore(editing.id)
      onClose()
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <h3>{editing ? 'แก้ไขร้าน' : '➕ สร้างร้านใหม่'}</h3>
        <div className="sheet-sub">
          {editing ? 'ปรับข้อมูลร้าน' : 'เพิ่มร้านของคุณเข้าระบบ เช่น ร้านคอม ร้านซ่อม ร้านขายข้าว'}
        </div>

        {/* พรีวิว */}
        <div className="prod" style={{ marginBottom: 18 }}>
          <div className="emoji" style={{ background: color + '22' }}>{emoji}</div>
          <div className="info">
            <div className="n">{name || 'ชื่อร้าน'}</div>
            <div className="m">{type || 'ประเภทร้าน'}</div>
          </div>
        </div>

        <div className="field">
          <label>ชื่อร้าน</label>
          <input type="text" placeholder="เช่น ร้านกาแฟหน้าปากซอย" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>ประเภทร้าน (ไม่บังคับ)</label>
          <input type="text" placeholder="เช่น ขายเครื่องดื่ม" value={type} onChange={(e) => setType(e.target.value)} />
        </div>

        <div className="field">
          <label>ไอคอนร้าน</label>
          <div className="emoji-grid">
            {STORE_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={'emoji-pick ' + (emoji === e ? 'on' : '')}
                onClick={() => setEmoji(e)}
              >{e}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>สีประจำร้าน</label>
          <div className="color-grid">
            {STORE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={'color-pick ' + (color === c ? 'on' : '')}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c}
              >{color === c ? '✓' : ''}</button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 6 }} disabled={!valid} onClick={submit}>
          {editing ? 'บันทึกการแก้ไข' : 'สร้างร้าน'}
        </button>
        {editing && (
          <button className="btn btn-block btn-ghost btn-danger" style={{ marginTop: 10 }} onClick={remove}>
            ลบร้านนี้
          </button>
        )}
        <button className="btn btn-block btn-ghost" style={{ marginTop: 10 }} onClick={onClose}>ยกเลิก</button>
      </div>
    </div>
  )
}
