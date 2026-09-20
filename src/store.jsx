import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Mock data — ยังไม่ต่อหลังบ้าน ใช้ข้อมูลจำลอง + เก็บใน localStorage    */
/*  แนวคิด: จัดการ "หลายร้านต่างประเภท" ในที่เดียว                       */
/*  (แต่ละร้านมีสินค้าเป็นของตัวเอง)                                     */
/* ------------------------------------------------------------------ */

const STORES = [
  { id: 's1', name: 'ร้านคอมพิวเตอร์', emoji: '💻', color: '#6366f1', type: 'ขายสินค้าไอที' },
  { id: 's2', name: 'ร้านซ่อมมือถือ', emoji: '🔧', color: '#22c55e', type: 'บริการ + อะไหล่' },
  { id: 's3', name: 'ร้านขายข้าว', emoji: '🌾', color: '#f59e0b', type: 'ของชำ/ข้าวสาร' },
]

// สินค้าแยกตามร้าน — แต่ละร้านมีสินค้าคนละชุด
// { id, store, name, emoji, price(ขาย), cost(ทุน), unit, qty(คงเหลือ), min(ขั้นต่ำ) }
const PRODUCTS = [
  // 💻 ร้านคอมพิวเตอร์
  { id: 'c1', store: 's1', name: 'เมาส์ไร้สาย', emoji: '🖱️', price: 590, cost: 320, unit: 'ชิ้น', qty: 24, min: 10 },
  { id: 'c2', store: 's1', name: 'คีย์บอร์ดเกมมิ่ง', emoji: '⌨️', price: 1290, cost: 780, unit: 'ชิ้น', qty: 6, min: 8 },
  { id: 'c3', store: 's1', name: 'SSD 1TB', emoji: '💾', price: 2450, cost: 1900, unit: 'ชิ้น', qty: 15, min: 6 },
  { id: 'c4', store: 's1', name: 'แรม DDR4 16GB', emoji: '🧠', price: 1650, cost: 1200, unit: 'แถว', qty: 3, min: 8 },
  { id: 'c5', store: 's1', name: 'สายชาร์จ USB-C', emoji: '🔌', price: 190, cost: 70, unit: 'เส้น', qty: 60, min: 20 },

  // 🔧 ร้านซ่อมมือถือ (อะไหล่)
  { id: 'r1', store: 's2', name: 'จอมือถือ (อะไหล่)', emoji: '📱', price: 1200, cost: 800, unit: 'ชิ้น', qty: 5, min: 6 },
  { id: 'r2', store: 's2', name: 'แบตเตอรี่มือถือ', emoji: '🔋', price: 450, cost: 250, unit: 'ก้อน', qty: 18, min: 10 },
  { id: 'r3', store: 's2', name: 'ฟิล์มกระจก', emoji: '🛡️', price: 120, cost: 40, unit: 'แผ่น', qty: 40, min: 15 },
  { id: 'r4', store: 's2', name: 'สายชาร์จ', emoji: '🔌', price: 150, cost: 60, unit: 'เส้น', qty: 2, min: 10 },
  { id: 'r5', store: 's2', name: 'อะแดปเตอร์ชาร์จ', emoji: '⚡', price: 250, cost: 120, unit: 'ชิ้น', qty: 12, min: 8 },

  // 🌾 ร้านขายข้าว / ของชำ
  { id: 'g1', store: 's3', name: 'ข้าวหอมมะลิ 5กก.', emoji: '🌾', price: 220, cost: 175, unit: 'ถุง', qty: 30, min: 15 },
  { id: 'g2', store: 's3', name: 'ข้าวเหนียว 5กก.', emoji: '🍚', price: 190, cost: 150, unit: 'ถุง', qty: 8, min: 12 },
  { id: 'g3', store: 's3', name: 'ข้าวกล้อง 2กก.', emoji: '🌾', price: 130, cost: 95, unit: 'ถุง', qty: 22, min: 10 },
  { id: 'g4', store: 's3', name: 'น้ำตาลทราย 1กก.', emoji: '🧂', price: 28, cost: 22, unit: 'ถุง', qty: 5, min: 20 },
  { id: 'g5', store: 's3', name: 'น้ำมันพืช 1ลิตร', emoji: '🛢️', price: 55, cost: 45, unit: 'ขวด', qty: 48, min: 20 },
]

const today = new Date()
const dayStr = (offset) => {
  const d = new Date(today)
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

// รายการรายรับ-รายจ่าย (แยกตามร้าน)
const initialTx = [
  { id: 't1', store: 's1', type: 'income', category: 'ขายหน้าร้าน', amount: 4820, date: dayStr(0), note: 'ขายเมาส์+คีย์บอร์ด' },
  { id: 't2', store: 's1', type: 'expense', category: 'ซื้อสินค้าเข้าร้าน', amount: 2100, date: dayStr(0), note: 'สั่ง SSD เพิ่ม' },
  { id: 't3', store: 's2', type: 'income', category: 'ค่าบริการซ่อม', amount: 3650, date: dayStr(0), note: 'เปลี่ยนจอ 3 เครื่อง' },
  { id: 't4', store: 's3', type: 'income', category: 'ขายหน้าร้าน', amount: 5200, date: dayStr(0), note: 'ข้าวสารขายดี' },
  { id: 't5', store: 's3', type: 'expense', category: 'ค่าเช่า', amount: 8000, date: dayStr(1), note: 'ค่าเช่ารายเดือน' },
  { id: 't6', store: 's2', type: 'expense', category: 'ค่าน้ำค่าไฟ', amount: 1250, date: dayStr(1), note: '' },
  { id: 't7', store: 's1', type: 'income', category: 'ขายออนไลน์', amount: 2380, date: dayStr(1), note: 'สั่งผ่านเพจ' },
  { id: 't8', store: 's2', type: 'income', category: 'ค่าบริการซ่อม', amount: 4100, date: dayStr(2), note: '' },
  { id: 't9', store: 's3', type: 'income', category: 'ขายหน้าร้าน', amount: 3900, date: dayStr(2), note: '' },
  { id: 't10', store: 's1', type: 'income', category: 'ขายหน้าร้าน', amount: 5100, date: dayStr(3), note: '' },
]

// ยอดขาย 7 วันย้อนหลังต่อร้าน (จำลองสำหรับกราฟ)
function buildSalesSeries() {
  const seed = { s1: 4800, s2: 3600, s3: 4900 }
  const out = []
  for (let i = 6; i >= 0; i--) {
    const wobble = (k) => Math.round(seed[k] * (0.75 + Math.random() * 0.5))
    out.push({
      date: dayStr(i),
      label: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][new Date(dayStr(i)).getDay()],
      s1: wobble('s1'), s2: wobble('s2'), s3: wobble('s3'),
    })
  }
  return out
}

// สินค้าขายดีต่อร้าน (จำลอง) — [productId, จำนวนที่ขายได้]
const bestSellers = {
  s1: [['c5', 84], ['c1', 82], ['c3', 40], ['c2', 35]],
  s2: [['r3', 96], ['r2', 70], ['r5', 44], ['r1', 30]],
  s3: [['g5', 120], ['g1', 110], ['g2', 60], ['g3', 48]],
}

/* ------------------------------------------------------------------ */

const KEY = 'msm_state_v2'

function seedState() {
  return {
    stores: STORES.map((s) => ({ ...s })),
    products: PRODUCTS.map((p) => ({ ...p })),
    transactions: initialTx,
    salesSeries: buildSalesSeries(),
  }
}

// จานสีให้เลือกตอนสร้างร้าน
export const STORE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#38bdf8', '#f43f5e', '#a855f7', '#14b8a6', '#eab308']
// อีโมจิแนะนำสำหรับร้าน
export const STORE_EMOJIS = ['🏪', '💻', '🔧', '🌾', '🛒', '☕', '🍜', '👕', '💊', '📚', '🌸', '🐟', '🍞', '💅', '🔩', '🎮']

function loadInitial() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return seedState()
}

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [activeStore, setActiveStore] = useState('all') // 'all' = ทุกร้าน
  const [data, setData] = useState(loadInitial)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* ignore */ }
  }, [data])

  const actions = useMemo(() => ({
    addTransaction: (tx) => setData((d) => ({
      ...d,
      transactions: [{ ...tx, id: 'tx' + Date.now() }, ...d.transactions],
    })),
    deleteTransaction: (id) => setData((d) => ({
      ...d,
      transactions: d.transactions.filter((t) => t.id !== id),
    })),
    updateStock: (productId, qty) => setData((d) => ({
      ...d,
      products: d.products.map((p) => p.id === productId ? { ...p, qty: Math.max(0, qty) } : p),
    })),
    // โอนย้ายสินค้าไปอีกร้าน — ถ้าร้านปลายทางมีสินค้าชื่อเดียวกันจะรวมจำนวน ถ้าไม่มีจะสร้างใหม่
    transferStock: (productId, toStoreId, amount) => setData((d) => {
      const src = d.products.find((p) => p.id === productId)
      if (!src || toStoreId === src.store) return d
      const moved = Math.min(Number(amount) || 0, src.qty)
      if (moved <= 0) return d
      const hasTarget = d.products.some((p) => p.store === toStoreId && p.name === src.name)
      let products = d.products.map((p) => {
        if (p.id === productId) return { ...p, qty: p.qty - moved }
        if (p.store === toStoreId && p.name === src.name) return { ...p, qty: p.qty + moved }
        return p
      })
      if (!hasTarget) {
        products = [...products, { ...src, id: 'p' + Date.now(), store: toStoreId, qty: moved }]
      }
      return { ...d, products }
    }),
    // สร้างร้านใหม่เอง
    addStore: (store) => {
      const id = 'st' + Date.now()
      setData((d) => ({ ...d, stores: [...d.stores, { ...store, id }] }))
      setActiveStore(id)
      return id
    },
    updateStore: (id, patch) => setData((d) => ({
      ...d,
      stores: d.stores.map((s) => s.id === id ? { ...s, ...patch } : s),
    })),
    deleteStore: (id) => {
      setActiveStore('all')
      setData((d) => ({
        ...d,
        stores: d.stores.filter((s) => s.id !== id),
        products: d.products.filter((p) => p.store !== id),
        transactions: d.transactions.filter((t) => t.store !== id),
      }))
    },
    // เพิ่ม/แก้ไข/ลบสินค้าในร้าน
    addProduct: (product) => setData((d) => ({
      ...d,
      products: [...d.products, { ...product, id: 'p' + Date.now() }],
    })),
    updateProduct: (id, patch) => setData((d) => ({
      ...d,
      products: d.products.map((p) => p.id === id ? { ...p, ...patch } : p),
    })),
    deleteProduct: (id) => setData((d) => ({
      ...d,
      products: d.products.filter((p) => p.id !== id),
    })),
    resetData: () => setData(seedState()),
  }), [])

  const value = {
    bestSellers,
    activeStore,
    setActiveStore,
    ...data,
    ...actions,
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)

/* ---------- helper selectors ---------- */
export const fmt = (n) => '฿' + Math.round(n).toLocaleString('th-TH')
export const fmtShort = (n) => {
  if (Math.abs(n) >= 1000) return '฿' + (n / 1000).toFixed(1) + 'k'
  return '฿' + n
}
export function storeName(stores, id) {
  return stores.find((s) => s.id === id)?.name ?? id
}
export function storeById(stores, id) {
  return stores.find((s) => s.id === id)
}
