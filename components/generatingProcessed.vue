<template>
  <div class="section">
    <div class="container">
      <b-notification :closable="false">
        <p class="title">Please wait while we generate the processed images.</p>If the images are very large this can take a while.
        If you don’t want to wait, you can access this page and keep your progress using this link
        <a
          :href="linkBack"
        >{{linkBack}}</a>
      </b-notification>
      <b-progress></b-progress>
    </div>
  </div>
</template>

<script>
export default {
  props: ["submission"],
  data() {
    return {
      polling: null,
    };
  },
  methods: {
    ensureLoading() {
      this.$axios
        .post("/api/ensureProcessing", { submission: this.submission.id })
        .then(({ data }) => {
          if (data && data.error) {
            console.error(data.error);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    pollData() {
      this.polling = setInterval(() => {
        this.$axios
          .get("/api/status", {
            params: {
              uuid: this.submission.uuid,
            },
          })
          .then(({ data }) => {
            console.log(
              "data",
              data.submission.processingAll,
              data.submission.processedAll
            );

            if (data && data.submission) {
              console.log("has data and submission");
              if (data.submission.processedAll) {
                console.log("is preloaded, emitting");
                return this.$emit("oncompletion");
              }
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }, 1000);
    },
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  created() {
    this.ensureLoading();
    this.pollData();
  },
  computed: {
    linkBack() {
      return `${process.env.BASE_URL}/#${this.submission.uuid}`;
    },
  },
};
</script>