export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-blue-500/20 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">About This Project</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              An interactive educational tool for understanding CPU scheduling algorithms, specifically the Round Robin
              scheduling mechanism used in modern operating systems.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span> Real-time process visualization
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span> Configurable process parameters
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span> Performance metrics calculation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span> Gantt chart generation
              </li>
            </ul>
          </div>

          {/* Student Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Created By</h3>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-white font-semibold mb-1">Vaidant Sharma</p>
              <p className="text-blue-400 text-sm mb-2">Roll No: 23BKT0016</p>
              <p className="text-slate-400 text-sm">Operating System (BCSE303L)</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-8" />

        {/* Bottom Info */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© 2025 Round Robin Scheduler. Educational Tool for OS Learning.</p>
          <p className="mt-4 md:mt-0">Built with React & Next.js</p>
        </div>
      </div>
    </footer>
  )
}
