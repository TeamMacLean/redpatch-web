<template>
  <div>
    <p class="title">Results</p>
    <div v-if="files && files.length" class="content">
      <div v-for="file in files" :key="file.filename">
        <a :href="file.url" download>{{ file.filename }}</a>
      </div>
    </div>
    <div v-else class="content">
      <p>No output files found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface FileOutput {
  filename: string
  url: string
}

interface Submission {
  id: string
}

const props = defineProps<{
  submission: Submission
}>()

const files = ref<FileOutput[]>([])

async function refreshFiles() {
  try {
    const data = await $fetch<{ files?: FileOutput[] }>('/api/getOutput', {
      query: { submission: props.submission.id }
    })

    if (data?.files) {
      files.value = data.files
    }
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  refreshFiles()
})
</script>
