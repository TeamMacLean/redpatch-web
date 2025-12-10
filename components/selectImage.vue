<template>
  <div>
    <div class="content">
      <p v-if="submission.hasScaleCard">
        These are your uploaded images. Please select one with a scale card to use for parameter
        estimation, then press "Move on"
      </p>
      <p v-else>
        These are your uploaded images. Please select one to use for parameter estimation, then
        press "Move on"
      </p>
    </div>

    <div class="image-grid">
      <div
        v-for="image in images"
        :key="image.id"
        class="image-item"
        :class="{ selected: selected?.id === image.id }"
        @click="onSelectImage(image)"
      >
        <img :src="image.src" :alt="image.alt" />
        <p class="image-label">{{ image.alt }}</p>
      </div>
    </div>

    <div class="content">
      <div v-if="selected">Selected: {{ selected.alt }}</div>
    </div>
    <div class="buttons">
      <button class="button is-primary" :disabled="!canMoveOn" @click="moveOn">Move on</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface FileData {
  id: string
  destination: string
  filename: string
  originalname: string
}

interface Submission {
  hasScaleCard: boolean
  files: FileData[]
}

interface ImageData {
  id: string
  src: string
  alt: string
}

const props = defineProps<{
  submission: Submission
}>()

const emit = defineEmits<{
  oncompletion: [payload: { selected: ImageData }]
}>()

const selected = ref<ImageData | null>(null)
const canMoveOn = ref(false)

// Build image URLs without using Node's path module (client-side compatible)
const images = computed<ImageData[]>(() => {
  return props.submission.files.map((file) => {
    // Replace 'full' with 'preview' in the destination path
    const previewPath = file.destination.replace(/\/full$/, '/preview')
    return {
      id: file.id,
      src: `/${previewPath}/${file.filename}`,
      alt: file.originalname
    }
  })
})

function onSelectImage(image: ImageData) {
  selected.value = image
  canMoveOn.value = true
}

function moveOn() {
  if (selected.value) {
    emit('oncompletion', { selected: selected.value })
  }
}
</script>

<style scoped>
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
}

.image-item {
  cursor: pointer;
  border: 3px solid transparent;
  padding: 0.5rem;
  transition: border-color 0.2s;
}

.image-item:hover {
  border-color: #dbdbdb;
}

.image-item.selected {
  border-color: #3273dc;
}

.image-item img {
  max-height: 400px;
  width: auto;
}

.image-label {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}
</style>
