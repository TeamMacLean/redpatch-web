<template>
  <div class="section">
    <div class="container">Results here!</div>
  </div>
</template>

<script>
export default {
  props: ["submission"],
  data() {
    return {};
  },
  methods: {
    computed: {
      linkBack() {
        return `${process.env.BASE_URL}/${this.submission.uuid}`;
      },
    },
  },
};
</script>