<template>
  <div class="fixed right-4 top-[60px] z-[999] bg-black/60 p-2 text-sm text-white">
    <div v-for="item in Object.entries(debug)" :key="item[0]">
      {{ item[0] }}: {{ item[1] }}
    </div>
    <div>
      imagesLoaded: {{ imagesLoaded.size }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'

const store = useStore()

const { debug, imagesLoaded } = toRefs(store)
</script>
