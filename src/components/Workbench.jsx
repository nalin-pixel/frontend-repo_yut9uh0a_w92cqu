import { useEffect, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Workbench() {
  const [strategies, setStrategies] = useState([])
  const [name, setName] = useState('Breakout 15m')
  const [category, setCategory] = useState('breakout')
  const [market, setMarket] = useState('equity')
  const [parameters, setParameters] = useState({ period: 20, threshold: 1.5 })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/strategies`)
      const json = await res.json()
      setStrategies(json)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${BACKEND}/api/strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, market, parameters })
      })
      const json = await res.json()
      if (json.id) {
        await load()
      } else {
        alert('Failed to save strategy')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="workbench" className="bg-slate-950 text-white py-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Strategy Workbench</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900/60 border border-white/10 rounded-xl p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Name</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-800 rounded-lg px-3 py-2 outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Category</label>
                <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-slate-800 rounded-lg px-3 py-2 outline-none border border-white/10">
                  <option>breakout</option>
                  <option>moving-average</option>
                  <option>momentum</option>
                  <option>vwap</option>
                  <option>scalping</option>
                  <option>options-spread</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Market</label>
                <select value={market} onChange={e=>setMarket(e.target.value)} className="w-full bg-slate-800 rounded-lg px-3 py-2 outline-none border border-white/10">
                  <option>equity</option>
                  <option>futures</option>
                  <option>options</option>
                  <option>currency</option>
                  <option>commodity</option>
                  <option>crypto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Parameters (JSON)</label>
                <textarea rows={5} value={JSON.stringify(parameters, null, 2)} onChange={e=>{try{setParameters(JSON.parse(e.target.value))}catch{}}} className="w-full bg-slate-800 rounded-lg px-3 py-2 outline-none border border-white/10 font-mono text-sm" />
              </div>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving? 'Saving...' : 'Save Strategy'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Saved Strategies</h3>
            <div className="space-y-3">
              {strategies.length === 0 && <p className="text-white/60">No strategies yet. Create one on the left.</p>}
              {strategies.map(s => (
                <div key={s._id} className="border border-white/10 rounded-lg p-3 bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-white/60">{s.category} • {s.market}</div>
                    </div>
                    <div className="text-xs text-white/60">{new Date(s.created_at?.$date || Date.now()).toLocaleString()}</div>
                  </div>
                  {s.parameters && <pre className="mt-2 text-xs bg-black/40 p-2 rounded-lg overflow-x-auto">{JSON.stringify(s.parameters, null, 2)}</pre>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Workbench
