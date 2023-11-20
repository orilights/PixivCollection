<template>
  <div
    v-show="showSidebar"
    class="fixed left-0 top-0 z-20 hidden h-screen w-screen bg-black/40 sm:block"
    @click="showSidebar = false"
  />
</template>

<script setup lang="ts">
import { useStore } from '@/store'

const store = useStore()
const { showSidebar } = toRefs(store)
</script>
