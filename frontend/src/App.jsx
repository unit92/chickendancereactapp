import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './App.css'

function App() {
  const mountRef = useRef(null)
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

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 1.5, 5)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controlsRef.current = controls

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
    scene.add(light)

    const loader = new GLTFLoader()
    let mixer

    loader.load('/Chicken.glb', (gltf) => {
      const model = gltf.scene
      scene.add(model)

      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model)
        const action = mixer.clipAction(gltf.animations[0])
        action.play()
      }
      animate()
    })

    const clock = new THREE.Clock()

    function animate() {
      requestAnimationFrame(animate)
      if (mixer) mixer.update(clock.getDelta())
      controls.update()
      renderer.render(scene, camera)
    }

    return () => {
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

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


  function tweenTo(pos, duration = 1000) {
    return new Promise((resolve) => {
      if (!cameraRef.current || !controlsRef.current) {
        resolve()
        return
      }
      const camera = cameraRef.current
      const controls = controlsRef.current
      const start = camera.position.clone()
      const target = new THREE.Vector3(pos.x, pos.y, pos.z)
      let startTime
      function step(time) {
        if (!startTime) startTime = time
        const t = (time - startTime) / duration
        if (t < 1) {
          camera.position.lerpVectors(start, target, t)
          controls.update()
          requestAnimationFrame(step)
        } else {
          camera.position.copy(target)
          controls.update()
          resolve()
        }
      }
      requestAnimationFrame(step)
    })
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
      await tweenTo(pos, 2000)
    }
    setCurrentStep(active.length)
    setPlaying(false)
  }

  const totalSteps = playlist.filter(Boolean).length

  return (
    <div className="flex h-full relative">
      <div className="w-64 p-2 bg-white bg-opacity-70 overflow-y-auto space-y-2">
        <h2 className="font-bold">Camera Angles</h2>
        <div className="space-y-1">
          {Object.keys(angles).map((name) => (
            <div
              key={name}
              draggable
              onDragStart={(e) => handleDragStart(e, name)}
              className="p-1 bg-gray-200 rounded text-center cursor-move capitalize"
            >
              {name}
            </div>
          ))}
        </div>
        <h2 className="font-bold mt-4">Playlist</h2>
        <div className="space-y-1">
          {playlist.map((item, idx) => (
            <div
              key={idx}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, idx)}
              className="h-8 border border-dashed rounded flex items-center justify-center bg-white bg-opacity-60 text-xs capitalize"
            >
              {item ? item.name : `Slot ${idx + 1}`}
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 bg-gray-300 rounded overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${totalSteps ? (currentStep / totalSteps) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0" ref={mountRef}></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          <button
            onClick={toggleAudio}
            className="px-3 py-1 text-sm bg-white bg-opacity-80 rounded shadow hover:bg-opacity-100"
          >
            {audioOn ? 'Stop Sound' : 'Play Sound'}
          </button>
          <button
            onClick={playPlaylist}
            disabled={playing}
            className="px-3 py-1 text-sm bg-white bg-opacity-80 rounded shadow hover:bg-opacity-100 disabled:opacity-50"
          >
            {playing ? 'Playing...' : 'Play Camera Playlist'}
          </button>
        </div>
      </div>
      <div className="absolute top-4 right-4 space-y-2 z-20">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-2 py-1 bg-black bg-opacity-80 text-white text-sm rounded"
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
