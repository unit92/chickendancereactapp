import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/* eslint-disable react-hooks/exhaustive-deps */

function ThreeScene({ cameraRef, controlsRef }) {
  const mountRef = useRef(null)

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

  return <div className="absolute inset-0" ref={mountRef}></div>
}

export default ThreeScene
