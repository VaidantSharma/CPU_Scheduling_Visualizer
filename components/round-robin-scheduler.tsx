"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Plus, Trash2, Zap, ArrowDown } from "lucide-react"

export default function RoundRobinScheduler() {
  const [processes, setProcesses] = useState([
    { id: 1, name: "P1", burstTime: 10, arrivalTime: 0, remainingTime: 10, color: "#3b82f6" },
    { id: 2, name: "P2", burstTime: 5, arrivalTime: 1, remainingTime: 5, color: "#10b981" },
    { id: 3, name: "P3", burstTime: 8, arrivalTime: 2, remainingTime: 8, color: "#f59e0b" },
  ])
  const [timeQuantum, setTimeQuantum] = useState(4)
  const [currentTime, setCurrentTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [readyQueue, setReadyQueue] = useState([])
  const [currentProcess, setCurrentProcess] = useState(null)
  const [quantumLeft, setQuantumLeft] = useState(0)
  const [ganttChart, setGanttChart] = useState([])
  const [completedProcesses, setCompletedProcesses] = useState([])
  const [contextSwitches, setContextSwitches] = useState(0)
  const [speed, setSpeed] = useState(800)
  const [arrivingProcess, setArrivingProcess] = useState(null)
  const [movingToQueue, setMovingToQueue] = useState(null)
  const [movingToCPU, setMovingToCPU] = useState(null)
  const [returningToQueue, setReturningToQueue] = useState(null)
  const [movingToCompleted, setMovingToCompleted] = useState(null)

  const addProcess = () => {
    const newId = Math.max(...processes.map((p) => p.id), 0) + 1
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
    setProcesses([
      ...processes,
      {
        id: newId,
        name: `P${newId}`,
        burstTime: 5,
        arrivalTime: 0,
        remainingTime: 5,
        color: colors[newId % colors.length],
      },
    ])
  }

  const removeProcess = (id) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const updateProcess = (id, field, value) => {
    setProcesses(
      processes.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: Number.parseInt(value) || 0,
              remainingTime: field === "burstTime" ? Number.parseInt(value) || 0 : p.remainingTime,
            }
          : p,
      ),
    )
  }

  const reset = () => {
    setIsRunning(false)
    setCurrentTime(0)
    setReadyQueue([])
    setCurrentProcess(null)
    setQuantumLeft(0)
    setGanttChart([])
    setCompletedProcesses([])
    setContextSwitches(0)
    setArrivingProcess(null)
    setMovingToQueue(null)
    setMovingToCPU(null)
    setReturningToQueue(null)
    setMovingToCompleted(null)
    setProcesses(processes.map((p) => ({ ...p, remainingTime: p.burstTime })))
  }

  useEffect(() => {
    if (!isRunning) return

    const timer = setTimeout(() => {
      // Step 1: Add newly arrived processes to ready queue
      const arrivedProcesses = processes.filter(
        (p) =>
          p.arrivalTime === currentTime &&
          p.remainingTime > 0 &&
          !readyQueue.find((rp) => rp.id === p.id) &&
          (!currentProcess || currentProcess.id !== p.id) &&
          !completedProcesses.find((cp) => cp.id === p.id),
      )

      // Step 2: If no current process and queue has processes, move next to CPU
      if (!currentProcess && readyQueue.length > 0 && !movingToCPU && !movingToQueue && !returningToQueue) {
        const nextProcess = readyQueue[0]
        setMovingToCPU(nextProcess)

        setTimeout(() => {
          // Remove from ready queue immediately when moving to CPU
          const updatedQueue = readyQueue.slice(1)
          setReadyQueue(updatedQueue)
          setCurrentProcess(nextProcess)
          setQuantumLeft(timeQuantum)
          setGanttChart((prev) => [
            ...prev,
            { process: nextProcess.name, start: currentTime, color: nextProcess.color },
          ])
          setMovingToCPU(null)
          if (ganttChart.length > 0) {
            setContextSwitches((prev) => prev + 1)
          }
        }, speed * 0.7)
      }
      // Step 3: Execute current process
      else if (currentProcess && !movingToCPU && !movingToCompleted && !returningToQueue) {
        const updatedProcess = { ...currentProcess, remainingTime: currentProcess.remainingTime - 1 }
        const newQuantumLeft = quantumLeft - 1

        setProcesses(processes.map((p) => (p.id === updatedProcess.id ? updatedProcess : p)))
        setCurrentProcess(updatedProcess)
        setQuantumLeft(newQuantumLeft)

        // Check if process completed
        if (updatedProcess.remainingTime === 0) {
          setMovingToCompleted(updatedProcess)
          setTimeout(() => {
            setCompletedProcesses((prev) => [...prev, { ...updatedProcess, completionTime: currentTime + 1 }])
            setCurrentProcess(null)
            setQuantumLeft(0)
            setMovingToCompleted(null)

            // Move next process from queue if available
            if (readyQueue.length > 0) {
              setTimeout(() => {
                const nextProcess = readyQueue[0]
                setMovingToCPU(nextProcess)
                setTimeout(() => {
                  const updatedQueue = readyQueue.slice(1)
                  setReadyQueue(updatedQueue)
                  setCurrentProcess(nextProcess)
                  setQuantumLeft(timeQuantum)
                  setGanttChart((prev) => [
                    ...prev,
                    { process: nextProcess.name, start: currentTime + 1, color: nextProcess.color },
                  ])
                  setContextSwitches((prev) => prev + 1)
                  setMovingToCPU(null)
                }, speed * 0.7)
              }, speed * 0.3)
            }
          }, speed * 0.7)
        }
        // Check if quantum expired
        else if (newQuantumLeft === 0) {
          setReturningToQueue(updatedProcess)
          setTimeout(() => {
            setCurrentProcess(null)
            setQuantumLeft(0)
            const updatedQueue = [...readyQueue, updatedProcess]
            setReadyQueue(updatedQueue)
            setReturningToQueue(null)

            // Move next process from queue
            if (updatedQueue.length > 0) {
              setTimeout(() => {
                const nextProcess = updatedQueue[0]
                setMovingToCPU(nextProcess)
                setTimeout(() => {
                  const finalQueue = updatedQueue.slice(1)
                  setReadyQueue(finalQueue)
                  setCurrentProcess(nextProcess)
                  setQuantumLeft(timeQuantum)
                  setGanttChart((prev) => [
                    ...prev,
                    { process: nextProcess.name, start: currentTime + 1, color: nextProcess.color },
                  ])
                  setContextSwitches((prev) => prev + 1)
                  setMovingToCPU(null)
                }, speed * 0.7)
              }, speed * 0.3)
            }
          }, speed * 0.7)
        }
      }

      // Step 4: Add ALL arrived processes to queue (handles multiple arrivals at same time)
      if (arrivedProcesses.length > 0) {
        // Show arrival animation for first process only (visual simplification)
        const firstProc = arrivedProcesses[0]
        setArrivingProcess(firstProc)

        setTimeout(() => {
          setArrivingProcess(null)
          // If multiple processes arrived, show moving animation for first one
          if (arrivedProcesses.length === 1) {
            setMovingToQueue(firstProc)
          }

          setTimeout(() => {
            // Add ALL arrived processes to the queue at once
            setReadyQueue((prev) => [...prev, ...arrivedProcesses])
            setMovingToQueue(null)
          }, speed * 0.6)
        }, speed * 0.5)
      }

      setCurrentTime(currentTime + 1)

      // Check if all processes completed
      const allCompleted = processes.every(
        (p) =>
          completedProcesses.find((cp) => cp.id === p.id) ||
          (movingToCompleted && movingToCompleted.id === p.id) ||
          p.remainingTime === 0,
      )

      if (
        allCompleted &&
        !currentProcess &&
        readyQueue.length === 0 &&
        !movingToCPU &&
        !returningToQueue &&
        !movingToQueue
      ) {
        setIsRunning(false)
      }
    }, speed)

    return () => clearTimeout(timer)
  }, [
    isRunning,
    currentTime,
    currentProcess,
    readyQueue,
    quantumLeft,
    completedProcesses,
    movingToCPU,
    movingToQueue,
    returningToQueue,
    movingToCompleted,
    processes,
    ganttChart,
    timeQuantum,
    speed,
  ])

  const calculateMetrics = () => {
    if (completedProcesses.length === 0) return null

    const metrics = completedProcesses.map((cp) => {
      const originalProcess = processes.find((p) => p.id === cp.id)
      const turnaroundTime = cp.completionTime - originalProcess.arrivalTime
      const waitingTime = turnaroundTime - originalProcess.burstTime
      return { ...cp, turnaroundTime, waitingTime }
    })

    const avgTurnaround = metrics.reduce((sum, m) => sum + m.turnaroundTime, 0) / metrics.length
    const avgWaiting = metrics.reduce((sum, m) => sum + m.waitingTime, 0) / metrics.length

    return { metrics, avgTurnaround, avgWaiting }
  }

  const results = calculateMetrics()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Round Robin Scheduler</h1>
        <p className="text-blue-200 text-center mb-8">CPU Scheduling Algorithm Visualization</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Process Configuration</h2>
              <button
                onClick={addProcess}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                disabled={isRunning}
              >
                <Plus size={18} /> Add Process
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {processes.map((process) => (
                <div key={process.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: process.color }}
                  >
                    {process.name}
                  </div>
                  <input
                    type="number"
                    value={process.burstTime}
                    onChange={(e) => updateProcess(process.id, "burstTime", e.target.value)}
                    className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="Burst"
                    disabled={isRunning}
                    min="1"
                  />
                  <span className="text-white/60 text-sm">Burst</span>
                  <input
                    type="number"
                    value={process.arrivalTime}
                    onChange={(e) => updateProcess(process.id, "arrivalTime", e.target.value)}
                    className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="Arrival"
                    disabled={isRunning}
                    min="0"
                  />
                  <span className="text-white/60 text-sm">Arrival</span>
                  <button
                    onClick={() => removeProcess(process.id)}
                    className="ml-auto p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition"
                    disabled={isRunning}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="text-white font-medium">Time Quantum:</label>
              <input
                type="number"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Number.parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                disabled={isRunning}
                min="1"
              />
              <label className="text-white font-medium">Speed:</label>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={Math.round(10000 / speed)}
                onChange={(e) => setSpeed(Math.round(10000 / Number.parseInt(e.target.value)))}
                className="w-40"
              />
              <span className="text-white/60 text-sm">{(10000 / speed).toFixed(1)}x</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  isRunning ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {isRunning ? (
                  <>
                    <Pause size={20} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={20} /> Start
                  </>
                )}
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
              >
                <RotateCcw size={20} /> Reset
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-white/60 text-sm">Current Time</div>
                <div className="text-2xl font-bold text-white">{currentTime}</div>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                <div className="flex items-center gap-2 text-orange-200 text-sm">
                  <Zap size={16} />
                  Context Switches
                </div>
                <div className="text-2xl font-bold text-white">{contextSwitches}</div>
              </div>
              {currentProcess && !movingToCPU && (
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-white/60 text-sm">Executing</div>
                  <div className="text-xl font-bold text-white">{currentProcess.name}</div>
                  <div className="text-white/60 text-sm mt-1">Quantum left: {quantumLeft}</div>
                  <div className="text-white/60 text-sm">Remaining: {currentProcess.remainingTime}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Animation Area - Row-wise Flow */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Process Flow Animation</h2>

          <div className="space-y-2">
            {/* Row 1: New Arrival */}
            <div>
              <div className="text-center mb-1">
                <div className="inline-block bg-purple-500/20 px-3 py-0.5 rounded-lg border border-purple-500/30">
                  <div className="text-purple-200 text-xs font-semibold">NEW ARRIVAL</div>
                </div>
              </div>
              <div className="flex justify-center items-center h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border-2 border-dashed border-purple-400/30">
                {arrivingProcess && (
                  <div
                    className="w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-2xl border-4 border-purple-400 text-xs"
                    style={{
                      backgroundColor: arrivingProcess.color,
                      animation: "slideInTop 0.5s ease-out",
                    }}
                  >
                    <div>{arrivingProcess.name}</div>
                    <div className="text-xs">BT: {arrivingProcess.burstTime}</div>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <ArrowDown className="text-purple-400" size={16} />
              </div>
            </div>

            {/* Transition Animation: Moving to Queue */}
            {movingToQueue && (
              <div className="flex justify-center h-10">
                <div
                  className="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-2xl border-4 border-blue-400 text-xs"
                  style={{
                    backgroundColor: movingToQueue.color,
                    animation: "moveDownRow 0.6s ease-in-out",
                  }}
                >
                  <div>{movingToQueue.name}</div>
                  <div className="text-xs">RT: {movingToQueue.remainingTime}</div>
                </div>
              </div>
            )}

            {/* Row 2: Ready Queue */}
            <div>
              <div className="text-center mb-1">
                <div className="inline-block bg-blue-500/20 px-3 py-0.5 rounded-lg border border-blue-500/30">
                  <div className="text-blue-200 text-xs font-semibold">READY QUEUE ({readyQueue.length})</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border-2 border-blue-400/30 p-2 h-20">
                <div className="flex items-center justify-center gap-2 flex-wrap h-full">
                  {readyQueue.length === 0 ? (
                    <div className="text-white/40 italic text-xs">Empty</div>
                  ) : (
                    readyQueue.map((process, idx) => (
                      <div
                        key={`${process.id}-${idx}`}
                        className="flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold border-2 border-white/40 shadow-lg text-xs"
                        style={{
                          backgroundColor: process.color,
                          animation: "popIn 0.5s ease-out",
                        }}
                      >
                        <div>{process.name}</div>
                        <div className="text-xs">RT: {process.remainingTime}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowDown className="text-blue-400" size={16} />
              </div>
            </div>

            {/* Transition Animation: Moving to CPU */}
            {movingToCPU && (
              <div className="flex justify-center h-10">
                <div
                  className="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-2xl border-4 border-yellow-400 text-xs"
                  style={{
                    backgroundColor: movingToCPU.color,
                    animation: "moveDownRow 0.7s ease-in-out",
                  }}
                >
                  <div>{movingToCPU.name}</div>
                  <div className="text-xs">RT: {movingToCPU.remainingTime}</div>
                </div>
              </div>
            )}

            {/* Row 3: CPU Execution */}
            <div>
              <div className="text-center mb-1">
                <div className="inline-block bg-yellow-500/20 px-3 py-0.5 rounded-lg border border-yellow-500/30">
                  <div className="text-yellow-200 text-xs font-semibold">CPU EXECUTION</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border-2 border-yellow-400/40 p-2 h-20 flex items-center justify-center">
                {currentProcess && !movingToCPU && !movingToCompleted && !returningToQueue && (
                  <div
                    className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-2xl border-4 border-yellow-400 relative text-sm"
                    style={{
                      backgroundColor: currentProcess.color,
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  >
                    <div>{currentProcess.name}</div>
                    <div className="text-xs">RT: {currentProcess.remainingTime}</div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs font-bold">
                      {quantumLeft}
                    </div>
                  </div>
                )}
                {!currentProcess && !movingToCPU && <div className="text-white/40 italic text-xs">CPU Idle</div>}
              </div>

              {/* Split arrows */}
              <div className="flex justify-center items-center gap-12">
                <div className="flex flex-col items-center">
                  <div className="text-green-300 text-xs">Complete</div>
                  <ArrowDown className="text-green-400" size={14} />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-orange-300 text-xs">Quantum Expires</div>
                  <ArrowDown className="text-orange-400" size={14} />
                </div>
              </div>
            </div>

            {/* Transition Animations */}
            <div className="flex justify-center gap-12 h-10">
              {movingToCompleted && (
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold shadow-2xl border-4 border-green-400 text-lg"
                  style={{
                    backgroundColor: movingToCompleted.color,
                    animation: "moveDownRow 0.7s ease-in-out",
                  }}
                >
                  ✓
                </div>
              )}
              {returningToQueue && (
                <div
                  className="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-2xl border-4 border-orange-400 text-xs"
                  style={{
                    backgroundColor: returningToQueue.color,
                    animation: "moveUpToQueue 0.7s ease-in-out",
                  }}
                >
                  <div>{returningToQueue.name}</div>
                  <div className="text-xs">RT: {returningToQueue.remainingTime}</div>
                </div>
              )}
            </div>

            {/* Row 4: Final Outcomes */}
            <div className="grid grid-cols-2 gap-3">
              {/* Completed Queue */}
              <div>
                <div className="text-center mb-1">
                  <div className="inline-block bg-green-500/20 px-3 py-0.5 rounded-lg border border-green-500/30">
                    <div className="text-green-200 text-xs font-semibold">COMPLETED ({completedProcesses.length})</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border-2 border-green-400/30 p-2 h-20">
                  <div className="flex items-center justify-center gap-2 flex-wrap h-full">
                    {completedProcesses.length === 0 ? (
                      <div className="text-white/40 italic text-xs">None</div>
                    ) : (
                      completedProcesses.map((process, idx) => (
                        <div
                          key={`completed-${process.id}-${idx}`}
                          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold border-2 border-green-400 shadow-lg text-lg"
                          style={{ backgroundColor: process.color }}
                        >
                          ✓
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Return indicator */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-orange-300 text-xs font-semibold mb-1">↑ Returns ↑</div>
                  <div className="text-white/60 text-xs">Back to Ready Queue</div>
                  <div className="text-white/60 text-xs">when quantum expires</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        {ganttChart.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Gantt Chart</h2>
            <div className="overflow-x-auto">
              <div className="flex min-w-max">
                {ganttChart.map((entry, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className="h-16 px-4 flex items-center justify-center text-white font-bold border border-white/30 transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: entry.color, minWidth: "80px" }}
                    >
                      {entry.process}
                    </div>
                    <div className="text-white/60 text-xs mt-1">{entry.start}</div>
                  </div>
                ))}
                {!isRunning && ganttChart.length > 0 && (
                  <div className="text-white/60 text-xs mt-12">{currentTime}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3">Process</th>
                    <th className="text-left p-3">Arrival</th>
                    <th className="text-left p-3">Burst</th>
                    <th className="text-left p-3">Completion</th>
                    <th className="text-left p-3">Turnaround</th>
                    <th className="text-left p-3">Waiting</th>
                  </tr>
                </thead>
                <tbody>
                  {results.metrics.map((metric) => (
                    <tr key={metric.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-3 font-medium">{metric.name}</td>
                      <td className="p-3">{processes.find((p) => p.id === metric.id).arrivalTime}</td>
                      <td className="p-3">{processes.find((p) => p.id === metric.id).burstTime}</td>
                      <td className="p-3">{metric.completionTime}</td>
                      <td className="p-3">{metric.turnaroundTime}</td>
                      <td className="p-3">{metric.waitingTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/20 px-4 py-3 rounded-lg border border-blue-500/30">
                <div className="text-blue-200 text-sm">Avg Turnaround Time</div>
                <div className="text-2xl font-bold text-white">{results.avgTurnaround.toFixed(2)}</div>
              </div>
              <div className="bg-green-500/20 px-4 py-3 rounded-lg border border-green-500/30">
                <div className="text-green-200 text-sm">Avg Waiting Time</div>
                <div className="text-2xl font-bold text-white">{results.avgWaiting.toFixed(2)}</div>
              </div>
              <div className="bg-orange-500/20 px-4 py-3 rounded-lg border border-orange-500/30">
                <div className="flex items-center gap-2 text-orange-200 text-sm">
                  <Zap size={16} />
                  Total Context Switches
                </div>
                <div className="text-2xl font-bold text-white">{contextSwitches}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInTop {
          from {
            transform: translateY(-50px) scale(0.5);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes popIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes moveDownRow {
          0% {
            transform: translateY(-80px) scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes moveUpToQueue {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-200px) scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-400px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.5);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px rgba(250, 204, 21, 0.8);
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}
