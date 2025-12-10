<template>
  <div>
    <div class="content">
      <p>Instructions</p>
      <ol>
        <li>
          Select the HSV values to isolate the different regions in the test image. The white areas
          in the preview indicate the regions that will be selected.
        </li>
        <li>
          If you have selected a scale card please remember to add the side length in centimetres.
        </li>
        <li>Click "Process all images" to apply the settings.</li>
        <li>
          If you want to save the settings to use them again or in other versions of Redpatch select
          "Download config".
        </li>
        <li>If you have previously saved settings, upload them using "Upload config"</li>
      </ol>
    </div>

    <div class="columns">
      <div v-if="!canEdit" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <div class="column">
        <img
          :src="urls.original"
          class="image outlined is-inline-block original-image"
          alt="Original image"
        />
      </div>

      <div class="column">
        <div v-show="step === 1">
          <img
            :src="urls.leaf_area + '?rnd=' + cacheKey"
            class="image outlined is-inline-block filtered-image"
            alt="Leaf area filter"
          />
          <SliderSet
            :can-edit="canEdit"
            title="Leaf Area"
            :values="leaf_area"
            @change="onLeafAreaChange"
          />
        </div>

        <div v-show="step === 2">
          <img
            :src="urls.healthy_area + '?rnd=' + cacheKey"
            class="image outlined is-inline-block filtered-image"
            alt="Healthy area filter"
          />
          <SliderSet
            :can-edit="canEdit"
            title="Healthy Area"
            :values="healthy_area"
            @change="onHealthyAreaChange"
          />
        </div>

        <div v-show="step === 3">
          <img
            :src="urls.lesion_area + '?rnd=' + cacheKey"
            class="image outlined is-inline-block filtered-image"
            alt="Lesion area filter"
          />
          <SliderSet
            :can-edit="canEdit"
            title="Lesion Area"
            :values="lesion_area"
            @change="onLesionAreaChange"
          />
        </div>

        <div v-if="hasScaleCard" v-show="step === 4">
          <img
            :src="urls.scale_card + '?rnd=' + cacheKey"
            class="image outlined is-inline-block filtered-image"
            alt="Scale card filter"
          />
          <SliderSet
            :can-edit="canEdit"
            title="Scale Card"
            :values="scale_card"
            @change="onScaleCardChange"
          />
          <p>
            Scale size (cm):
            <input
              v-model.number="scaleCM"
              class="input is-inline"
              type="number"
              min="1"
              max="9999"
              required
              @change="onScaleCMChange"
            />
          </p>
        </div>

        <div class="step-buttons">
          <button class="button is-primary" :disabled="!canGoLeft" @click="step--">&lt;</button>
          <button class="button is-primary" :disabled="!canGoRight" @click="step++">&gt;</button>
        </div>
      </div>
    </div>

    <br /><br /><br />

    <div class="buttons">
      <label class="file-label">
        <input
          ref="customConfigInput"
          type="file"
          class="file-input"
          @change="onCustomConfigSelect"
        />
        <span class="file-cta">
          <span class="file-icon">
            <i class="mdi mdi-upload"></i>
          </span>
          <span class="file-label">Upload config</span>
        </span>
      </label>

      <a class="button is-primary" :href="configDownloadURL" download="redpatch-config.yaml">
        Download config
      </a>

      <button class="button is-primary" :disabled="!canMoveOn" @click="onMoveOn">
        Process all images
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface HSVValues {
  h: [number, number]
  s: [number, number]
  v: [number, number]
}

interface Config {
  healthy_area: HSVValues
  leaf_area: HSVValues
  lesion_area: HSVValues
  scale_card: HSVValues
}

interface Submission {
  id: string
  uuid: string
  hasScaleCard: boolean
  scaleCM: number
  config: Config
}

const props = defineProps<{
  submission: Submission
}>()

const emit = defineEmits<{
  oncompletion: []
}>()

const step = ref(1)
const scaleCM = ref(props.submission.scaleCM)
const canEdit = ref(true)
const submittingScaleCM = ref(false)
const cacheKey = ref(Date.now())
const customConfigInput = ref<HTMLInputElement | null>(null)

const urls = ref({
  original: '',
  healthy_area: '',
  leaf_area: '',
  lesion_area: '',
  scale_card: ''
})

const healthy_area = ref<HSVValues>({
  ...props.submission.config.healthy_area
})
const leaf_area = ref<HSVValues>({ ...props.submission.config.leaf_area })
const lesion_area = ref<HSVValues>({ ...props.submission.config.lesion_area })
const scale_card = ref<HSVValues>({ ...props.submission.config.scale_card })

const hasScaleCard = computed(() => props.submission.hasScaleCard)
const canGoRight = computed(() => (hasScaleCard.value ? step.value < 4 : step.value < 3))
const canGoLeft = computed(() => step.value > 1)
const canMoveOn = computed(() => {
  if (hasScaleCard.value) {
    return scaleCM.value > 0 && !submittingScaleCM.value
  }
  return true
})
const configDownloadURL = computed(() => `/api/uploads/${props.submission.uuid}/config.yaml`)

async function onMoveOn() {
  const { data } = await useFetch('/api/setProcessing', {
    method: 'POST',
    body: { submission: props.submission.id }
  })

  if (data.value && (data.value as any).error) {
    console.error((data.value as any).error)
  } else {
    emit('oncompletion')
  }
}

async function onScaleCMChange() {
  submittingScaleCM.value = true
  await useFetch('/api/setScaleCM', {
    method: 'POST',
    body: {
      submission: props.submission.id,
      scaleCM: scaleCM.value
    }
  })
  submittingScaleCM.value = false
}

async function onCustomConfigSelect() {
  if (!customConfigInput.value?.files?.[0]) return

  canEdit.value = false
  const file = customConfigInput.value.files[0]
  const formData = new FormData()
  formData.append('file', file)

  try {
    await $fetch('/api/uploadConfig', {
      method: 'POST',
      body: formData,
      headers: {
        'REDPATCH-ID': props.submission.uuid
      }
    })
    alert('Successfully uploaded config.')
  } catch (err) {
    alert('Failed to upload config.')
    console.error(err)
  } finally {
    await refreshSliders()
    await refreshPreviews()
    canEdit.value = true
  }
}

function onHealthyAreaChange(data: HSVValues) {
  healthy_area.value = data
  onChange('healthy_area')
}

function onLeafAreaChange(data: HSVValues) {
  leaf_area.value = data
  onChange('leaf_area')
}

function onLesionAreaChange(data: HSVValues) {
  lesion_area.value = data
  onChange('lesion_area')
}

function onScaleCardChange(data: HSVValues) {
  scale_card.value = data
  onChange('scale_card')
}

async function onChange(type: string) {
  canEdit.value = false

  try {
    await $fetch('/api/updatehsv', {
      method: 'POST',
      body: {
        type,
        submission: props.submission.id,
        config: {
          healthy_area: healthy_area.value,
          leaf_area: leaf_area.value,
          lesion_area: lesion_area.value,
          scale_card: scale_card.value
        }
      }
    })
  } catch (err) {
    console.error('Error updating HSV:', err)
  } finally {
    await refreshPreviews()
    canEdit.value = true
  }
}

async function refreshPreviews() {
  const { data } = await useFetch('/api/previews', {
    query: { uuid: props.submission.uuid }
  })

  if (data.value && (data.value as any).urls) {
    urls.value = (data.value as any).urls
  }
  cacheKey.value = Date.now()
}

async function refreshSliders() {
  const { data } = await useFetch('/api/status', {
    query: { uuid: props.submission.uuid }
  })

  const submission = (data.value as any)?.submission
  if (submission?.config) {
    healthy_area.value = submission.config.healthy_area
    leaf_area.value = submission.config.leaf_area
    lesion_area.value = submission.config.lesion_area
    scale_card.value = submission.config.scale_card
  }
}

// Initial load
onMounted(() => {
  refreshPreviews()
})
</script>

<style scoped>
.image.outlined {
  border: 1px solid black;
}

.is-inline-block {
  display: inline-block !important;
}

.original-image {
  margin-right: 30px;
}

.filtered-image,
.original-image {
  max-height: calc(100vh - 350px);
}

.step-buttons {
  margin-top: 1rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3273dc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.columns {
  position: relative;
}

.input.is-inline {
  width: 100px;
  display: inline-block;
}
</style>
