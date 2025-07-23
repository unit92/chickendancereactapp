import { useRef, useState } from 'react'
import './App.css'
import ThreeScene from './components/ThreeScene.jsx'
import CameraPlaylist from './components/CameraPlaylist.jsx'
import Controls from './components/Controls.jsx'
import Toasts from './components/Toasts.jsx'
import { tweenTo } from './utils/tween.js'

/**
 * Developer Guide
 * ---------------
 *
 * Setup
 *   1. `cd frontend && npm install` - install all dependencies.
 *   2. `npm run dev` - launch the Vite development server.
 *   3. `npm run lint` - run ESLint before committing changes.
 *   4. `npm run build` - build the production bundle.
 *
 * Overview
 *   - This component coordinates the three.js scene and UI controls.
 *   - The UI lets you drag preset camera angles into a playlist and play them
 *     back sequentially. "Play Sound" starts a simple Web Audio melody.
 */

function App() {
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const audioCtxRef = useRef(null)
  const oscRef = useRef(null)
  const noteIntervalRef = useRef(null)
  const [audioOn, setAudioOn] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [playlist, setPlaylist] = useState(Array(20).fill(null))
  const [currentStep, setCurrentStep] = useState(0)
  const [toasts, setToasts] = useState([])

  const angles = {
    front: { x: 0, y: 1.5, z: 5 },
    back: { x: 0, y: 1.5, z: -5 },
    left: { x: 5, y: 1.5, z: 0 },
    right: { x: -5, y: 1.5, z: 0 },
    top: { x: 0, y: 5, z: 0 },
  }

  function toggleAudio() {
    if (audioOn) {
      clearInterval(noteIntervalRef.current)
      if (oscRef.current) oscRef.current.stop()
      if (audioCtxRef.current) audioCtxRef.current.close()
      oscRef.current = null
      audioCtxRef.current = null
      setAudioOn(false)
      return
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const notes = [261.63, 329.63, 392.0, 523.25]
    let idx = 0
    noteIntervalRef.current = setInterval(() => {
      osc.frequency.setValueAtTime(notes[idx % notes.length], ctx.currentTime)
      idx += 1
    }, 300)

    osc.start()
    audioCtxRef.current = ctx
    oscRef.current = osc
    setAudioOn(true)
  }

  function addToast(message) {
    const id = Date.now()
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 2000)
  }

  function handleDrop(e, index) {
    e.preventDefault()
    const name = e.dataTransfer.getData('text/plain')
    if (!angles[name]) return
    setPlaylist((pl) => {
      const np = [...pl]
      np[index] = { name, pos: angles[name] }
      return np
    })
    addToast(`${name} set in slot ${index + 1}`)
  }

  function handleDragStart(e, name) {
    e.dataTransfer.setData('text/plain', name)
  }

  async function playPlaylist() {
    if (playing) return
    setPlaying(true)
    const active = playlist.filter(Boolean)
    setCurrentStep(0)
    for (let i = 0; i < active.length; i++) {
      const { pos, name } = active[i]
      addToast(`Moving to ${name}`)
      setCurrentStep(i)
      await tweenTo(cameraRef.current, controlsRef.current, pos, 2000)
    }
    setCurrentStep(active.length)
    setPlaying(false)
  }

  const totalSteps = playlist.filter(Boolean).length

  return (
    <div className="flex h-full relative">
      <CameraPlaylist
        angles={angles}
        playlist={playlist}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      <div className="flex-1 relative">
        <ThreeScene cameraRef={cameraRef} controlsRef={controlsRef} />
        <Controls
          audioOn={audioOn}
          toggleAudio={toggleAudio}
          playing={playing}
          playPlaylist={playPlaylist}
        />
      </div>
      <Toasts toasts={toasts} />
    </div>
  )
}

export default App
