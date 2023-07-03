<template>
  <div
    class="absolute bg-gray-100 overflow-hidden transition-all duration-300 group dark:bg-[#242424]"
    :class="{
      'rounded-[12px] shadow-[0_3px_10px_1px_rgba(0,0,0,0.20)]': shadow,
    }"
  >
    <div
      v-if="!infoAtBottom"
      class="absolute w-full h-full px-2 pt-10 text-sm text-white transition-all opacity-0 cursor-pointer bg-black/50 group-hover:opacity-100"
      @click="$emit('openImage', imageIndex)"
    >
      <div class="absolute top-1.5 right-1.5 text-right text-xs">
        {{ `${imageData.id} p${imageData.part}` }} <br>{{ `${imageData.size[0]}×${imageData.size[1]} sl${imageData.sanity_level}` }}
      </div>
      <p class="flex whitespace-nowrap">
        标题：<span
          class="overflow-hidden transition-colors hover:text-blue-500 overflow-ellipsis"
          @click.stop="$emit('openPixiv', imageIndex)"
        >{{ imageData.title }}</span>
      </p>
      <p class="flex items-center whitespace-nowrap">
        作者：<span
          class="overflow-hidden transition-colors hover:text-blue-500 overflow-ellipsis"
          @click.stop="$emit('openPixivUser', imageIndex)"
        >{{ imageData.author.name }}</span>
        <IconFunnelSolid
          class="inline-block w-3 h-3 ml-1 transition-colors hover:text-blue-500"
          @click.stop="$emit('filterAuthor', imageIndex)"
        />
      </p>
      <p>
        标签：<span
          v-for="tag, idx in imageData.tags" v-show="!tag.name.includes('users入り') || tagIncludeBookmark" :key="idx"
          class="px-1 mx-1 my-0.5 inline-block bg-black/30 rounded-sm text-xs"
          :class="tag.name === 'R-18' ? 'bg-red-500/80' : ''"
        >
          {{ tagTranslation ? tag.translated_name || tag.name : tag.name }}
        </span>
      </p>
    </div>
    <Transition name="fade">
      <div
        v-show="!imageLoaded"
        class="absolute flex items-center justify-center w-full"
        :class="{
          'h-full': !infoAtBottom,
          'h-[calc(100%-120px)]': infoAtBottom,
        }"
        :style="{
          backgroundColor: imageData.dominant_color,
        }"
      />
    </Transition>
    <div v-if="showNo" class="absolute top-0 bg-black/60 text-white px-2 rounded-br-[12px]">
      {{ imageIndex + 1 }}
    </div>
    <div v-if="infoAtBottom" class="absolute w-full px-2 bottom-1">
      <p
        class="overflow-hidden font-bold transition-colors cursor-pointer hover:text-blue-500 whitespace-nowrap overflow-ellipsis"
        @click="$emit('openPixiv', imageIndex)"
      >
        {{ imageData.title }}
      </p>
      <p class="flex items-center cursor-pointer">
        <span
          class="overflow-hidden text-sm transition-colors hover:text-blue-500 whitespace-nowrap overflow-ellipsis"
          @click="$emit('openPixivUser', imageIndex)"
        >{{ imageData.author.name }}</span>
        <IconFunnelSolid
          class="inline-block w-3 h-3 ml-1 transition-colors hover:text-blue-500"
          @click="$emit('filterAuthor', imageIndex)"
        />
      </p>
      <p class="overflow-y-auto h-[50px] mx-[-4px]">
        <span
          v-for="tag, idx in imageData.tags" v-show="!tag.name.includes('users入り') || tagIncludeBookmark" :key="idx"
          class="px-1 mx-0.5 my-0.5 float-left bg-black/10 rounded-sm text-xs"
          :class="tag.name === 'R-18' ? '!bg-red-500/60' : ''"
        >
          {{ tagTranslation ? tag.translated_name || tag.name : tag.name }}
        </span>
      </p>
      <p class="text-xs text-left text-gray-500 flex items-center mt-0.5 whitespace-nowrap">
        {{ imageData.id }}
        {{ `p${imageData.part}` }}
        {{ `${imageData.size[0]}×${imageData.size[1]}` }}
        {{ `sl${imageData.sanity_level}` }}
      </p>
    </div>
    <img
      class="w-full cursor-pointer"
      :src="`${imageThumbPath}${imageData.id}_p${imageData.part}.${imageThumbFormat}`"
      @load="imageLoaded = true"
      @click="$emit('openImage', imageIndex)"
    >
  </div>
</template>

<script setup lang="ts">
import { imageThumbFormat, imageThumbPath } from '@/config'

defineProps<{
  imageData: Image
  imageIndex: number
  shadow: boolean
  showNo: boolean
  infoAtBottom: boolean
  tagIncludeBookmark: boolean
  tagTranslation: boolean
}>()

defineEmits(['openImage', 'openPixiv', 'openPixivUser', 'filterAuthor'])

const imageLoaded = ref(false)
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
