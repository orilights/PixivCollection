<template>
  <div class="absolute wf-image bg-gray-100 rounded-[12px] overflow-hidden transition-transform group">
    <div
      class="absolute w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white px-2 pt-8 text-sm"
      @click="$emit('openImage', index)"
    >
      <div class="absolute top-1.5 right-1.5 text-right text-xs" @click="$emit('openPixiv', index)">
        {{ `${image.id} p${image.part}` }} <br>{{ `${image.size[0]}×${image.size[1]}` }}
      </div>
      <p>标题：{{ image.title }}</p>
      <p>作者： <span @click.stop="$emit('openPixivUser', index)">{{ image.detail.author.name }}</span></p>
      <p>
        标签：<span
          v-for="tag, idx in image.detail.tags" :key="idx"
          class="px-1 mx-1 my-0.5 inline-block bg-black/30 rounded-sm"
          :class="tag.name === 'R-18' ? 'bg-red-500/80' : ''"
        >
          {{ tag.translated_name || tag.name }}
        </span>
      </p>
    </div>
    <Transition>
      <div
        v-show="!imageLoaded"
        class="absolute w-full h-full bg-black flex justify-center items-center text-white"
      >
        Loading
      </div>
    </Transition>
    <div v-if="showNo" class="absolute top-0 bg-black/60 text-white px-2 rounded-br-[12px]">
      {{ index + 1 }}
    </div>
    <img v-if="loadImage" class="w-full" :src="image.preview" @load="imageLoaded = true">
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  image: Image
  index: number
  loadImage: boolean
  showNo: boolean
}>()

const emits = defineEmits(['openImage', 'openPixiv', 'openPixivUser', 'destory'])

const imageLoaded = ref(false)

onUnmounted(() => {
  emits('destory', props.index)
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
