<template>
  <div
    class="min-h-screen flex flex-col items-center justify-start bg-background text-foreground py-8 max-w-[600px] w-full mx-auto"
  >
    <div class="w-full max-w-[600px] flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Photo Viewer</h1>
      <Button variant="ghost" @click="toggleTheme" class="flex items-center gap-2">
        <Sun v-if="theme === 'dark'" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </Button>
    </div>
    <PhotoFilter :loading="loading" @search="onSearch" />
    <div class="relative w-full">
      <PhotoTable
        :photos="photoStore.photos"
        :loading="loading"
        :all-loaded="allLoaded"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePhotoStore } from '../stores/photo'
import PhotoFilter from './PhotoFilter.vue'
import PhotoTable from './PhotoTable.vue'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-vue-next'

const photoStore = usePhotoStore()
const loading = ref(false)
const allLoaded = ref(false)
const theme = ref('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', theme.value)
}

async function onSearch(ids: number[]) {
  loading.value = true
  allLoaded.value = false
  try {
    await photoStore.fetchPhotos(ids)
    allLoaded.value = photoStore.allLoaded
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  console.log('loadMore called', photoStore.loading, allLoaded.value)
  if (photoStore.loading || allLoaded.value) return
  await photoStore.loadMore()
  allLoaded.value = photoStore.allLoaded
  console.log('after loadMore, allLoaded:', allLoaded.value)
}

onMounted(() => {
  // Восстановление темы из localStorage
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.value = savedTheme
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  // Восстановление albumIds
  const saved = localStorage.getItem('albumIds')
  if (saved) {
    try {
      const arr = JSON.parse(saved)
      if (Array.isArray(arr)) {
        onSearch(arr)
        return
      }
    } catch {}
  }
  // Если ничего не найдено или ошибка — загрузить все фото
  onSearch([])
})
</script>

<style scoped lang="postcss"></style>
