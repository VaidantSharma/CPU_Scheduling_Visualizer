# Round Robin CPU Scheduler - Interactive Visualization

An interactive web application for visualizing the Round Robin CPU scheduling algorithm with real-time animations, comprehensive metrics, and an intuitive user interface.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [User Interface Guide](#user-interface-guide)
- [Animation Features](#animation-features)
- [Browser Requirements](#browser-requirements)
- [How the Round Robin Algorithm Works](#how-the-round-robin-algorithm-works)
- [Why It Is Necessary](#why-it-is-necessary)
- [Why It Can Be Preferable to Other Schedulers](#why-it-can-be-preferable-to-other-schedulers)
- [How It Is Implemented in the Code](#how-it-is-implemented-in-the-code)

## Setup Instructions

### Prerequisites

Before running the application, ensure you have the following installed on your system:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Modern Web Browser**: See [Browser Requirements](#browser-requirements) section

### Installation Steps

#### Step 1: Clone or Download the Repository

If using Git:
```bash
git clone <repository-url>
cd "code (1)"
```

Or extract the downloaded ZIP file to your desired location.

#### Step 2: Install Dependencies

Open a terminal (Command Prompt, PowerShell, or Terminal) in the project directory and run:

```bash
npm install
```

Alternatively, if you prefer using `pnpm`:
```bash
pnpm install
```

This command will install all required dependencies listed in `package.json`. The installation may take 2-5 minutes depending on your internet connection.

#### Step 3: Start the Development Server

Once dependencies are installed, start the development server:

```bash
npm run dev
```

You should see output similar to:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

#### Step 4: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

The application should now be running and ready to use.

### Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```

### Troubleshooting Common Issues

- **Port 3000 already in use**: Change the port by running `npm run dev -- -p 3001`
- **Module not found errors**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- **TypeScript errors**: The build is configured to ignore build errors, but ensure Node.js version is compatible

## User Interface Guide

### Overview

The application interface is divided into several main sections:

1. **Process Configuration Panel** - Configure processes and system parameters
2. **Control Panel** - Simulation controls and real-time information
3. **Process Flow Animation Area** - Visual representation of process lifecycle
4. **Gantt Chart Visualization** - Timeline view of process execution
5. **Performance Metrics Table** - Detailed metrics and statistics

### Process Configuration

#### Adding Processes

Click the **"Add Process"** button to create a new process. Each new process is assigned:
- A unique process ID (P1, P2, P3, etc.)
- A default burst time of 5 time units
- A default arrival time of 0
- A unique color for visualization

#### Configuring Process Parameters

For each process, you can modify:

- **Burst Time**: The total CPU time required by the process (minimum: 1). This represents how long the process needs to execute.
- **Arrival Time**: The time unit when the process arrives in the system (minimum: 0). This determines when the process becomes available for scheduling.

**Note:** Process parameters cannot be modified while the simulation is running.

#### Removing Processes

Click the **trash icon** (🗑️) next to any process to remove it from the simulation. The remove action is disabled during execution.

### System Configuration

#### Time Quantum

The **Time Quantum** determines the maximum continuous CPU time allocated to each process before preemption.

- Default value: 4 time units
- Minimum value: 1
- Impact: Smaller quanta increase responsiveness but also increase context switch overhead
- Cannot be changed during simulation execution

#### Animation Speed

The **Speed** slider controls the simulation animation speed:

- Range: 1x to 100x (approximately)
- Higher values = faster simulation
- Lower values = slower, more detailed visualization
- Can be adjusted during simulation execution

### Control Buttons

#### Start/Pause Button

- **Start** (green): Begins the simulation execution
- **Pause** (yellow): Temporarily halts the simulation
- Click to toggle between states
- The simulation can be resumed from where it was paused

#### Reset Button

- **Reset** (red): Completely resets the simulation
- Restores all processes to initial state
- Clears the Gantt chart and metrics
- Resets current time to 0
- Can be used at any time

### Real-Time Information Panel

While the simulation runs, the Control Panel displays:

- **Current Time**: The current simulation clock value
- **Context Switches**: Total number of CPU context switches that have occurred
- **Executing Process**: Name of the process currently using the CPU
- **Quantum Left**: Remaining quantum time for the current process
- **Remaining Time**: Total remaining execution time for the current process

## Animation Features

### Visualization Flow

The application visualizes the complete lifecycle of processes through the system using a top-to-bottom flow diagram.

### Process States and Color Coding

#### Process Colors

Each process is assigned a unique color from a predefined palette:

- **Blue** (#3b82f6) - P1
- **Green** (#10b981) - P2
- **Orange** (#f59e0b) - P3
- **Red** (#ef4444) - P4
- **Purple** (#8b5cf6) - P5
- **Pink** (#ec4899) - P6
- **Cyan** (#06b6d4) - P7
- **Lime** (#84cc16) - P8

These colors are used consistently across all visualizations (process cards, Gantt chart, metrics table).

### Visualization Sections

#### 1. New Arrival Area
- **Color Theme**: Purple/Pink gradient background
- **Purpose**: Shows processes as they arrive at their arrival time
- **Animation**: Processes slide in from the top
- **Display**: Shows process name and burst time

#### 2. Ready Queue
- **Color Theme**: Blue/Cyan gradient background
- **Purpose**: Displays processes waiting for CPU allocation
- **Order**: FIFO (First-In-First-Out) order from left to right
- **Display**: Shows process name and remaining time (RT)
- **Animation**: Processes pop in when added, animate when moving out

#### 3. CPU Execution Area
- **Color Theme**: Yellow/Orange gradient background
- **Purpose**: Shows the currently executing process
- **Features**: 
  - Process card with pulsing animation
  - Quantum counter badge (top-right)
  - Remaining time display
- **States**: 
  - "CPU Idle" when no process is executing
  - Process card with pulse animation when executing

#### 4. Completion Areas
- **Completed Section** (Green theme):
  - Processes that finished execution
  - Displayed with checkmark (✓) symbol
  - Shows completion count
- **Return to Queue** (Orange indicator):
  - Processes preempted due to quantum expiration
  - Visual indicator showing return path to ready queue

### Animation Transitions

#### Transition Types

1. **Slide In Top**: New processes arriving (purple border)
2. **Move Down Row**: Process moving from arrival to queue (blue border)
3. **Move Down Row**: Process moving from queue to CPU (yellow border)
4. **Pulse**: Process executing in CPU (continuous animation)
5. **Move Down Row**: Completed process moving to completed section (green border)
6. **Move Up To Queue**: Preempted process returning to queue (orange border)

#### Animation Timing

Animation durations are synchronized with the simulation speed:
- Transition animations take approximately 50-70% of one time unit
- All animations use easing functions for smooth transitions
- Multiple processes arriving simultaneously are handled sequentially for clarity

### Gantt Chart Visualization

#### Purpose

The Gantt chart provides a timeline view of process execution, showing:
- Which process was executing at each time unit
- Process execution sequence
- Visual representation of the complete schedule

#### Features

- **Color Coding**: Each process block uses its assigned color
- **Time Labels**: Start times displayed below each block
- **Hover Effects**: Blocks scale slightly on hover
- **Automatic Generation**: Created as simulation progresses
- **Final Time**: Shows completion time after simulation ends

### Performance Metrics

#### Metrics Calculation

The application automatically calculates the following metrics for each completed process:

**Per-Process Metrics:**
- **Arrival Time**: Original arrival time of the process
- **Burst Time**: Original CPU burst requirement
- **Completion Time**: Time unit when the process finished execution
- **Turnaround Time**: Total time from arrival to completion
  ```
  Turnaround Time = Completion Time - Arrival Time
  ```
- **Waiting Time**: Total time spent waiting in ready queue
  ```
  Waiting Time = Turnaround Time - Burst Time
  ```

**Aggregate Metrics:**
- **Average Turnaround Time**: Mean turnaround time across all processes
- **Average Waiting Time**: Mean waiting time across all processes
- **Total Context Switches**: Number of CPU context switches performed

#### Performance Metrics Display

Metrics are displayed in a comprehensive table format with:
- Row highlighting on hover
- Organized columns for easy comparison
- Summary cards showing aggregate metrics with color-coded backgrounds

## Browser Requirements

### Minimum Browser Versions

The application requires modern browser support for:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- CSS Animations and Transitions
- React 19 features

### Supported Browsers

| Browser | Minimum Version |
|---------|----------------|
| Google Chrome | 120+ |
| Mozilla Firefox | 121+ |
| Microsoft Edge | 120+ |
| Safari (macOS) | 17.0+ |
| Safari (iOS) | 17.0+ |
| Opera | 106+ |

### Required Features

Your browser must support:

- **JavaScript**: Must be enabled
- **CSS Custom Properties**: For theme support
- **Fetch API**: For data handling
- **Web Animations API**: For smooth transitions
- **Local Storage**: (Optional) For potential settings persistence

### Compatibility Notes

- **Internet Explorer**: Not supported (IE is deprecated)
- **Older Browsers**: May experience visual inconsistencies
- **Mobile Browsers**: Full functionality supported on modern mobile browsers
- **Screen Size**: Responsive design supports screens from 320px width and above
- **Performance**: Optimized for modern hardware; older devices may experience slower animations

### Checking Browser Compatibility

To check if your browser supports all required features:

1. Open the browser console (F12 or right-click → Inspect)
2. Check for any error messages
3. Verify the application loads without warnings

If you encounter issues:
- Update your browser to the latest version
- Clear browser cache and cookies
- Disable browser extensions that might interfere
- Try a different supported browser

---

## How the Round Robin algorithm works

Round Robin (RR) is a preemptive scheduling method that allocates a fixed time slice (the time quantum) to each ready process in a cyclic order. Processes execute for up to one quantum; if a process does not complete within its allotted quantum, it is preempted and appended to the tail of the ready queue. The cycle repeats until all processes have finished execution.

Operational summary:

1. Simulation time advances in discrete ticks.
2. Processes that arrive at the current tick are enqueued to the ready queue.
3. The scheduler dispatches the process at the front of the ready queue to the CPU and grants it up to one time quantum.
4. While executing, the process's remaining CPU time and the quantum remainder decrement on each tick.
   - If remaining CPU time reaches zero, the process completes and is recorded as finished.
   - If the quantum expires before completion, the process is preempted and re-queued at the tail.
5. The scheduler terminates when every process has completed.

This approach enforces bounded CPU share per process and provides round-robin fairness across runnable processes.

## Why it is necessary

Round Robin is appropriate for systems that require predictable responsiveness and equitable CPU allocation among concurrent tasks. By bounding how long any process may hold the CPU, RR prevents indefinite monopolization and reduces worst-case response latency for individual processes.

Primary motivations:

- Fairness: every runnable process receives periodic CPU access in turn.
- Responsiveness: interactive or short-lived tasks obtain CPU service within a bounded delay proportional to the queue length and quantum.
- Predictability: system behavior under load is easier to reason about because the maximum contiguous CPU time per process is limited.

## Why it can be preferable to other schedulers

Relative advantages compared with common alternatives:

- FCFS (First-Come, First-Served): RR avoids starvation of short or interactive tasks and reduces perceived latency by preempting long-running jobs.
- SJF (Shortest Job First): SJF optimizes average turnaround time but requires accurate knowledge or estimation of remaining CPU time and may cause starvation of long jobs; RR operates without such predictions and enforces fairness.
- Priority scheduling: priority-based approaches can starve lower-priority tasks unless additional mechanisms (e.g., aging) are applied; RR provides equitable sharing by design.

Considerations and trade-offs:

- Context-switch overhead: shorter quanta increase preemption frequency and thus context-switch cost.
- Quantum selection: the time quantum should balance responsiveness and overhead — a very small quantum increases overhead, whereas a very large quantum reduces preemptive benefits and approaches FCFS behavior.

## How it is implemented in the code

Reference: `components/round-robin-scheduler.tsx`.

Implementation summary:

- Framework: React client component using functional hooks (`useState`, `useEffect`). The component includes a visualization of the ready queue, CPU execution area, and a Gantt chart for schedule inspection.

- Principal state values and data structures:

  - `processes`: Array of process objects { id, name, burstTime, arrivalTime, remainingTime, color }.
  - `timeQuantum`: Configurable integer specifying the quantum length.
  - `currentTime`: Integer simulation clock.
  - `readyQueue`: FIFO array representing processes waiting for CPU service.
  - `currentProcess`: Process object currently executing, or null when CPU is idle.
  - `quantumLeft`: Remaining quantum for the currently executing process.
  - `ganttChart`: Array capturing dispatch events (process name and start time) for post-hoc visualization.
  - `completedProcesses`: Array of finished processes with recorded completion times.
  - `contextSwitches`: Counter incremented on CPU switches.

- Control and utility functions:

  - `addProcess()`, `removeProcess(id)`, `updateProcess(id, field, value)`: manage the process list.
  - `reset()`: returns the simulation to the initial state and resets remaining times.
  - `calculateMetrics()`: computes completion, turnaround, waiting times and averages based on `completedProcesses`.

- Scheduling loop (driven by a `useEffect` while `isRunning` is true):

  1. The loop advances the simulation clock at an interval controlled by the `speed` parameter.
  2. Newly arriving processes (arrivalTime === currentTime) are enqueued onto `readyQueue`.
  3. If the CPU is idle and `readyQueue` is non-empty, the scheduler dequeues the head and dispatches it to the CPU, setting `quantumLeft = timeQuantum` and logging the dispatch into `ganttChart`.
  4. If a process is executing, each tick decrements its `remainingTime` and `quantumLeft` by one. Two cases follow:
     - Completion: when `remainingTime` reaches zero, the process is recorded in `completedProcesses` with its completion timestamp and the CPU is freed.
     - Preemption: when `quantumLeft` reaches zero but `remainingTime` > 0, the process is appended to the tail of `readyQueue` and the CPU is freed for the next dispatch.
  5. The simulation stops when all processes are accounted for in `completedProcesses`.

- Metrics and visualization: the component derives per-process turnaround and waiting times and displays average metrics and a Gantt chart to aid analysis.

Notes for modification and analysis:

- Adjust `timeQuantum` to study the impact of quantum size on average waiting/turnaround and context switches.
- Use `speed` to alter tick duration for faster or slower visualization during demonstrations.

(This document contains only the requested sections: algorithm description, rationale, comparative advantages, and implementation notes.)
