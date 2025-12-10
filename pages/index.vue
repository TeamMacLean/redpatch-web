<template>
  <section class="section">
    <div class="container">
      <div v-if="showUploader && uuidReady">
        <Upload :uuid="uuid" @oncompletion="onUploadCompletion" />
      </div>
      <div v-if="showPicker">
        <SelectImage :submission="submission!" @oncompletion="onPickerCompletion" />
      </div>
      <div v-if="showPreLoading">
        <GeneratingPreviews :submission="submission!" @oncompletion="onPreLoadCompleting" />
      </div>
      <div v-if="showSliders">
        <Sliders :submission="submission!" @oncompletion="onSlidersCompletion" />
      </div>
      <div v-if="showProcessing">
        <GeneratingProcessed :submission="submission!" @oncompletion="onProcessingCompletion" />
      </div>
      <div v-if="showResults">
        <Results :submission="submission!" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'

interface Submission {
  id: string
  uuid: string
  hasScaleCard: boolean
  scaleCM: number
  preLoading: boolean
  preLoaded: boolean
  processingAll: boolean
  processedAll: boolean
  previewFile: any
  files: any[]
  config: any
}

const route = useRoute()

const uuid = ref('')
const uuidReady = ref(false)
const showUploader = ref(true)
const showPicker = ref(false)
const showSliders = ref(false)
const showPreLoading = ref(false)
const showProcessing = ref(false)
const showResults = ref(false)
const submission = ref<Submission | null>(null)

function processHash(hash: string): string | null {
  const splitted = hash.split('#')
  return splitted.length > 1 ? splitted[1] : null
}

async function refresh() {
  const { data } = await useFetch<{ submission?: Submission }>('/api/status', {
    query: { uuid: uuid.value }
  })

  // Reset all states
  showUploader.value = false
  showPicker.value = false
  showSliders.value = false
  showPreLoading.value = false
  showProcessing.value = false
  showResults.value = false

  const sub = data.value?.submission

  if (sub?.files && sub.files.length > 0) {
    submission.value = sub

    if (sub.files.length === 1 || sub.previewFile) {
      if (sub.preLoaded) {
        if (sub.processedAll) {
          showResults.value = true
        } else if (sub.processingAll) {
          showProcessing.value = true
        } else {
          showSliders.value = true
        }
      } else {
        showPreLoading.value = true
      }
    } else {
      showPicker.value = true
    }
  } else {
    showUploader.value = true
  }
}

async function onUploadCompletion({ hasScaleCard }: { hasScaleCard: boolean }) {
  await $fetch('/api/postUploadStuff', {
    method: 'POST',
    body: {
      uuid: uuid.value,
      hasScaleCard
    }
  })

  // Update URL hash
  if (import.meta.client) {
    history.pushState({}, '', `${route.path}#${encodeURIComponent(uuid.value)}`)
  }

  await refresh()
}

async function onPickerCompletion({ selected }: { selected: { id: string } }) {
  await $fetch('/api/setselected', {
    method: 'POST',
    body: {
      submission: submission.value!.id,
      file: selected.id
    }
  })

  await refresh()
}

function onPreLoadCompleting() {
  refresh()
}

function onProcessingCompletion() {
  refresh()
}

async function onSlidersCompletion() {
  await $fetch('/api/setProcessing', {
    method: 'POST',
    body: {
      submission: submission.value!.id
    }
  })

  await refresh()
}

onMounted(() => {
  // Get UUID from hash or generate new one
  const hash = route.hash
  uuid.value = (hash && processHash(hash)) || uuidv4()
  uuidReady.value = true

  // Initial load
  refresh()
})
</script>
