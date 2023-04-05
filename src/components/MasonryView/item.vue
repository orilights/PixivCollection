<template>
  <div
    class="absolute bg-gray-100 overflow-hidden transition-transform group dark:bg-[#242424]"
    :class="{
      'rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.2)]': shadow,
    }"
  >
    <div
      v-if="!infoAtBottom"
      class="absolute w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white px-2 pt-8 text-sm"
      @click="$emit('openImage', index)"
    >
      <div class="absolute top-1.5 right-1.5 text-right text-xs" @click.stop="$emit('openPixiv', index)">
        {{ `${image.id} p${image.part}` }} <br>{{ `${image.size[0]}×${image.size[1]}` }}
      </div>
      <p>标题：{{ image.title }}</p>
      <p>
        作者：<span
          @click.stop.prevent="$emit('openPixivUser', index)"
        >{{ image.detail.author.name }}</span>
        <IconFunnelSolid
          class="ml-1 w-3 h-3 inline-block"
          @click.stop="$emit('filterAuthor', index)"
        />
      </p>
      <p>
        标签：<span
          v-for="tag, idx in image.detail.tags" v-show="!tag.name.includes('users入り') || tagIncludeBookmark" :key="idx"
          class="px-1 mx-1 my-0.5 inline-block bg-black/30 rounded-sm"
          :class="tag.name === 'R-18' ? 'bg-red-500/80' : ''"
        >
          {{ tagTranslation ? tag.translated_name || tag.name : tag.name }}
        </span>
      </p>
    </div>
    <Transition name="fade">
      <div
        v-show="!imageLoaded"
        class="absolute w-full bg-white dark:bg-black flex justify-center items-center"
        :class="{
          'h-full': !infoAtBottom,
          'h-[calc(100%-120px)]': infoAtBottom,
        }"
      >
        Loading
      </div>
    </Transition>
    <div v-if="showNo" class="absolute top-0 bg-black/60 text-white px-2 rounded-br-[12px]">
      {{ index + 1 }}
    </div>
    <img
      v-if="loadImage" class="w-full cursor-pointer" :src="image.preview"
      @load="imageLoaded = true"
      @click="$emit('openImage', index)"
    >
    <div v-if="infoAtBottom" class="px-2 absolute w-full bottom-1.5">
      <p
        class="font-bold hover:text-blue-500 whitespace-nowrap overflow-hidden overflow-ellipsis cursor-pointer"
        @click="$emit('openPixiv', index)"
      >
        {{ image.title }}
      </p>
      <p class="cursor-pointer">
        <span class="hover:text-blue-500" @click="$emit('openPixivUser', index)">{{ image.detail.author.name }}</span>
        <IconFunnelSolid
          class="ml-1 w-3 h-3 inline-block"
          @click.stop="$emit('filterAuthor', index)"
        />
      </p>
      <p class="overflow-y-auto h-[60px] mx-[-4px]">
        <span
          v-for="tag, idx in image.detail.tags" v-show="!tag.name.includes('users入り') || tagIncludeBookmark" :key="idx"
          class="px-1 mx-1 my-0.5 inline-block bg-black/10 rounded-sm text-sm"
          :class="tag.name === 'R-18' ? '!bg-red-500/60' : ''"
        >
          {{ tagTranslation ? tag.translated_name || tag.name : tag.name }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  image: Image
  index: number
  shadow: boolean
  loadImage: boolean
  showNo: boolean
  infoAtBottom: boolean
  tagIncludeBookmark: boolean
  tagTranslation: boolean
}>()

const emits = defineEmits(['openImage', 'openPixiv', 'openPixivUser', 'destory', 'filterAuthor'])

const imageLoaded = ref(false)

onUnmounted(() => {
  emits('destory', props.index)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
