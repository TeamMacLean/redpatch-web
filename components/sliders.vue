<template>
  <section class="section">
    <!-- <figure class="image outlined is-400x400"> -->
    <div v-for="url in urls" class="is-inline">
      <img :src="url" class="image outlined is-inline-block" alt="image with filter applied" style="margin-right:30px;" />
    </div>

    <div class="columns">
      <b-loading :is-full-page="false" :active="!canEdit" :can-cancel="true"></b-loading>
      <div class="column">
        <SliderSet
          :canEdit="canEdit"
          :onChange="onHealthyAreaChange"
          title="healthy_area"
          :values="healthy_area"
        />
      </div>
      <div class="column">
        <SliderSet
          :canEdit="canEdit"
          :onChange="onLeafAreaChange"
          title="leaf_area"
          :values="leaf_area"
        />
      </div>
      <div class="column">
        <SliderSet
          :canEdit="canEdit"
          :onChange="onLesionAreaChange"
          title="lesion_area"
          :values="lesion_area"
        />
      </div>
      <div class="column">
        <SliderSet
          :canEdit="canEdit"
          :onChange="onScaleCardChange"
          title="scale_card"
          :values="scale_card"
        />
      </div>
    </div>

    <div class="buttons">
      <b-button type="is-primary">Process all images</b-button>
      <b-button type="is-primary">Download config</b-button>
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
      urls: []
    };
  },
  methods: {
    onHealthyAreaChange(data) {
      this.healthy_area = data;
      this.onChange();
    },
    onLeafAreaChange(data) {
      this.leaf_area = data;
      this.onChange();
    },
    onLesionAreaChange(data) {
      this.lesion_area = data;
      this.onChange();
    },
    onScaleCardChange(data) {
      this.scale_card = data;
      this.onChange();
    },
    onChange() {
      this.canEdit = false;
      this.$axios
        .post("/api/updatehsv", {
          submission: this.submission.id,
          config: {
            healthy_area: this.healthy_area,
            leaf_area: this.leaf_area,
            lesion_area: this.lesion_area,
            scale_card: this.scale_card
          }
        })
        .then(res => {
          // console.log(res.data);
          this.$buefy.snackbar.open({
            message: `Successfully updated value to server`,
            queue: false,
            actionText: null
          });
          // this.refreshImage();

          return this.refreshPreviews();
        })
        .catch(err => {
          console.error("err");
          this.$buefy.toast.open({
            duration: 5000,
            message: err,
            position: "is-top",
            type: "is-danger"
          });
        })
        .finally(() => {
          this.canEdit = true;
        });
    },
    async refreshPreviews() {
      const res = await this.$axios.get("/api/previews", {
        params: {
          uuid: this.submission.uuid
        }
      });

      this.urls = res.data.urls;
    }
  },
  mounted() {
    this.refreshPreviews();
    this.onChange();
  },
  computed: {
    url() {
      let file = null;
      //get image
      if (this.submission.previewFile) {
        file = this.submission.previewFile;
      } else {
        file = this.submission.files[0];
      }
      const root = "/";
      return (
        path.join(root, file.destination, "..", "preview", file.filename) +
        "?rnd=" +
        this.cacheKey
      );
    }
  }
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