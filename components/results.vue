<template>
  <div>
    <p class="title">Results</p>
    <!-- <p>This is disabled until TODOs fixed!</p> -->
    <div v-if="files && files.length">
      <div v-for="file in files">
        <a :href="file.url" download>{{file.filename}}</a>
      </div>
    </div>
    <!-- <b-button icon-left="download" size="is-large">Add</b-button> -->
  </div>
</template>

<script>
export default {
  props: ["submission"],
  data() {
    return {
      files: [],
    };
  },
  mounted() {
    this.refreshFiles();
    // this.onChange();
  },
  methods: {
    async refreshFiles() {
      const res = await this.$axios.get("/api/getOutput", {
        params: {
          submission: this.submission.id,
        },
      });

      this.files = res.data.files;
    },
  },
};
</script>