<template>
  <div
    class="relative inline-block h-[20px] w-[40px] cursor-pointer rounded-[20px] transition-colors duration-300"
    :class="{ 'bg-[#dcdfe6] dark:bg-[#4c4d4f]': !modelValue, 'bg-[#409eff]': modelValue }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div
      class="absolute left-[2px] top-[2px] size-[16px] rounded-full bg-white transition-transform duration-300"
      :class="{ 'translate-x-[20px]': modelValue }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()
defineEmits(['update:modelValue'])
</script>
