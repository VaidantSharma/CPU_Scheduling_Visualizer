export type Process = {
  id: number
  name: string
  burstTime: number
  arrivalTime: number
  remainingTime: number
  color: string
  priority?: number
  queue?: number
}

export type SchedulerState = {
  currentTime: number
  readyQueue: Process[]
  currentProcess: Process | null
  completedProcesses: (Process & { completionTime: number })[]
  ganttChart: { process: string; start: number; color: string }[]
  contextSwitches: number
}

// FCFS (First Come First Serve)
export function executeFCFS(processes: Process[], state: SchedulerState): SchedulerState {
  const arrivedProcesses = processes.filter(
    (p) =>
      p.arrivalTime === state.currentTime &&
      p.remainingTime > 0 &&
      !state.readyQueue.find((rp) => rp.id === p.id) &&
      (!state.currentProcess || state.currentProcess.id !== p.id) &&
      !state.completedProcesses.find((cp) => cp.id === p.id),
  )

  const newState = { ...state, contextSwitches: state.contextSwitches }
  arrivedProcesses.forEach((p) => {
    newState.readyQueue.push(p)
  })

  if (!newState.currentProcess && newState.readyQueue.length > 0) {
    const nextProcess = newState.readyQueue.shift()!
    newState.currentProcess = nextProcess
    newState.contextSwitches += 1
    newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime, color: nextProcess.color })
  } else if (newState.currentProcess) {
    const updated = { ...newState.currentProcess, remainingTime: newState.currentProcess.remainingTime - 1 }
    newState.currentProcess = updated

    if (updated.remainingTime === 0) {
      newState.completedProcesses.push({ ...updated, completionTime: state.currentTime + 1 })
      newState.currentProcess = null

      if (newState.readyQueue.length > 0) {
        const nextProcess = newState.readyQueue.shift()!
        newState.currentProcess = nextProcess
        newState.contextSwitches += 1
        newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime + 1, color: nextProcess.color })
      }
    }
  }

  return newState
}

// SJF (Shortest Job First) - Non-preemptive
export function executeSJF(processes: Process[], state: SchedulerState): SchedulerState {
  const arrivedProcesses = processes.filter(
    (p) =>
      p.arrivalTime === state.currentTime &&
      p.remainingTime > 0 &&
      !state.readyQueue.find((rp) => rp.id === p.id) &&
      (!state.currentProcess || state.currentProcess.id !== p.id) &&
      !state.completedProcesses.find((cp) => cp.id === p.id),
  )

  const newState = { ...state, contextSwitches: state.contextSwitches }
  arrivedProcesses.forEach((p) => {
    newState.readyQueue.push(p)
  })

  // Sort queue by burst time (shortest first)
  newState.readyQueue.sort((a, b) => a.burstTime - b.burstTime)

  if (!newState.currentProcess && newState.readyQueue.length > 0) {
    const nextProcess = newState.readyQueue.shift()!
    newState.currentProcess = nextProcess
    newState.contextSwitches += 1
    newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime, color: nextProcess.color })
  } else if (newState.currentProcess) {
    const updated = { ...newState.currentProcess, remainingTime: newState.currentProcess.remainingTime - 1 }
    newState.currentProcess = updated

    if (updated.remainingTime === 0) {
      newState.completedProcesses.push({ ...updated, completionTime: state.currentTime + 1 })
      newState.currentProcess = null

      if (newState.readyQueue.length > 0) {
        const nextProcess = newState.readyQueue.shift()!
        newState.currentProcess = nextProcess
        newState.contextSwitches += 1
        newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime + 1, color: nextProcess.color })
      }
    }
  }

  return newState
}

// Round Robin
export function executeRoundRobin(
  processes: Process[],
  state: SchedulerState,
  timeQuantum: number,
  quantumLeft: number,
): { state: SchedulerState; quantumLeft: number } {
  const arrivedProcesses = processes.filter(
    (p) =>
      p.arrivalTime === state.currentTime &&
      p.remainingTime > 0 &&
      !state.readyQueue.find((rp) => rp.id === p.id) &&
      (!state.currentProcess || state.currentProcess.id !== p.id) &&
      !state.completedProcesses.find((cp) => cp.id === p.id),
  )

  const newState = { ...state, contextSwitches: state.contextSwitches }
  let newQuantumLeft = quantumLeft

  arrivedProcesses.forEach((p) => {
    newState.readyQueue.push(p)
  })

  if (!newState.currentProcess && newState.readyQueue.length > 0) {
    const nextProcess = newState.readyQueue.shift()!
    newState.currentProcess = nextProcess
    newState.contextSwitches += 1
    newQuantumLeft = timeQuantum
    newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime, color: nextProcess.color })
  } else if (newState.currentProcess) {
    const updated = { ...newState.currentProcess, remainingTime: newState.currentProcess.remainingTime - 1 }
    newState.currentProcess = updated
    newQuantumLeft--

    if (updated.remainingTime === 0) {
      newState.completedProcesses.push({ ...updated, completionTime: state.currentTime + 1 })
      newState.currentProcess = null
      newQuantumLeft = 0

      if (newState.readyQueue.length > 0) {
        const nextProcess = newState.readyQueue.shift()!
        newState.currentProcess = nextProcess
        newState.contextSwitches += 1
        newQuantumLeft = timeQuantum
        newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime + 1, color: nextProcess.color })
      }
    } else if (newQuantumLeft === 0) {
      newState.readyQueue.push(updated)
      newState.currentProcess = null
      newQuantumLeft = 0

      if (newState.readyQueue.length > 0) {
        const nextProcess = newState.readyQueue.shift()!
        newState.currentProcess = nextProcess
        newState.contextSwitches += 1
        newQuantumLeft = timeQuantum
        newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime + 1, color: nextProcess.color })
      }
    }
  }

  return { state: newState, quantumLeft: newQuantumLeft }
}

// Priority Scheduling - Non-preemptive
export function executePriority(processes: Process[], state: SchedulerState): SchedulerState {
  const arrivedProcesses = processes.filter(
    (p) =>
      p.arrivalTime === state.currentTime &&
      p.remainingTime > 0 &&
      !state.readyQueue.find((rp) => rp.id === p.id) &&
      (!state.currentProcess || state.currentProcess.id !== p.id) &&
      !state.completedProcesses.find((cp) => cp.id === p.id),
  )

  const newState = { ...state, contextSwitches: state.contextSwitches }
  arrivedProcesses.forEach((p) => {
    newState.readyQueue.push(p)
  })

  // Sort queue by priority (lower number = higher priority)
  newState.readyQueue.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))

  if (!newState.currentProcess && newState.readyQueue.length > 0) {
    const nextProcess = newState.readyQueue.shift()!
    newState.currentProcess = nextProcess
    newState.contextSwitches += 1
    newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime, color: nextProcess.color })
  } else if (newState.currentProcess) {
    const updated = { ...newState.currentProcess, remainingTime: newState.currentProcess.remainingTime - 1 }
    newState.currentProcess = updated

    if (updated.remainingTime === 0) {
      newState.completedProcesses.push({ ...updated, completionTime: state.currentTime + 1 })
      newState.currentProcess = null

      if (newState.readyQueue.length > 0) {
        const nextProcess = newState.readyQueue.shift()!
        newState.currentProcess = nextProcess
        newState.contextSwitches += 1
        newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime + 1, color: nextProcess.color })
      }
    }
  }

  return newState
}

// Multilevel Queue - Priority-based queue selection
export function executeMultilevelQueue(
  processes: Process[],
  state: SchedulerState,
  mlqQuantumState?: { queue0Quantum: number; queue1Quantum: number },
): { state: SchedulerState; quantumState: { queue0Quantum: number; queue1Quantum: number } } {
  const arrivedProcesses = processes.filter(
    (p) =>
      p.arrivalTime === state.currentTime &&
      p.remainingTime > 0 &&
      !state.readyQueue.find((rp) => rp.id === p.id) &&
      (!state.currentProcess || state.currentProcess.id !== p.id) &&
      !state.completedProcesses.find((cp) => cp.id === p.id),
  )

  const newState = { ...state, contextSwitches: state.contextSwitches }
  const quantumState = mlqQuantumState || { queue0Quantum: 0, queue1Quantum: 0 }

  arrivedProcesses.forEach((p) => {
    newState.readyQueue.push(p)
  })

  // Separate processes into three queues based on queue assignment
  const queues = {
    high: newState.readyQueue.filter((p) => (p.queue ?? 0) === 0), // Queue 0: High priority
    medium: newState.readyQueue.filter((p) => (p.queue ?? 0) === 1), // Queue 1: Medium priority
    low: newState.readyQueue.filter((p) => (p.queue ?? 0) === 2), // Queue 2: Low priority
  }

  // Determine next process: prioritize by queue level (high > medium > low)
  let nextProcess: Process | null = null
  let selectedQueue: "high" | "medium" | "low" | null = null

  if (!newState.currentProcess) {
    if (queues.high.length > 0) {
      nextProcess = queues.high[0]
      selectedQueue = "high"
    } else if (queues.medium.length > 0) {
      nextProcess = queues.medium[0]
      selectedQueue = "medium"
      quantumState.queue1Quantum = 3 // Time quantum for medium queue
    } else if (queues.low.length > 0) {
      nextProcess = queues.low[0]
      selectedQueue = "low"
      quantumState.queue1Quantum = 5 // Time quantum for low queue
    }

    if (nextProcess) {
      newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
      newState.currentProcess = nextProcess
      newState.contextSwitches += 1
      newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime, color: nextProcess.color })
    }
  } else {
    // Process is still running
    const updated = { ...newState.currentProcess, remainingTime: newState.currentProcess.remainingTime - 1 }
    newState.currentProcess = updated

    const currentQueue = updated.queue ?? 0

    if (updated.remainingTime === 0) {
      // Process completed
      newState.completedProcesses.push({ ...updated, completionTime: state.currentTime + 1 })
      newState.currentProcess = null
      quantumState.queue0Quantum = 0
      quantumState.queue1Quantum = 0

      // Preemption: Check if higher priority queue has processes
      if (queues.high.length > 0 && currentQueue > 0) {
        nextProcess = queues.high[0]
        newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
        newState.currentProcess = nextProcess
        newState.contextSwitches += 1
        newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime + 1, color: nextProcess.color })
      } else if (currentQueue === 1 && queues.medium.length > 0) {
        // From medium queue, go to next medium or low
        nextProcess = queues.medium[0]
        selectedQueue = "medium"
        newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
        newState.currentProcess = nextProcess
        newState.contextSwitches += 1
        quantumState.queue1Quantum = 3
        newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime + 1, color: nextProcess.color })
      } else if (queues.low.length > 0) {
        nextProcess = queues.low[0]
        newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
        newState.currentProcess = nextProcess
        newState.contextSwitches += 1
        quantumState.queue1Quantum = 5
        newState.ganttChart.push({ process: nextProcess.name, start: state.currentTime + 1, color: nextProcess.color })
      }
    } else if (currentQueue > 0) {
      // For medium and low priority queues, use time quantum (Round Robin within queues)
      if (currentQueue === 1) {
        quantumState.queue1Quantum--
        if (quantumState.queue1Quantum === 0) {
          newState.readyQueue.push(updated)
          newState.currentProcess = null

          // Check preemption: high priority queue first
          if (queues.high.length > 0) {
            nextProcess = queues.high[0]
            newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
            newState.currentProcess = nextProcess
            newState.contextSwitches += 1
            newState.ganttChart.push({
              process: nextProcess.name,
              start: state.currentTime + 1,
              color: nextProcess.color,
            })
          } else if (queues.medium.length > 0) {
            nextProcess = queues.medium[0]
            newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
            newState.currentProcess = nextProcess
            newState.contextSwitches += 1
            quantumState.queue1Quantum = 3
            newState.ganttChart.push({
              process: nextProcess.name,
              start: state.currentTime + 1,
              color: nextProcess.color,
            })
          } else if (queues.low.length > 0) {
            nextProcess = queues.low[0]
            newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
            newState.currentProcess = nextProcess
            newState.contextSwitches += 1
            quantumState.queue1Quantum = 5
            newState.ganttChart.push({
              process: nextProcess.name,
              start: state.currentTime + 1,
              color: nextProcess.color,
            })
          }
        }
      } else if (currentQueue === 2) {
        quantumState.queue1Quantum--
        if (quantumState.queue1Quantum === 0) {
          newState.readyQueue.push(updated)
          newState.currentProcess = null

          // Check preemption
          if (queues.high.length > 0) {
            nextProcess = queues.high[0]
            newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
            newState.currentProcess = nextProcess
            newState.contextSwitches += 1
            newState.ganttChart.push({
              process: nextProcess.name,
              start: state.currentTime + 1,
              color: nextProcess.color,
            })
          } else if (queues.medium.length > 0) {
            nextProcess = queues.medium[0]
            newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
            newState.currentProcess = nextProcess
            newState.contextSwitches += 1
            quantumState.queue1Quantum = 3
            newState.ganttChart.push({
              process: nextProcess.name,
              start: state.currentTime + 1,
              color: nextProcess.color,
            })
          } else if (queues.low.length > 0) {
            nextProcess = queues.low[0]
            newState.readyQueue = newState.readyQueue.filter((p) => p.id !== nextProcess!.id)
            newState.currentProcess = nextProcess
            newState.contextSwitches += 1
            quantumState.queue1Quantum = 5
            newState.ganttChart.push({
              process: nextProcess.name,
              start: state.currentTime + 1,
              color: nextProcess.color,
            })
          }
        }
      }
    }
  }

  return { state: newState, quantumState }
}
