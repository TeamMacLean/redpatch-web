<template>
  <section class="section">
    <b-field>
      <div ref="dashboardContainer"></div>
    </b-field>
    <div class="buttons">
      <b-button type="is-primary" :disabled="!canMoveOn" @click="moveOn">Move on</b-button>
    </div>
  </section>
</template>

<script>
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import Dashboard from "@uppy/dashboard";

import { v1 as uuid } from "uuid";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

export default {
  props: ["uuid"],
  data() {
    return { canMoveOn: false };
  },
  methods: {
    moveOn() {
      this.$emit("oncompletion", {});
    }
  },
  mounted() {
    if (process.browser) {
      this.uppy = Uppy({
        debug: true,
        // autoProceed: true,
        restrictions: {
          maxFileSize: 100 * 1000000, //100mb
          minNumberOfFiles: 1,
          maxNumberOfFiles: 50,
          allowedFileTypes: ["image/*"]
        }
      })
        .use(Dashboard, {
          inline: true,
          height: 450,
          target: this.$refs.dashboardContainer,
          replaceTargetContent: true,
          showProgressDetails: true,
          browserBackButtonClose: true
        })
        .use(XHRUpload, {
          limit: 1, //REALLY IMPORTANT!, if more than one file uploads at a time there will be duplicate submissions
          endpoint: "/api/upload",
          formData: true,
          fieldName: "file",
          headers: {
            "REDPATCH-ID": this.uuid
          }
        });

      this.uppy.on("complete", event => {
        if (event.successful[0] !== undefined) {
          this.canMoveOn = true;
        }
      });
    }
  }
};
</script>

<style>
.uppy-Dashboard {
  margin: 0 auto;
  display: inline-block;
}
</style>