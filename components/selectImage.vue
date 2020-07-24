<template>
  <section class="section">
    <p>Select an image to be used as the preview for later steps.</p>
    <VueSelectImage :dataImages="images" @onselectimage="onSelectImage"></VueSelectImage>

    <div v-if="selected">Selected {{selected.alt}}</div>
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

    const images = this.submission.files.map(file => {
      return {
        id: file.id,
        src: path.join(root, file.destination, "..", "preview", file.filename),
        alt: file.originalname
      };
    });

    return {
      images: images,
      selected: null,
      canMoveOn: false
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
    }
  }
};
</script>