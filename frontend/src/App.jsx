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

  const presets = {
    front: { x: 0, y: 1.5, z: 5 },
    back: { x: 0, y: 1.5, z: -5 },
    left: { x: 5, y: 1.5, z: 0 },
    right: { x: -5, y: 1.5, z: 0 },
    top: { x: 0, y: 5, z: 0 },
  }

  const playlist = [
    presets.front,
    presets.left,
    presets.back,
    presets.right,
    presets.top,
    presets.front,
  ]

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

  function setPreset(pos) {
    if (!cameraRef.current || !controlsRef.current) return
    cameraRef.current.position.set(pos.x, pos.y, pos.z)
    controlsRef.current.update()
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

  async function playPlaylist() {
    if (playing) return
    setPlaying(true)
    for (const pos of playlist) {
      await tweenTo(pos, 2000)
    }
    setPlaying(false)
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0" ref={mountRef}></div>
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center space-y-2 z-10">
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
        <div className="flex space-x-2">
          {Object.entries(presets).map(([name, pos]) => (
            <button
              key={name}
              onClick={() => setPreset(pos)}
              className="px-3 py-1 text-sm capitalize bg-white bg-opacity-80 rounded shadow hover:bg-opacity-100"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
