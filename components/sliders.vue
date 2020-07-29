<template>
  <section class="section">
    <!-- <figure class="image outlined is-400x400"> -->

    <p>Select the HSV values to isolate the different regions in the test image. The white areas in the preview indicate the regions that will be selected.</p>
    <p>If you have selected a scale card please remember to add the side length in centimetres.</p>
    <p>Click "Process all images" to apply the settings.</p>
    <p>If want to save the settings to use them again or in other versions of Redpatch select "Download config".</p>
    <p>If you have previously saved settings, upload them using "Upload config"</p>
    <div class="columns">
      <b-loading :is-full-page="false" :active="!canEdit" :can-cancel="true"></b-loading>
      <div class="column">
        <img
          :src="urls['original']"
          class="image outlined is-inline-block"
          alt="image with filter applied"
          style="margin-right:30px;"
        />
      </div>
      <div class="column">
        <img
          :src="urls['leaf_area']+ '?rnd=' + cacheKey"
          class="image outlined is-inline-block"
          alt="image with filter applied"
          style="margin-right:30px;"
        />
        <SliderSet
          :canEdit="canEdit"
          :onChange="onLeafAreaChange"
          title="Leaf Area"
          :values="leaf_area"
        />
      </div>
      <div class="column">
        <img
          :src="urls['healthy_area']+ '?rnd=' + cacheKey"
          class="image outlined is-inline-block"
          alt="image with filter applied"
          style="margin-right:30px;"
        />
        <SliderSet
          :canEdit="canEdit"
          :onChange="onHealthyAreaChange"
          title="Healthy Area"
          :values="healthy_area"
        />
      </div>
      <div class="column">
        <img
          :src="urls['lesion_area']+ '?rnd=' + cacheKey"
          class="image outlined is-inline-block"
          alt="image with filter applied"
          style="margin-right:30px;"
        />
        <SliderSet
          :canEdit="canEdit"
          :onChange="onLesionAreaChange"
          title="Lesion Area"
          :values="lesion_area"
        />
      </div>
      <div class="column" v-if="submission.hasScaleCard">
        <img
          :src="urls['scale_card']+ '?rnd=' + cacheKey"
          class="image outlined is-inline-block"
          alt="image with filter applied"
          style="margin-right:30px;"
        />
        <SliderSet
          :canEdit="canEdit"
          :onChange="onScaleCardChange"
          title="Scale Card"
          :values="scale_card"
        />scale size (cm)
        <input type="number" min="1" max="9999" />
      </div>
    </div>

    <br />
    <br />
    <br />
    <div class="buttons">
      <!-- <b-upload ref="customConfigInput" :native="true" @change="onCustomConfigSelect()">
        <a class="button is-primary">
          <b-icon icon="upload"></b-icon>
          <span>Upload config</span>
        </a>
      </b-upload>-->
      <label class="upload control">
        <a class="button is-primary">
          <span class="icon">
            <i class="mdi mdi-upload mdi-24px"></i>
          </span>
          <span>Upload config</span>
        </a>
        <input type="file" ref="customConfigInput" @change="onCustomConfigSelect()" />
      </label>
      <!-- <span class="file-name" v-if="uploadCustomConfigFile">{{ uploadCustomConfigFile.name }}</span> -->

      <b-button
        type="is-primary"
        tag="a"
        :href="configDownloadURL"
        download="redpatch-config.yaml"
      >Download config</b-button>
      <b-button type="is-primary">Process all images</b-button>
    </div>
  </section>
</template>

<script>
import path from "path";
import SliderSet from "./_sliderSet";

export default {
  props: ["submission"],
  components: { SliderSet },
  data() {
    if (!this.submission || !this.submission.config) {
      //TODO: throw error!!!!
      alert("NO SUBMISSION OR CONFIG");
    }
    return {
      canEdit: true,
      healthy_area: this.submission.config.healthy_area,
      leaf_area: this.submission.config.leaf_area,
      lesion_area: this.submission.config.lesion_area,
      scale_card: this.submission.config.scale_card,
      urls: [],
      cacheKey: +new Date(),
    };
  },
  methods: {
    onCustomConfigSelect() {
      this.canEdit = false;

      const file = this.$refs.customConfigInput.files[0];
      // customConfigInput

      var formData = new FormData();
      formData.append("file", file);
      console.log('posting', file)
      this.$axios
        .post("/api/uploadConfig", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "REDPATCH-ID": this.submission.uuid,
          },
        })
        .then(({ data }) => {
          this.$buefy.snackbar.open({
            type: "is-danger",
            message: `Successfully uploaded config.`,
            queue: false,
            actionText: null,
          });

          //TODO refresh ALL
        })
        .catch((err) => {
          this.$buefy.snackbar.open({
            type: "is-danger",
            message: `Failed to upload config.`,
            queue: false,
            actionText: null,
          });
        })
        .finally(() => {
          this.canEdit = true;
        });

      //TODO upload and refresh
    },
    onHealthyAreaChange(data) {
      this.healthy_area = data;
      this.onChange("healthy_area");
    },
    onLeafAreaChange(data) {
      this.leaf_area = data;
      this.onChange("leaf_area");
    },
    onLesionAreaChange(data) {
      this.lesion_area = data;
      this.onChange("lesion_area");
    },
    onScaleCardChange(data) {
      this.scale_card = data;
      this.onChange("scale_card");
    },
    pushCustomConfig() {},
    onChange(type) {
      this.canEdit = false;
      this.$axios
        .post("/api/updatehsv", {
          type: type,
          submission: this.submission.id,
          config: {
            healthy_area: this.healthy_area,
            leaf_area: this.leaf_area,
            lesion_area: this.lesion_area,
            scale_card: this.scale_card,
          },
        })
        .then((res) => {
          this.$buefy.snackbar.open({
            message: `Successfully changed config.`,
            queue: false,
            actionText: null,
          });

          this.refreshPreviews();
        })
        .catch((err) => {
          console.error("err");
          this.$buefy.toast.open({
            duration: 5000,
            message: err,
            position: "is-top",
            type: "is-danger",
          });
        })
        .finally(() => {
          this.canEdit = true;
        });
    },
    async refreshPreviews() {
      const res = await this.$axios.get("/api/previews", {
        params: {
          uuid: this.submission.uuid,
        },
      });

      this.urls = res.data.urls;

      this.cacheKey = +new Date();
    },
  },
  mounted() {
    this.refreshPreviews();
    // this.onChange();
  },
  computed: {
    configDownloadURL() {
      return `/uploads/${this.submission.uuid}/config.yaml`;
    },
  },
  // computed: {
  //   url() {
  //     let file = null;
  //     //get image
  //     if (this.submission.previewFile) {
  //       file = this.submission.previewFile;
  //     } else {
  //       file = this.submission.files[0];
  //     }
  //     const root = "/";
  //     return (
  //       path.join(root, file.destination, "..", "preview", file.filename) +
  //       "?rnd=" +
  //       this.cacheKey
  //     );
  //   }
  // }
};
</script>

<style>
.image.outlined {
  border: 1px solid black;
}
.image.is-400x400 {
  height: 400px;
  width: 400px;
}
.image.is-400x200 img {
  max-width: 400px;
  max-height: 400px;
}

.is-inline-block {
  display: inline-block !important;
}
</style>