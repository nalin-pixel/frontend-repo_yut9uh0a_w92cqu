import { useEffect, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function PaperTrade() {
  const [symbol, setSymbol] = useState('NIFTY')
  const [side, setSide] = useState('BUY')
  const [qty, setQty] = useState(50)
  const [price, setPrice] = useState(24000)
  const [trades, setTrades] = useState([])
  const [placing, setPlacing] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/paper/trades`)
      const json = await res.json()
      setTrades(json)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [])

  const place = async () => {
    setPlacing(true)
    try {
      const order = {
        instrument: { symbol, exchange: 'NSE', asset_class: 'Futures' },
        side,
        qty: Number(qty),
        price: Number(price)
      }
      const res = await fetch(`${BACKEND}/api/paper/order`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order)
      })
      const json = await res.json()
      if (json.id) {
        await load()
      } else {
        alert('Order failed')
      }
    } catch (e) { console.error(e) } finally { setPlacing(false) }
  }

  return (
    <section className="bg-slate-950 text-white py-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Paper Trade</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900/60 border border-white/10 rounded-xl p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Symbol</label>
                <input value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full bg-slate-800 rounded-lg px-3 py-2 outline-none border border-white/10" />
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setSide('BUY')} className={`px-3 py-2 rounded-lg border ${side==='BUY'? 'bg-emerald-400 text-black border-emerald-400':'border-white/20'}`}>BUY</button>
                <button onClick={()=>setSide('SELL')} className={`px-3 py-2 rounded-lg border ${side==='SELL'? 'bg-rose-400 text-black border-rose-400':'border-white/20'}`}>SELL</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Qty</label>
                  <input type="number" value={qty} onChange={e=>setQty(e.target.value)} className="w-full bg-slate-800 rounded-lg px-3 py-2 outline-none border border-white/10" />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Price</label>
                  <input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full bg-slate-800 rounded-lg px-3 py-2 outline-none border border-white/10" />
                </div>
              </div>
              <button onClick={place} disabled={placing} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50">
                {placing? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Trade Log</h3>
            <div className="space-y-3">
              {trades.length === 0 && <p className="text-white/60">No trades yet.</p>}
              {trades.map(t => (
                <div key={t._id} className="border border-white/10 rounded-lg p-3 bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{t.instrument?.symbol} • {t.side}</div>
                    <div className="text-xs text-white/60">{new Date(t.created_at?.$date || Date.now()).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-white/80">Qty: {t.qty} @ {t.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PaperTrade
