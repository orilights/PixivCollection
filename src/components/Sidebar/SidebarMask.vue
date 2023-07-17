<template>
  <div
    v-show="showSidebar"
    class="fixed top-0 left-0 z-20 hidden w-screen h-screen bg-black/40 sm:block"
    @click="showSidebar = false"
  />
</template>

<script setup lang="ts">
import { useStore } from '@/store'

const store = useStore()
const { showSidebar } = toRefs(store)
</script>
