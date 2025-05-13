<template>
  <form @submit.prevent="onSearch" class="w-full max-w-[600px] flex items-center gap-2 mb-6">
    <Input
      v-model="input"
      @keydown.enter="onSearch"
      type="text"
      placeholder="Введите ID альбомов через пробел (например: 1 2 3)"
      autocomplete="off"
    />
    <Button type="submit" variant="secondary" :disabled="loading">
      <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
      Поиск
    </Button>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-vue-next'

defineProps<{ loading: boolean }>()
const emit = defineEmits<{
  (e: 'search', ids: number[]): void
}>()

const input = ref('')

onMounted(() => {
  const saved = localStorage.getItem('albumIds')
  if (saved) {
    try {
      const arr = JSON.parse(saved)
      if (Array.isArray(arr) && arr.length) {
        input.value = arr.join(' ')
      }
    } catch {}
  }
})

function onSearch() {
  const ids = input.value
    .split(' ')
    .map((v) => v.trim())
    .filter(Boolean)
    .map(Number)
    .filter((v) => !isNaN(v))
  emit('search', ids)
}
</script>
