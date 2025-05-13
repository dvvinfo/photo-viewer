<template>
  <div
    class="w-full max-w-[600px] h-[600px] bg-background rounded-lg shadow overflow-auto flex flex-col"
    @scroll="onScroll"
    ref="scrollRef"
  >
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow class="sticky top-0 z-10 bg-background">
            <TableHead
              v-for="col in columns"
              :key="col.key"
              @click="onSort(col.key)"
              class="cursor-pointer select-none"
            >
              {{ col.label }}
              <span v-if="sortConfig.key === col.key">
                <span v-if="sortConfig.direction === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="5" class="text-center">
              <div class="flex flex-col gap-2">
                <div v-for="i in 5" :key="i" class="h-6 bg-muted rounded animate-pulse"></div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="photos.length === 0">
            <TableCell colspan="5" class="text-center text-muted-foreground py-8">
              Нет данных
            </TableCell>
          </TableRow>
          <TableRow v-for="photo in photos" :key="photo.id">
            <TableCell>{{ photo.id }}</TableCell>
            <TableCell>{{ photo.albumId }}</TableCell>
            <TableCell class="max-w-[200px] truncate" :title="photo.title">
              {{ photo.title }}
            </TableCell>
            <TableCell class="max-w-[200px] truncate" :title="photo.url">
              {{ photo.url }}
            </TableCell>
            <TableCell class="max-w-[200px] truncate" :title="photo.thumbnailUrl">
              {{ photo.thumbnailUrl }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <div
      v-if="!loading && !allLoaded && photos.length"
      class="py-2 text-center text-muted-foreground text-xs"
    >
      Прокрутите вниз для загрузки ещё...
    </div>
    <div v-if="allLoaded && photos.length" class="py-2 text-center text-muted-foreground text-xs">
      Все данные загружены
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePhotoStore } from '../stores/photo'
import type { Photo } from '@/types/photo'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const photoStore = usePhotoStore()
const { sortConfig } = storeToRefs(photoStore)

const props = defineProps<{
  photos: Array<{
    id: number
    albumId: number
    title: string
    url: string
    thumbnailUrl: string
  }>
  loading: boolean
  allLoaded: boolean
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

const columns: { key: keyof Photo; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'albumId', label: 'Альбом' },
  { key: 'title', label: 'Название' },
  { key: 'url', label: 'Ссылка' },
  { key: 'thumbnailUrl', label: 'Миниатюра' },
]

function onSort(key: keyof Photo) {
  photoStore.sortPhotos(key)
}

const scrollRef = ref<HTMLElement | null>(null)

// Для отслеживания сломанных картинок
// const brokenImages = ref<Record<number, boolean>>({})

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  console.log('onScroll', el.scrollTop, el.clientHeight, el.scrollHeight)
  if (
    el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
    !props.loading &&
    !props.allLoaded
  ) {
    emit('load-more')
  }
}
</script>

<style scoped lang="postcss">
tr > td,
tr > th {
  @apply whitespace-nowrap;
}
tr > td.truncate,
tr > th.truncate {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
