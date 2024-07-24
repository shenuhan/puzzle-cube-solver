<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import Canvas from './components/Canvas.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="Let's go" />
    </div>
  </header>

  <main>
    <Canvas />
  </main>
</template>

<style scoped>
</style>
