import React, { useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell,
} from 'recharts'
import { useStore, fmt, fmtShort } from '../store.jsx'

const PERIODS = [['day', 'รายวัน'], ['week', 'รายสัปดาห์'], ['month', 'รายเดือน']]

export default function Analytics() {
  const { stores, products, salesSeries, bestSellers, activeStore } = useStore()
  const [period, setPeriod] = useState('day')

  // ยอดขายรวมของ series (ตามร้านที่เลือก หรือรวมทุกร้าน)
  const trend = salesSeries.map((d) => {
    const total = activeStore === 'all'
      ? stores.reduce((a, s) => a + (d[s.id] || 0), 0)
      : (d[activeStore] || 0)
    return { label: d.label, date: d.date, total }
  })

  // คาดการณ์ 3 วันข้างหน้า (moving average + เทรนด์เล็กน้อย)
  const last3 = trend.slice(-3).map((d) => d.total)
  const avg = last3.reduce((a, b) => a + b, 0) / (last3.length || 1)
  const slope = (trend[trend.length - 1].total - trend[0].total) / trend.length
  const forecast = [1, 2, 3].map((i) => ({
    label: `+${i}ว`,
    total: null,
    predict: Math.round(avg + slope * i),
  }))
  const trendWithForecast = [
    ...trend.map((d) => ({ ...d, predict: null })),
    ...forecast,
  ]
  // เชื่อมเส้นจริงกับเส้นคาดการณ์
  if (trendWithForecast[trend.length - 1]) {
    trendWithForecast[trend.length - 1].predict = trend[trend.length - 1].total
  }

  // เปรียบเทียบร้าน
  const cmpData = stores.map((s) => ({
    name: s.name.replace('ร้าน', '') || s.name,
    ยอดขาย: salesSeries.reduce((a, d) => a + (d[s.id] || 0), 0),
    color: s.color,
  }))

  const totalSales = trend.reduce((a, d) => a + d.total, 0)
  const avgDay = Math.round(totalSales / trend.length)

  const sellers = (activeStore === 'all' ? mergeBest(bestSellers) : bestSellers[activeStore]) || []
  const maxSell = Math.max(...sellers.map(([, q]) => q), 1)

  return (
    <>
      <div className="section-head">
        <div>
          <h2>สถิติ &amp; คาดการณ์</h2>
          <div className="sub">{activeStore === 'all' ? 'รวมทุกร้าน' : stores.find((s) => s.id === activeStore)?.name}</div>
        </div>
      </div>

      <div className="seg" style={{ marginBottom: 14 }}>
        {PERIODS.map(([id, l]) => (
          <button key={id} className={period === id ? 'active' : ''} onClick={() => setPeriod(id)}>{l}</button>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 4 }}>
        <div className="card kpi">
          <div className="label">ยอดขาย 7 วัน</div>
          <div className="value">{fmt(totalSales)}</div>
        </div>
        <div className="card kpi">
          <div className="label">เฉลี่ย/วัน</div>
          <div className="value">{fmt(avgDay)}</div>
        </div>
      </div>

      {/* Trend + forecast */}
      <div className="section-head">
        <div>
          <h2>แนวโน้มยอดขาย</h2>
          <div className="sub">เส้นประ = คาดการณ์ล่วงหน้า 3 วัน</div>
        </div>
      </div>
      <div className="card" style={{ paddingLeft: 4, paddingRight: 8 }}>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={trendWithForecast} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,33,54,0.10)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#5a6b82', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5a6b82', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
            <Tooltip formatter={(v) => fmt(v)} labelStyle={{ color: '#0e2136' }} />
            <Line type="monotone" dataKey="total" name="ยอดขายจริง" stroke="#1f6bff" strokeWidth={3} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="predict" name="คาดการณ์" stroke="#7aa8ff" strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Branch comparison */}
      {activeStore === 'all' && (
        <>
          <div className="section-head">
            <div>
              <h2>เปรียบเทียบร้าน</h2>
              <div className="sub">ยอดขายรวม 7 วัน</div>
            </div>
          </div>
          <div className="card" style={{ paddingLeft: 4, paddingRight: 8 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cmpData} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,33,54,0.10)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#5a6b82', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a6b82', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <Tooltip formatter={(v) => fmt(v)} cursor={{ fill: 'rgba(14,33,54,0.05)' }} />
                <Bar dataKey="ยอดขาย" radius={[8, 8, 0, 0]}>
                  {cmpData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Best sellers */}
      <div className="section-head">
        <div>
          <h2>สินค้าขายดี</h2>
          <div className="sub">{activeStore === 'all' ? 'รวมทุกร้าน' : 'ร้านนี้'} · ช่วง 7 วันล่าสุด</div>
        </div>
        <span className="pill">🔥 Top {sellers.length}</span>
      </div>
      <div className="card">
        {sellers.length === 0 && <div className="empty">ยังไม่มีข้อมูลการขาย</div>}
        {sellers.map(([pid, qty], i) => {
          const p = products.find((x) => x.id === pid)
          if (!p) return null
          return (
            <div className="cmp-item" key={pid}>
              <div className="cmp-top">
                <span className="name">
                  <span style={{ width: 20, color: 'var(--ink-faint)' }}>{i + 1}.</span>
                  <span>{p.emoji}</span>{p.name}
                </span>
                <span className="amt">{qty} {p.unit}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: (qty / maxSell) * 100 + '%' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="hint">📌 การคาดการณ์คำนวณจากค่าเฉลี่ยเคลื่อนที่ของข้อมูลจำลอง</div>
    </>
  )
}

// รวมสินค้าขายดีจากทุกร้าน
function mergeBest(bestSellers) {
  const map = {}
  Object.values(bestSellers).forEach((arr) => {
    arr.forEach(([pid, q]) => { map[pid] = (map[pid] || 0) + q })
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
}
