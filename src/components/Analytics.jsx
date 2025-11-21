import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const tabs = [
  { key: 'option-chain', label: 'Option Chain' },
  { key: 'oi-heatmap', label: 'OI Heatmap' },
  { key: 'pcr', label: 'PCR' },
  { key: 'vix', label: 'India VIX' },
  { key: 'fii-dii', label: 'FII/DII' },
  { key: 'advance-decline', label: 'Advance-Decline' },
  { key: 'yield-curve', label: 'Fixed Income' },
]

function useFetch(url, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => {
    if (!url) return
    let cancelled = false
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(j => { if (!cancelled) { setData(j); setError(null) } })
      .catch(e => { if (!cancelled) setError(e?.message || 'Error') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { data, loading, error }
}

function Sparkline({ points, width = 320, height = 80, color = '#60a5fa' }) {
  if (!points || points.length === 0) return null
  const maxV = Math.max(...points.map(p => p.v))
  const minV = Math.min(...points.map(p => p.v))
  const range = maxV - minV || 1
  const stepX = width / (points.length - 1)
  const d = points
    .map((p, i) => {
      const x = i * stepX
      const y = height - ((p.v - minV) / range) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} className="w-full">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function Bars({ labels, series, colors }) {
  const max = Math.max(1, ...series.flat().map(Math.abs))
  return (
    <div className="space-y-2">
      {labels.map((lab, idx) => (
        <div key={lab} className="grid grid-cols-12 items-center gap-2 text-xs">
          <div className="col-span-2 text-white/70">{lab}</div>
          <div className="col-span-10 flex items-center gap-2">
            {series.map((s, si) => {
              const v = s[idx] || 0
              const w = `${(Math.abs(v) / max) * 100}%`
              return (
                <div key={si} className="flex-1 bg-white/5 rounded overflow-hidden">
                  <div className="h-2" style={{ width: w, backgroundColor: colors[si], transform: v < 0 ? 'scaleX(-1)' : undefined }} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function Heatmap({ rows, cols, get, labels }) {
  const max = useMemo(() => {
    let m = 1
    rows.forEach((r, ri) => {
      cols.forEach((c, ci) => {
        m = Math.max(m, get(r, c))
      })
    })
    return m
  }, [rows, cols, get])
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[100px_repeat(var(--cols),1fr)] gap-1" style={{ ['--cols']: cols.length }}>
          <div className="text-xs text-white/50" />
          {cols.map(c => (
            <div key={c} className="text-xs text-center text-white/60">{c}</div>
          ))}
          {rows.map(r => (
            <>
              <div key={`${r}-label`} className="text-xs text-white/60 py-1">{labels?.row?.(r) || r}</div>
              {cols.map(c => {
                const v = get(r, c)
                const intensity = v / max
                const bg = `rgba(99,102,241,${0.15 + intensity * 0.75})`
                return (
                  <div key={`${r}-${c}`} className="h-6 rounded" style={{ background: bg }} title={`${labels?.col?.(c) || c}: ${v}`} />
                )
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

function Analytics() {
  const [active, setActive] = useState('option-chain')
  const [symbol, setSymbol] = useState('NIFTY')

  const optionChainUrl = `${BACKEND}/api/analytics/option-chain?symbol=${encodeURIComponent(symbol)}`
  const pcrUrl = `${BACKEND}/api/analytics/pcr?symbol=${encodeURIComponent(symbol)}`
  const vixUrl = `${BACKEND}/api/analytics/vix`
  const fiiUrl = `${BACKEND}/api/analytics/fii-dii`
  const adUrl = `${BACKEND}/api/analytics/advance-decline`
  const ycUrl = `${BACKEND}/api/fixed-income/yield-curve`

  const optionChain = useFetch(optionChainUrl, [symbol])
  const pcr = useFetch(pcrUrl, [symbol])
  const vix = useFetch(vixUrl, [])
  const fii = useFetch(fiiUrl, [])
  const ad = useFetch(adUrl, [])
  const yc = useFetch(ycUrl, [])

  const chain = optionChain.data?.chain || []
  const strikes = chain.map(r => r.strike)

  const variants = {
    enter: { opacity: 0, y: 20, scale: 0.98 },
    center: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 }
  }

  return (
    <section className="bg-black text-white py-16" id="analytics">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Analytics & Fixed Income</h2>
          <div className="flex items-center gap-2">
            <input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="relative">
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActive(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition relative overflow-hidden ${active===t.key? 'bg-white text-black border-white':'border-white/20 hover:border-white/50'}`}>
                <span className="relative z-10">{t.label}</span>
                {active===t.key && (
                  <motion.span layoutId="pill" className="absolute inset-0 bg-white" style={{ borderRadius: 8 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                )}
              </button>
            ))}
          </div>

          <div className="relative min-h-[320px]">
            <AnimatePresence mode="wait">
              {active === 'option-chain' && (
                <motion.div key="option-chain" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Option Chain • {symbol}</h3>
                  {optionChain.loading && <p className="text-white/60">Loading...</p>}
                  {chain.length>0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-[700px] w-full text-sm">
                        <thead className="text-white/60">
                          <tr>
                            <th className="text-left py-2">Strike</th>
                            <th className="text-left py-2">Call OI</th>
                            <th className="text-left py-2">Call IV</th>
                            <th className="text-left py-2">Put OI</th>
                            <th className="text-left py-2">Put IV</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chain.map(r => (
                            <tr key={r.strike} className="border-t border-white/5">
                              <td className="py-2">{r.strike}</td>
                              <td className="py-2">{r.call.oi}</td>
                              <td className="py-2">{r.call.iv}</td>
                              <td className="py-2">{r.put.oi}</td>
                              <td className="py-2">{r.put.iv}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {active === 'oi-heatmap' && (
                <motion.div key="oi-heatmap" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Open Interest Heatmap • {symbol}</h3>
                  {chain.length>0 ? (
                    <Heatmap
                      rows={["Call","Put"]}
                      cols={strikes}
                      get={(row, col) => {
                        const item = chain.find(x => x.strike === col)
                        if (!item) return 0
                        return row === 'Call' ? item.call.oi : item.put.oi
                      }}
                      labels={{ row: (r)=>r, col: (c)=>c }}
                    />
                  ) : (
                    <p className="text-white/60">Waiting for chain data...</p>
                  )}
                </motion.div>
              )}

              {active === 'pcr' && (
                <motion.div key="pcr" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Put/Call Ratio • {symbol}</h3>
                  {pcr.data && (
                    <div className="flex items-end gap-6">
                      <div className="text-4xl font-extrabold">{pcr.data.pcr}</div>
                      <div className="flex-1">
                        <Bars labels={["Calls","Puts"]} series={[[pcr.data.calls, pcr.data.puts]]} colors={["#f87171"]} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {active === 'vix' && (
                <motion.div key="vix" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">India VIX</h3>
                  {vix.data && <Sparkline points={vix.data.values} />}
                </motion.div>
              )}

              {active === 'fii-dii' && (
                <motion.div key="fii-dii" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">FII / DII Flows (₹ Cr)</h3>
                  {fii.data && (
                    <Bars labels={fii.data.days} series={[fii.data.fii, fii.data.dii]} colors={["#34d399", "#60a5fa"]} />
                  )}
                </motion.div>
              )}

              {active === 'advance-decline' && (
                <motion.div key="advance-decline" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Advance / Decline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ad.data?.breadth?.map((b) => (
                      <div key={b.index} className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <div className="font-semibold mb-1">{b.index}</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="h-2 bg-emerald-400/30 rounded">
                              <div className="h-2 bg-emerald-400 rounded" style={{ width: `${(b.adv/(b.adv+b.dec))*100}%` }} />
                            </div>
                            <div className="text-xs text-white/60 mt-1">Adv: {b.adv}</div>
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-rose-400/30 rounded">
                              <div className="h-2 bg-rose-400 rounded" style={{ width: `${(b.dec/(b.adv+b.dec))*100}%` }} />
                            </div>
                            <div className="text-xs text-white/60 mt-1">Dec: {b.dec}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {active === 'yield-curve' && (
                <motion.div key="yield-curve" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Yield Curve (G-Secs)</h3>
                  {yc.data && (
                    <div className="overflow-x-auto">
                      <svg width="700" height="220" className="min-w-[560px] w-full">
                        {(() => {
                          const m = { t: 10, r: 20, b: 20, l: 40 }
                          const W = 700 - m.l - m.r
                          const H = 220 - m.t - m.b
                          const n = yc.data.maturities.length
                          const xs = (i) => m.l + (i/(n-1))*W
                          const maxY = Math.max(...yc.data.yields)
                          const minY = Math.min(...yc.data.yields)
                          const ys = (v) => m.t + H - ((v - minY)/(maxY - minY || 1))*H
                          const path = yc.data.yields.map((y, i) => `${i===0?'M':'L'}${xs(i)},${ys(y)}`).join(' ')
                          return (
                            <g>
                              <defs>
                                <linearGradient id="curve" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#a78bfa" />
                                  <stop offset="100%" stopColor="#22d3ee" />
                                </linearGradient>
                              </defs>
                              <path d={path} fill="none" stroke="url(#curve)" strokeWidth="3" />
                              {yc.data.yields.map((y, i) => (
                                <circle key={i} cx={xs(i)} cy={ys(y)} r="4" fill="#22d3ee" />
                              ))}
                              {yc.data.maturities.map((mLab, i) => (
                                <text key={mLab} x={xs(i)} y={H + m.t + 14} fontSize="10" textAnchor="middle" fill="#9CA3AF">{mLab}</text>
                              ))}
                            </g>
                          )
                        })()}
                      </svg>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Analytics
