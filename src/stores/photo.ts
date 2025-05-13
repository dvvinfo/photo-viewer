import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Photo } from '@/types/photo'

type PhotoKey = keyof Photo

type SortConfig = { key: PhotoKey; direction: 'asc' | 'desc' }

export const usePhotoStore = defineStore('photo', () => {
  // Состояния
  const photos = ref<Photo[]>([])
  const loading = ref(false)
  const albumIds = ref<number[]>([])
  const sortConfig = ref<SortConfig>({ key: 'id', direction: 'asc' })
  const page = ref(0)
  const pageSize = 30
  const allLoaded = ref(false)

  // Действия
  async function fetchPhotos(ids: number[] = []) {
    console.log('fetchPhotos called with ids:', ids)
    photos.value = []
    page.value = 0
    allLoaded.value = false
    albumIds.value = ids
    localStorage.setItem('albumIds', JSON.stringify(ids))
    await loadMore()
    loading.value = false
  }

  async function loadMore() {
    if (loading.value || allLoaded.value) return
    loading.value = true
    let url = 'https://jsonplaceholder.typicode.com/photos'
    const params: string[] = []
    if (albumIds.value.length) {
      params.push(...albumIds.value.map((id) => `albumId=${id}`))
    }
    params.push(`_start=${page.value * pageSize}`)
    params.push(`_limit=${pageSize}`)
    if (params.length) url += '?' + params.join('&')
    console.log('Fetching URL:', url)
    const res = await fetch(url)
    const data = await res.json()
    if (Array.isArray(data)) {
      photos.value.push(...data)
      console.log('photos.length after push:', photos.value.length)
      if (data.length < pageSize) {
        allLoaded.value = true
      }
      page.value++
    } else {
      allLoaded.value = true
    }
    loading.value = false
  }

  function sortPhotos(key: PhotoKey) {
    if (sortConfig.value.key === key) {
      sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sortConfig.value.key = key
      sortConfig.value.direction = 'asc'
    }
  }

  function restoreAlbumIds() {
    const ids = localStorage.getItem('albumIds')
    if (ids) albumIds.value = JSON.parse(ids)
  }

  // Геттеры
  const filteredPhotos = computed(() => {
    if (!albumIds.value.length) return photos.value
    return photos.value.filter((photo) => albumIds.value.includes(photo.albumId))
  })

  const sortedPhotos = computed(() => {
    const arr = [...filteredPhotos.value]
    arr.sort((a, b) => {
      const dir = sortConfig.value.direction === 'asc' ? 1 : -1
      if (a[sortConfig.value.key] < b[sortConfig.value.key]) return -1 * dir
      if (a[sortConfig.value.key] > b[sortConfig.value.key]) return 1 * dir
      return 0
    })
    return arr
  })

  // Теперь возвращаем все загруженные (pagedPhotos не нужен)
  return {
    photos: sortedPhotos,
    loading,
    albumIds,
    sortConfig,
    page,
    pageSize,
    allLoaded,
    fetchPhotos,
    sortPhotos,
    loadMore,
    restoreAlbumIds,
  }
})
