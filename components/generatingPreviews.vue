<template>
  <div>
    <div class="notification is-info">
      <p class="title">Please wait while we generate the previews.</p>
      <p>If the images are very large this can take a while.</p>
      <p>
        If you don't want to wait, you can access this page and keep your progress using this link:
        <a :href="linkBack">{{ linkBack }}</a>
      </p>
    </div>
    <progress class="progress is-primary" max="100"></progress>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'

interface Submission {
  uuid: string
}

const props = defineProps<{
  submission: Submission
}>()

const emit = defineEmits<{
  oncompletion: []
}>()

const config = useRuntimeConfig()

const linkBack = computed(() => `${config.public.baseUrl}/#${props.submission.uuid}`)

let polling: ReturnType<typeof setInterval> | null = null

async function ensureLoading() {
  await $fetch('/api/ensurepreloading', {
    method: 'POST',
    body: { uuid: props.submission.uuid }
  })
}

function pollData() {
  polling = setInterval(async () => {
    try {
      const data = await $fetch<{ submission?: { preLoaded?: boolean } }>('/api/status', {
        query: { uuid: props.submission.uuid }
      })

      if (data?.submission?.preLoaded) {
        emit('oncompletion')
      }
    } catch (err) {
      console.error(err)
    }
  }, 1000)
}

onMounted(() => {
  ensureLoading()
  pollData()
})

onBeforeUnmount(() => {
  if (polling) {
    clearInterval(polling)
  }
})
</script>
