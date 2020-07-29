<template>
  <section class="section">
    <div class="content">
      <p v-if="this.submission.hasScaleCard">These are your uploaded images. Please select one with a scale card to use for parameter estimation, then press "Move on"</p>
      <p v-if="!this.submission.hasScaleCard">These are your uploaded images. Please select one to use for parameter estimation, then press "Move on"</p>
    </div>
    <VueSelectImage :dataImages="images" @onselectimage="onSelectImage"></VueSelectImage>

    <div class="content">
      <div v-if="selected">Selected {{selected.alt}}</div>
    </div>
    <div class="buttons">
      <b-button type="is-primary" :disabled="!canMoveOn" @click="moveOn">Move on</b-button>
    </div>
  </section>
</template>

<script>
import path from "path";
import VueSelectImage from "vue-select-image";
import "vue-select-image/dist/vue-select-image.css";

export default {
  props: ["submission"],
  data() {
    const root = "/";

    const images = this.submission.files.map((file) => {
      return {
        id: file.id,
        src: path.join(root, file.destination, "..", "preview", file.filename),
        alt: file.originalname,
      };
    });

    return {
      images: images,
      selected: null,
      canMoveOn: false,
    };
  },
  components: { VueSelectImage },
  methods: {
    onSelectImage(image) {
      console.log("selected", image);
      this.selected = image;
      this.canMoveOn = true;
    },
    moveOn() {
      this.$emit("oncompletion", { selected: this.selected });
    },
  },
};
</script>