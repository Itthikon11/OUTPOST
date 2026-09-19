import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Mock data — ยังไม่ต่อหลังบ้าน ใช้ข้อมูลจำลอง + เก็บใน localStorage    */
/* ------------------------------------------------------------------ */

const STORES = [
  { id: 's1', name: 'สาขาสยาม', emoji: '🏬', color: '#6366f1' },
  { id: 's2', name: 'สาขาลาดพร้าว', emoji: '🏪', color: '#22c55e' },
  { id: 's3', name: 'สาขาเชียงใหม่', emoji: '🛍️', color: '#f59e0b' },
]

const PRODUCTS = [
  { id: 'p1', name: 'กาแฟคั่วบด 250g', emoji: '☕', price: 180, cost: 95, unit: 'ถุง' },
  { id: 'p2', name: 'ชาไทยพร้อมชง', emoji: '🍵', price: 120, cost: 60, unit: 'ถุง' },
  { id: 'p3', name: 'แก้วกระดาษ 16oz', emoji: '🥤', price: 90, cost: 45, unit: 'แพ็ค' },
  { id: 'p4', name: 'น้ำเชื่อมวานิลลา', emoji: '🍯', price: 150, cost: 80, unit: 'ขวด' },
  { id: 'p5', name: 'คุกกี้เนยสด', emoji: '🍪', price: 65, cost: 28, unit: 'ชิ้น' },
  { id: 'p6', name: 'นมข้นจืด', emoji: '🥛', price: 45, cost: 22, unit: 'กระป๋อง' },
]

// stock[productId][storeId] = { qty, min }
const initialStock = {
  p1: { s1: { qty: 42, min: 20 }, s2: { qty: 8, min: 15 }, s3: { qty: 25, min: 20 } },
  p2: { s1: { qty: 5, min: 12 }, s2: { qty: 30, min: 12 }, s3: { qty: 18, min: 12 } },
  p3: { s1: { qty: 120, min: 50 }, s2: { qty: 44, min: 50 }, s3: { qty: 3, min: 40 } },
  p4: { s1: { qty: 14, min: 10 }, s2: { qty: 22, min: 10 }, s3: { qty: 9, min: 10 } },
  p5: { s1: { qty: 60, min: 30 }, s2: { qty: 12, min: 30 }, s3: { qty: 48, min: 30 } },
  p6: { s1: { qty: 33, min: 20 }, s2: { qty: 40, min: 20 }, s3: { qty: 16, min: 20 } },
}

const today = new Date()
const dayStr = (offset) => {
  const d = new Date(today)
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

// รายการรายรับ-รายจ่าย
const initialTx = [
  { id: 't1', store: 's1', type: 'income', category: 'ขายหน้าร้าน', amount: 4820, date: dayStr(0), note: 'ยอดขายช่วงเช้า' },
  { id: 't2', store: 's1', type: 'expense', category: 'ซื้อสินค้าเข้าร้าน', amount: 2100, date: dayStr(0), note: 'สั่งกาแฟเพิ่ม' },
  { id: 't3', store: 's2', type: 'income', category: 'ขายหน้าร้าน', amount: 3650, date: dayStr(0), note: '' },
  { id: 't4', store: 's3', type: 'income', category: 'ขายหน้าร้าน', amount: 5200, date: dayStr(0), note: 'ลูกค้าเยอะ' },
  { id: 't5', store: 's3', type: 'expense', category: 'ค่าเช่า', amount: 8000, date: dayStr(1), note: 'ค่าเช่ารายเดือน' },
  { id: 't6', store: 's2', type: 'expense', category: 'ค่าน้ำค่าไฟ', amount: 1250, date: dayStr(1), note: '' },
  { id: 't7', store: 's1', type: 'income', category: 'ขายออนไลน์', amount: 2380, date: dayStr(1), note: 'สั่งผ่านไลน์' },
  { id: 't8', store: 's2', type: 'income', category: 'ขายหน้าร้าน', amount: 4100, date: dayStr(2), note: '' },
  { id: 't9', store: 's3', type: 'income', category: 'ขายหน้าร้าน', amount: 3900, date: dayStr(2), note: '' },
  { id: 't10', store: 's1', type: 'income', category: 'ขายหน้าร้าน', amount: 5100, date: dayStr(3), note: '' },
]

// ยอดขาย 7 วันย้อนหลังต่อสาขา (จำลองสำหรับกราฟ)
function buildSalesSeries() {
  const seed = { s1: 4600, s2: 3800, s3: 4900 }
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

// สินค้าขายดีต่อสาขา (จำลอง)
const bestSellers = {
  s1: [ ['p1', 128], ['p5', 96], ['p3', 74], ['p2', 51] ],
  s2: [ ['p2', 112], ['p1', 88], ['p6', 60], ['p5', 44] ],
  s3: [ ['p1', 140], ['p3', 90], ['p4', 55], ['p2', 40] ],
}

/* ------------------------------------------------------------------ */

const KEY = 'msm_state_v1'

function loadInitial() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    stock: initialStock,
    transactions: initialTx,
    salesSeries: buildSalesSeries(),
  }
}

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [activeStore, setActiveStore] = useState('all') // 'all' = ทุกสาขา
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
    updateStock: (productId, storeId, qty) => setData((d) => ({
      ...d,
      stock: {
        ...d.stock,
        [productId]: {
          ...d.stock[productId],
          [storeId]: { ...d.stock[productId][storeId], qty: Math.max(0, qty) },
        },
      },
    })),
    transferStock: (productId, fromId, toId, amount) => setData((d) => {
      const from = d.stock[productId][fromId]
      const to = d.stock[productId][toId]
      const moved = Math.min(amount, from.qty)
      return {
        ...d,
        stock: {
          ...d.stock,
          [productId]: {
            ...d.stock[productId],
            [fromId]: { ...from, qty: from.qty - moved },
            [toId]: { ...to, qty: to.qty + moved },
          },
        },
      }
    }),
    resetData: () => setData(loadInitial()),
  }), [])

  const value = {
    stores: STORES,
    products: PRODUCTS,
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
