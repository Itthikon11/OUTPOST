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

  // ยอดขายรวมของ series (ตามสาขาที่เลือก หรือรวมทุกสาขา)
  const trend = salesSeries.map((d) => {
    const total = activeStore === 'all'
      ? d.s1 + d.s2 + d.s3
      : d[activeStore]
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

  // เปรียบเทียบสาขา
  const cmpData = stores.map((s) => ({
    name: s.name.replace('สาขา', ''),
    ยอดขาย: salesSeries.reduce((a, d) => a + d[s.id], 0),
    color: s.color,
  }))

  const totalSales = trend.reduce((a, d) => a + d.total, 0)
  const avgDay = Math.round(totalSales / trend.length)

  const sellers = activeStore === 'all'
    ? mergeBest(bestSellers)
    : bestSellers[activeStore]
  const maxSell = Math.max(...sellers.map(([, q]) => q), 1)

  return (
    <>
      <div className="section-head">
        <div>
          <h2>สถิติ &amp; คาดการณ์</h2>
          <div className="sub">{activeStore === 'all' ? 'รวมทุกสาขา' : stores.find((s) => s.id === activeStore)?.name}</div>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#263353" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#93a2c4', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#93a2c4', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
            <Tooltip formatter={(v) => fmt(v)} labelStyle={{ color: '#e8edf7' }} />
            <Line type="monotone" dataKey="total" name="ยอดขายจริง" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="predict" name="คาดการณ์" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Branch comparison */}
      {activeStore === 'all' && (
        <>
          <div className="section-head">
            <div>
              <h2>เปรียบเทียบสาขา</h2>
              <div className="sub">ยอดขายรวม 7 วัน</div>
            </div>
          </div>
          <div className="card" style={{ paddingLeft: 4, paddingRight: 8 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cmpData} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#263353" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#93a2c4', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#93a2c4', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <Tooltip formatter={(v) => fmt(v)} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
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
          <div className="sub">{activeStore === 'all' ? 'รวมทุกสาขา' : 'สาขานี้'} · ช่วย 7 วันล่าสุด</div>
        </div>
        <span className="pill">🔥 Top {sellers.length}</span>
      </div>
      <div className="card">
        {sellers.map(([pid, qty], i) => {
          const p = products.find((x) => x.id === pid)
          return (
            <div className="cmp-item" key={pid}>
              <div className="cmp-top">
                <span className="name">
                  <span style={{ width: 20, color: 'var(--muted)' }}>{i + 1}.</span>
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

// รวมสินค้าขายดีจากทุกสาขา
function mergeBest(bestSellers) {
  const map = {}
  Object.values(bestSellers).forEach((arr) => {
    arr.forEach(([pid, q]) => { map[pid] = (map[pid] || 0) + q })
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
}
