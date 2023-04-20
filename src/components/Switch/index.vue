<template>
  <div
    class="relative w-[40px] h-[20px] rounded-[20px] transition-colors duration-300 inline-block"
    :class="{ 'bg-[#dcdfe6]': !modelValue, 'bg-[#409eff]': modelValue }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div
      class="absolute w-[16px] h-[16px] bg-white top-[2px] left-[2px] rounded-full transition-transform duration-300"
      :class="{ 'translate-x-[20px]': modelValue }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: Boolean
}>()
defineEmits(['update:modelValue'])
</script>
