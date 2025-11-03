export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-blue-500/20 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              CPU Scheduling Visualizer
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            Interactive Visualization for All Major CPU Scheduling Algorithms
          </p>
          <div className="text-xs md:text-sm text-slate-400 pt-2 border-t border-slate-700/50">
            Course: <span className="text-blue-400 font-semibold">Operating System BCSE303L</span>
          </div>
        </div>
      </div>
    </header>
  )
}
