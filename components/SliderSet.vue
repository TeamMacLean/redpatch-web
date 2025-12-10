<template>
  <div>
    <p>{{ title }}</p>
    <div class="slider-row">
      <div class="slider-label">H</div>
      <div class="slider-container">
        <input
          v-model.number="localValues.h[0]"
          type="range"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!canEdit"
          class="slider"
          @change="innerOnChange"
        />
        <input
          v-model.number="localValues.h[1]"
          type="range"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!canEdit"
          class="slider"
          @change="innerOnChange"
        />
        <span class="slider-values"
          >{{ localValues.h[0].toFixed(2) }} - {{ localValues.h[1].toFixed(2) }}</span
        >
      </div>
    </div>
    <div class="slider-row">
      <div class="slider-label">S</div>
      <div class="slider-container">
        <input
          v-model.number="localValues.s[0]"
          type="range"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!canEdit"
          class="slider"
          @change="innerOnChange"
        />
        <input
          v-model.number="localValues.s[1]"
          type="range"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!canEdit"
          class="slider"
          @change="innerOnChange"
        />
        <span class="slider-values"
          >{{ localValues.s[0].toFixed(2) }} - {{ localValues.s[1].toFixed(2) }}</span
        >
      </div>
    </div>
    <div class="slider-row">
      <div class="slider-label">V</div>
      <div class="slider-container">
        <input
          v-model.number="localValues.v[0]"
          type="range"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!canEdit"
          class="slider"
          @change="innerOnChange"
        />
        <input
          v-model.number="localValues.v[1]"
          type="range"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!canEdit"
          class="slider"
          @change="innerOnChange"
        />
        <span class="slider-values"
          >{{ localValues.v[0].toFixed(2) }} - {{ localValues.v[1].toFixed(2) }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface HSVValues {
  h: [number, number]
  s: [number, number]
  v: [number, number]
}

const props = defineProps<{
  title: string
  values: HSVValues
  canEdit: boolean
}>()

const emit = defineEmits<{
  change: [values: HSVValues]
}>()

const localValues = reactive<HSVValues>({
  h: [...props.values.h] as [number, number],
  s: [...props.values.s] as [number, number],
  v: [...props.values.v] as [number, number]
})

// Watch for external changes
watch(
  () => props.values,
  (newValues) => {
    localValues.h = [...newValues.h] as [number, number]
    localValues.s = [...newValues.s] as [number, number]
    localValues.v = [...newValues.v] as [number, number]
  },
  { deep: true }
)

function innerOnChange() {
  emit('change', {
    h: [...localValues.h] as [number, number],
    s: [...localValues.s] as [number, number],
    v: [...localValues.v] as [number, number]
  })
}
</script>

<style scoped>
.slider-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.slider-label {
  width: 30px;
  font-weight: bold;
}

.slider-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slider {
  flex: 1;
  cursor: pointer;
}

.slider:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.slider-values {
  min-width: 100px;
  text-align: right;
  font-size: 0.85rem;
  color: #666;
}
</style>
