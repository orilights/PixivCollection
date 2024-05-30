<template>
  <div
    class="w-full px-2"
    :class="{
      'py-2 text-white': mode === 'cover',
      'py-1': mode === 'bottom',
    }"
  >
    <div class="flex items-center">
      <IconTitle v-if="mode === 'cover'" class="mr-1 inline-block size-4" />
      <span
        class="cursor-pointer truncate transition-colors hover:text-blue-500"
        :class="{
          'text-sm': mode === 'cover',
          'font-bold': mode === 'bottom',
        }"
        @click.stop="openPixivIllust(imageData.id)"
      >
        {{ imageData.title }}
      </span>
    </div>
    <div class="flex items-center">
      <IconUser v-if="mode === 'cover'" class="mr-1 inline-block size-4" />
      <span
        class="cursor-pointer truncate text-sm transition-colors hover:text-blue-500"
        @click.stop="openPixivUser(imageData.author.id)"
      >{{ imageData.author.name }}</span>
      <IconFunnelSolid
        class="ml-1 inline-block size-3 cursor-pointer transition-colors hover:text-blue-500 "
        @click.stop="handleFilterAuthor"
      />
    </div>
    <div
      class="mt-0.5 flex flex-wrap gap-1 pb-3"
      :class="{
        'h-[50px] overflow-y-auto': mode === 'bottom',
      }"
    >
      <IconTag v-if="mode === 'cover'" class="inline-block size-4" />
      <span
        v-for="tag, idx in imageData.tags"
        v-show="!tag.name.includes('users入り') || config.tagIncludeBookmark" :key="idx"
        class="h-fit rounded-sm px-1 text-xs "
        :class="{
          '!bg-red-500/60': tag.name === 'R-18',
          'bg-black/30': mode === 'cover',
          'bg-black/10 dark:dark:bg-gray-200/10': mode === 'bottom',
        }"
      >
        {{ config.tagTranslation ? tag.translated_name || tag.name : tag.name }}
      </span>
    </div>
    <div
      class="text-xs"
      :class="{
        'whitespace-nowrap text-gray-500': mode === 'bottom',
      }"
    >
      <button :title="formatTime(imageData.created_at)" @click.stop="copyToClipboard(imageData.id)">
        {{ imageData.id }}
      </button>
      {{ `p${imageData.part}` }}
      {{ imageData.bookmark }}
      {{ `${imageData.size[0]}×${imageData.size[1]}` }}
      {{ `sl${imageData.sanity_level}` }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'
import { copyToClipboard, formatTime, openPixivIllust, openPixivUser } from '@/utils'

const props = defineProps<{
  imageData: Image
  mode: 'cover' | 'bottom'
  config: MasonryItemConfig
}>()

function handleFilterAuthor() {
  useStore().filterAuthor(props.imageData.author.id)
}
</script>
