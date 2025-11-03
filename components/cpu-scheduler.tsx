"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Plus, Trash2, Zap, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import {
  executeFCFS,
  executeSJF,
  executeRoundRobin,
  executePriority,
  executeMultilevelQueue,
  type Process,
  type SchedulerState,
} from "@/lib/scheduling-algorithms"

type AlgorithmType = "fcfs" | "sjf" | "rr" | "priority" | "mlq"

const CPUScheduler = () => {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("fcfs")
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, name: "P1", burstTime: 10, arrivalTime: 0, remainingTime: 10, color: "#3b82f6", priority: 1, queue: 0 },
    { id: 2, name: "P2", burstTime: 5, arrivalTime: 1, remainingTime: 5, color: "#10b981", priority: 2, queue: 1 },
    { id: 3, name: "P3", burstTime: 8, arrivalTime: 2, remainingTime: 8, color: "#f59e0b", priority: 3, queue: 0 },
  ])
  const [timeQuantum, setTimeQuantum] = useState(4)
  const [currentTime, setCurrentTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [stepMode, setStepMode] = useState(false)
  const [readyQueue, setReadyQueue] = useState<Process[]>([])
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null)
  const [quantumLeft, setQuantumLeft] = useState(0)
  const [ganttChart, setGanttChart] = useState<{ process: string; start: number; color: string }[]>([])
  const [completedProcesses, setCompletedProcesses] = useState<(Process & { completionTime: number })[]>([])
  const [contextSwitches, setContextSwitches] = useState(0)
  const [speed, setSpeed] = useState(800)
  const [mlqQuantumState, setMlqQuantumState] = useState({ queue0Quantum: 0, queue1Quantum: 0 })
  const [simulationHistory, setSimulationHistory] = useState<SchedulerState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const initializeSchedulerState = (): SchedulerState => ({
    currentTime: 0,
    readyQueue: [],
    currentProcess: null,
    completedProcesses: [],
    ganttChart: [],
    contextSwitches: 0,
  })

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
        priority: newId,
        queue: 0,
      },
    ])
  }

  const removeProcess = (id: number) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const updateProcess = (id: number, field: string, value: any) => {
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
    setStepMode(false)
    setCurrentTime(0)
    setReadyQueue([])
    setCurrentProcess(null)
    setQuantumLeft(0)
    setMlqQuantumState({ queue0Quantum: 0, queue1Quantum: 0 })
    setGanttChart([])
    setCompletedProcesses([])
    setContextSwitches(0)
    setSimulationHistory([])
    setHistoryIndex(-1)
    setProcesses(processes.map((p) => ({ ...p, remainingTime: p.burstTime })))
  }

  const executeStep = () => {
    let newState: SchedulerState = {
      currentTime,
      readyQueue: readyQueue.map((p) => processes.find((pr) => pr.id === p.id) || p),
      currentProcess: currentProcess ? processes.find((p) => p.id === currentProcess.id) || currentProcess : null,
      completedProcesses,
      ganttChart,
      contextSwitches,
    }

    if (algorithm === "fcfs") {
      newState = executeFCFS(processes, newState)
    } else if (algorithm === "sjf") {
      newState = executeSJF(processes, newState)
    } else if (algorithm === "rr") {
      const result = executeRoundRobin(processes, newState, timeQuantum, quantumLeft)
      newState = result.state
      setQuantumLeft(result.quantumLeft)
    } else if (algorithm === "priority") {
      newState = executePriority(processes, newState)
    } else if (algorithm === "mlq") {
      const result = executeMultilevelQueue(processes, newState, mlqQuantumState)
      newState = result.state
      setMlqQuantumState(result.quantumState)
    }

    setProcesses(
      processes.map((p) => {
        const updated =
          newState.readyQueue.find((rp) => rp.id === p.id) || newState.currentProcess?.id === p.id
            ? {
                ...p,
                remainingTime:
                  newState.currentProcess?.id === p.id ? newState.currentProcess.remainingTime : p.remainingTime,
              }
            : p
        const completed = newState.completedProcesses.find((cp) => cp.id === p.id)
        return completed || newState.currentProcess?.id === p.id ? updated : p
      }),
    )

    setReadyQueue(newState.readyQueue)
    setCurrentProcess(newState.currentProcess || null)
    setGanttChart(newState.ganttChart)
    setCompletedProcesses(newState.completedProcesses)
    setContextSwitches(newState.contextSwitches)
    setCurrentTime(currentTime + 1)

    const newHistory = simulationHistory.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setSimulationHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const stepBackward = () => {
    if (historyIndex > 0) {
      const prevState = simulationHistory[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      setCurrentTime(prevState.currentTime)
      setReadyQueue(prevState.readyQueue)
      setCurrentProcess(prevState.currentProcess)
      setCompletedProcesses(prevState.completedProcesses)
      setGanttChart(prevState.ganttChart)
      setContextSwitches(prevState.contextSwitches)
    }
  }

  const stepForward = () => {
    if (historyIndex < simulationHistory.length - 1) {
      const nextState = simulationHistory[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      setCurrentTime(nextState.currentTime)
      setReadyQueue(nextState.readyQueue)
      setCurrentProcess(nextState.currentProcess)
      setCompletedProcesses(nextState.completedProcesses)
      setGanttChart(nextState.ganttChart)
      setContextSwitches(nextState.contextSwitches)
    } else if (historyIndex === simulationHistory.length - 1 && historyIndex >= 0) {
      executeStep()
    }
  }

  useEffect(() => {
    if (!isRunning || stepMode) return

    const timer = setTimeout(() => {
      executeStep()

      const allCompleted = processes.every(
        (p) =>
          completedProcesses.find((cp) => cp.id === p.id) ||
          (currentProcess?.id === p.id && currentProcess.remainingTime === 0),
      )

      if (allCompleted && !currentProcess && readyQueue.length === 0) {
        setIsRunning(false)
      }
    }, speed)

    return () => clearTimeout(timer)
  }, [
    isRunning,
    stepMode,
    currentTime,
    currentProcess,
    readyQueue,
    completedProcesses,
    ganttChart,
    algorithm,
    processes,
    timeQuantum,
    speed,
    quantumLeft,
    mlqQuantumState,
  ])

  const calculateMetrics = () => {
    if (completedProcesses.length === 0) return null

    const metrics = completedProcesses.map((cp) => {
      const originalProcess = processes.find((p) => p.id === cp.id)
      const turnaroundTime = cp.completionTime - (originalProcess?.arrivalTime || 0)
      const waitingTime = turnaroundTime - (originalProcess?.burstTime || 0)
      return { ...cp, turnaroundTime, waitingTime }
    })

    const avgTurnaround = metrics.reduce((sum, m) => sum + m.turnaroundTime, 0) / metrics.length
    const avgWaiting = metrics.reduce((sum, m) => sum + m.waitingTime, 0) / metrics.length

    return { metrics, avgTurnaround, avgWaiting }
  }

  const results = calculateMetrics()

  const algorithmLabels = {
    fcfs: "FCFS (First Come First Serve)",
    sjf: "SJF (Shortest Job First)",
    rr: "Round Robin",
    priority: "Priority Scheduling",
    mlq: "Multilevel Queue",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Select Algorithm</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(["fcfs", "sjf", "rr", "priority", "mlq"] as AlgorithmType[]).map((algo) => (
              <button
                key={algo}
                onClick={() => {
                  setAlgorithm(algo)
                  reset()
                }}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                  algorithm === algo
                    ? "bg-blue-500 text-white border-2 border-blue-400"
                    : "bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20"
                }`}
              >
                {algorithmLabels[algo]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Process Configuration</h2>
              <button
                onClick={addProcess}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                <Plus size={18} /> Add Process
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {processes.map((process) => (
                <div key={process.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg flex-wrap">
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
                    className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="Burst"
                    disabled={isRunning}
                    min="1"
                  />
                  <span className="text-white/60 text-xs">BT</span>
                  <input
                    type="number"
                    value={process.arrivalTime}
                    onChange={(e) => updateProcess(process.id, "arrivalTime", e.target.value)}
                    className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="Arrival"
                    disabled={isRunning}
                    min="0"
                  />
                  <span className="text-white/60 text-xs">AT</span>

                  {algorithm === "priority" && (
                    <>
                      <input
                        type="number"
                        value={process.priority || 1}
                        onChange={(e) => updateProcess(process.id, "priority", e.target.value)}
                        className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                        placeholder="Priority"
                        disabled={isRunning}
                        min="1"
                      />
                      <span className="text-white/60 text-xs">PRI</span>
                    </>
                  )}

                  {algorithm === "mlq" && (
                    <>
                      <input
                        type="number"
                        value={process.queue || 0}
                        onChange={(e) => updateProcess(process.id, "queue", e.target.value)}
                        className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                        placeholder="Queue"
                        disabled={isRunning}
                        min="0"
                        max="2"
                      />
                      <span className="text-white/60 text-xs">Q</span>
                    </>
                  )}

                  <button
                    onClick={() => removeProcess(process.id)}
                    disabled={isRunning}
                    className="ml-auto p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              {algorithm === "rr" && (
                <>
                  <label className="text-white font-medium">Time Quantum:</label>
                  <input
                    type="number"
                    value={timeQuantum}
                    onChange={(e) => setTimeQuantum(Number.parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    disabled={isRunning}
                    min="1"
                  />
                </>
              )}
              {algorithm === "mlq" && (
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-white/60 text-xs mb-1">MLQ Quantum State</div>
                  <div className="text-xs text-white/40">Q0 (High): FCFS</div>
                  <div className="text-xs text-white/40">Q1 (Medium): RR (TQ=3)</div>
                  <div className="text-xs text-white/40">Q2 (Low): RR (TQ=5)</div>
                </div>
              )}
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
              <span className="text-white/60">{(10000 / speed).toFixed(1)}x</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (stepMode) {
                    executeStep()
                  } else {
                    setIsRunning(!isRunning)
                  }
                }}
                disabled={
                  stepMode &&
                  historyIndex >= simulationHistory.length - 1 &&
                  completedProcesses.length === processes.length
                }
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${isRunning ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"} text-white`}
              >
                {stepMode ? (
                  <>
                    <ChevronRight size={20} /> Next Step
                  </>
                ) : isRunning ? (
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
                onClick={() => setStepMode(!stepMode)}
                disabled={isRunning && !stepMode}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${stepMode ? "bg-purple-500 hover:bg-purple-600" : "bg-white/10 hover:bg-white/20"} text-white border border-white/20`}
              >
                Step Mode
              </button>

              {stepMode && (
                <div className="flex gap-2">
                  <button
                    onClick={stepBackward}
                    disabled={historyIndex <= 0}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/40 text-white rounded-lg font-medium transition"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    onClick={stepForward}
                    disabled={
                      historyIndex >= simulationHistory.length - 1 && completedProcesses.length === processes.length
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/40 text-white rounded-lg font-medium transition"
                  >
                    Forward <ChevronRight size={18} />
                  </button>
                </div>
              )}

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
              {stepMode && (
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-white/60 text-sm">Step Progress</div>
                  <div className="text-xl font-bold text-white">
                    {historyIndex + 1} / {Math.max(simulationHistory.length, currentTime + 1)}
                  </div>
                </div>
              )}
              <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                <div className="flex items-center gap-2 text-orange-200 text-sm">
                  <Zap size={16} />
                  Context Switches
                </div>
                <div className="text-2xl font-bold text-white">{contextSwitches}</div>
              </div>
              {currentProcess && (
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-white/60 text-sm">Executing</div>
                  <div className="text-xl font-bold text-white">{currentProcess.name}</div>
                  <div className="text-white/60 text-sm mt-1">Remaining: {currentProcess.remainingTime}</div>
                  {algorithm === "rr" && <div className="text-white/60 text-sm">Quantum left: {quantumLeft}</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Animation Area */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Process Flow Animation</h2>

            <div className="space-y-2">
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
                          style={{ backgroundColor: process.color }}
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

              <div>
                <div className="text-center mb-1">
                  <div className="inline-block bg-yellow-500/20 px-3 py-0.5 rounded-lg border border-yellow-500/30">
                    <div className="text-yellow-200 text-xs font-semibold">CPU EXECUTION</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border-2 border-yellow-400/40 p-2 h-20 flex items-center justify-center">
                  {currentProcess ? (
                    <div
                      className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-2xl border-4 border-yellow-400 text-sm"
                      style={{ backgroundColor: currentProcess.color, animation: "pulse 2s ease-in-out infinite" }}
                    >
                      <div>{currentProcess.name}</div>
                      <div className="text-xs">RT: {currentProcess.remainingTime}</div>
                    </div>
                  ) : (
                    <div className="text-white/40 italic text-xs">CPU Idle</div>
                  )}
                </div>
                <div className="flex justify-center">
                  <ArrowDown className="text-green-400" size={16} />
                </div>
              </div>

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
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-white text-sm">
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
                        <td className="p-3">{processes.find((p) => p.id === metric.id)?.arrivalTime}</td>
                        <td className="p-3">{processes.find((p) => p.id === metric.id)?.burstTime}</td>
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
                    Context Switches
                  </div>
                  <div className="text-2xl font-bold text-white">{contextSwitches}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.5); transform: scale(1); }
          50% { box-shadow: 0 0 40px rgba(250, 204, 21, 0.8); transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

export default CPUScheduler
