import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './App.css'

function App() {
  const mountRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)

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

  function setPreset(pos) {
    if (!cameraRef.current || !controlsRef.current) return
    cameraRef.current.position.set(pos.x, pos.y, pos.z)
    controlsRef.current.update()
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0" ref={mountRef}></div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
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
  )
}

export default App
