<script setup lang="ts">
import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, Vector3 } from 'three'
import { onMounted, ref } from 'vue'
import { Brick, Problem, Solver } from './solver'
import { DisplayBrick } from './display'

const canvas = ref<HTMLDivElement>()

const displayBricks: DisplayBrick[] = []

const createScene = () => {
  var div = canvas.value!
  const scene = new Scene()
  const camera = new PerspectiveCamera(45, div.offsetWidth / div.offsetHeight, 0.1, 1000)
  const light = new DirectionalLight(0xffff00, 1)

  const renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(div.offsetWidth, div.offsetHeight)
  div.appendChild(renderer.domElement)
  scene.add(light)

  camera.position.copy({ x: 5, y: 10, z: 15 })
  camera.lookAt(new Vector3(2.5, 2.5, 5))
  light.position.copy({ x: 1, y: 2, z: 5 })

  return { scene, renderer, camera }
}

const problem = new Problem(5, 5, 5, [
  { brick: new Brick(2, 2, 3), quantity: 6 },
  { brick: new Brick(1, 2, 4), quantity: 6 },
  { brick: new Brick(1, 1, 1), quantity: 5 }
])

const solver = new Solver(problem)
solver.initSolving()

onMounted(() => {
  const { scene, renderer, camera } = createScene()

  solver.startSolving().then(console.log)

  const next = () => {
    if (solver.nextStep()) setTimeout(next)
  }
  next()

  const updateScene = () => {
    for (let b = displayBricks.pop(); b; b = displayBricks.pop()) b.hide()
    for (let b of solver.status) {
      displayBricks.push(new DisplayBrick(b.brick, new Vector3(b.i, b.j, b.k), scene, 0xd5e1df))
    }
    displayBricks.forEach((b) => b.display())
  }

  const animate = () => {
    updateScene()
    renderer.render(scene, camera)
  }
  renderer.setAnimationLoop(animate)
})
</script>

<template>
  <button v-on:click="solver.nextStep()">nextStep</button>
  <div ref="canvas" class="canvas"></div>
</template>

<style scoped></style>
