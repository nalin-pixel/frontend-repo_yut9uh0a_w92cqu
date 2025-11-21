import Hero from './components/Hero'
import Markets from './components/Markets'
import Workbench from './components/Workbench'
import PaperTrade from './components/PaperTrade'

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Hero />
      <Markets />
      <Workbench />
      <PaperTrade />
      <footer className="bg-black/90 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          <div className="text-white/60">© {new Date().getFullYear()} OPUS</div>
          <a href="/test" className="text-white/60 hover:text-white">System Status</a>
        </div>
      </footer>
    </div>
  )
}

export default App
