import * as THREE from 'three'

export function tweenTo(camera, controls, pos, duration = 1000) {
  return new Promise((resolve) => {
    if (!camera || !controls) {
      resolve()
      return
    }
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
