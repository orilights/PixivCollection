<template>
  <div
    :class="{
      dark: darkMode,
    }"
  >
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useStore } from './store'

const store = useStore()

const { darkMode } = toRefs(store)

const settingLoaded = ref(false)

watchEffect(() => {
  if (settingLoaded.value)
    localStorage.setItem('darkMode', String(darkMode.value))
})

onMounted(() => {
  darkMode.value = (localStorage.getItem('darkMode') || 'false') === 'true'
  settingLoaded.value = true
})
</script>
