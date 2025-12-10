<template>
  <div>
    <p class="is-size-3">Redpatch is a tool for assessing lesion size in plant leaf images.</p>
    <br />
    <div class="is-size-5">
      <p>
        Redpatch works by separating the image into sections using user-defined HSV colour
        specifications for healthy and infected leaf areas.
      </p>
      <br />
      <p>The process takes three steps:</p>
      <div class="content">
        <ol>
          <li>
            <p>Upload images</p>
          </li>
          <li>
            <p>Define parameters for lesion and healthy regions interactively in a test image</p>
          </li>
          <li>
            <p>Use parameters from Step 2 on remaining images and measure lesions</p>
          </li>
        </ol>
      </div>
    </div>
    <br />
    <div class="field">
      <div ref="dashboardContainer"></div>
    </div>
    <br />

    <div class="content">
      <label class="checkbox">
        <input v-model="hasScaleCard" type="checkbox" />
        Click this box if the images contain a scale card that you wish to use to estimate areas in
        real units. Scale cards must be square and a very different colour from the leaves. Pink is
        nice.
      </label>
    </div>
    <div class="buttons">
      <button class="button is-primary" :disabled="!canMoveOn" @click="moveOn">Move on</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Uppy from '@uppy/core'
import XHRUpload from '@uppy/xhr-upload'
import Dashboard from '@uppy/dashboard'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

const props = defineProps<{
  uuid: string
}>()

const emit = defineEmits<{
  oncompletion: [payload: { hasScaleCard: boolean }]
}>()

const dashboardContainer = ref<HTMLElement | null>(null)
const hasScaleCard = ref(false)
const canMoveOn = ref(false)

let uppy: Uppy | null = null

function moveOn() {
  emit('oncompletion', { hasScaleCard: hasScaleCard.value })
}

onMounted(() => {
  if (import.meta.client && dashboardContainer.value) {
    uppy = new Uppy({
      debug: true,
      restrictions: {
        maxFileSize: 25 * 1000000, // 25mb
        minNumberOfFiles: 1,
        maxNumberOfFiles: 50,
        allowedFileTypes: ['image/*']
      }
    })
      .use(Dashboard, {
        inline: true,
        width: '100%',
        height: 450,
        target: dashboardContainer.value,
        showProgressDetails: true
      })
      .use(XHRUpload, {
        limit: 1, // Important: prevents duplicate submissions
        endpoint: '/api/upload',
        formData: true,
        fieldName: 'file',
        headers: {
          'REDPATCH-ID': props.uuid
        }
      })

    uppy.on('complete', (result) => {
      if (result.successful && result.successful.length > 0) {
        canMoveOn.value = true
      }
    })
  }
})
</script>

<style scoped>
:deep(.uppy-Dashboard) {
  margin: 0 auto;
  display: inline-block;
  width: 100% !important;
}
</style>
