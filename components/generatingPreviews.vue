<template>
  <div class="section">
    <div class="container">
      <b-notification :closable="false">
        <p class="title
        ">Please wait while we generate the previews.</p>
        If the images are very large this can take a while.
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
      this.$axios.post("/api/ensurepreloading", { uuid: this.submission.uuid });
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
              data.submission.preLoading,
              data.submission.preLoaded
            );

            if (data && data.submission) {
              console.log('has data and submission')
              if (data.submission.preLoaded) {
                console.log('is preloaded, emitting')
                return this.$emit("oncompletion");
              }
            }
          })
          .catch((err) => {
            console.error(err);
          });

        // this.$store.dispatch("RETRIEVE_DATA_FROM_BACKEND");
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
  computed:{
    linkBack() {
      console.log(this.submission)
      return `${process.env.BASE_URL}/${this.submission.uuid}`;
    },
  }
};
</script>