<template>
  <input
    class="border px-1 py-0.5 mx-1 leading-[22px] rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<script setup lang="ts">
defineProps<{
  modelValue: any
}>()
defineEmits(['update:modelValue'])
</script>
