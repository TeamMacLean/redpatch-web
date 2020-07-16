<template>
  <div>
    <p>{{title}}</p>
    <div style="display:flex; justify-content: space-between; line-height: 2.5em;">
      <div style="margin-right:8px;">H</div>
      <div style="flex-grow:1">
        <b-slider
          v-model="values.h"
          type="is-info"
          :min="0"
          :max="1"
          :step="0.01"
          @change="innerOnChange"
          :disabled="!canEdit"
        ></b-slider>
      </div>
    </div>
    <div style="display:flex; justify-content: space-between; line-height: 2.5em;">
      <div style="margin-right:8px;">S</div>
      <div style="flex-grow:1">
        <b-slider
          v-model="values.s"
          type="is-info"
          :min="0"
          :max="1"
          :step="0.01"
          @change="innerOnChange"
          :disabled="!canEdit"
        ></b-slider>
      </div>
    </div>
    <div style="display:flex; justify-content: space-between; line-height: 2.5em;">
      <div style="margin-right:8px;">V</div>
      <div style="flex-grow:1">
        <b-slider
          v-model="values.v"
          type="is-info"
          :min="0"
          :max="1"
          :step="0.01"
          @change="innerOnChange"
          :disabled="!canEdit"
        ></b-slider>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    console.log('VALUES', this.values);
    return {}
  },
  props: ["onChange", "canEdit", "title", "values"],
  methods: {
    innerOnChange() {
      this.onChange(this.values);
    }
  }
};
</script>