import { useEffect, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Markets() {
  const [data, setData] = useState(null)
  const [tier, setTier] = useState('ALL')
  const [loading, setLoading] = useState(false)

  const fetchData = async (t) => {
    setLoading(true)
    try {
      const url = t && t !== 'ALL' ? `${BACKEND}/api/markets?tier=${encodeURIComponent(t)}` : `${BACKEND}/api/markets`
      const res = await fetch(url)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(tier) }, [])

  const tiers = ['ALL','TIER-1','TIER-2','TIER-3']

  return (
    <section id="markets" className="bg-slate-950 text-white py-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Supported Markets</h2>
          <div className="flex gap-2">
            {tiers.map(t => (
              <button key={t} onClick={() => { setTier(t); fetchData(t) }}
                className={`px-3 py-1.5 rounded-lg text-sm border ${tier===t? 'bg-white text-black border-white':'border-white/30 hover:border-white/60'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-white/70">Loading...</p>}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data).map(([group, items]) => (
              <div key={group} className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">{group}</h3>
                <ul className="space-y-2 text-sm text-white/90 list-disc list-inside">
                  {Array.isArray(items) ? items.map((it, idx) => (
                    <li key={idx} className="">
                      <span className="font-medium">{it.segment || it.assets?.join(', ') || 'Category'}</span>
                      {it.exchanges && <div className="text-white/60">Exchanges: {it.exchanges.join(', ')}</div>}
                      {it.indices && <div className="text-white/60">Indices: {it.indices.join(', ')}</div>}
                      {it.pairs && <div className="text-white/60">Pairs: {it.pairs.join(', ')}</div>}
                      {it.contracts && <div className="text-white/60">Contracts: {it.contracts.join(', ')}</div>}
                      {it.notes && <div className="text-white/60">Strategies: {it.notes.join(', ')}</div>}
                      {it.data && <div className="text-white/60">Data: {it.data.join(', ')}</div>}
                    </li>
                  )) : null}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Markets
