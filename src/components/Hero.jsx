import Spline from '@splinetool/react-spline'

function Hero() {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/44zrIZf-iQZhbQNQ/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-24">
        <div className="backdrop-blur-[2px]">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
            OPUS
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-white/80">
            A multi-asset algo trading platform for equities, derivatives, currency, commodities, and more. Backtest, paper-trade, and orchestrate live strategies across markets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#markets" className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition">Explore Markets</a>
            <a href="#workbench" className="px-5 py-2.5 rounded-lg bg-transparent border border-white/30 hover:border-white/60 transition font-semibold">Open Workbench</a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black"></div>
    </section>
  )
}

export default Hero
