<template>
  <section class="section">
    <p class="is-size-3">Redpatch is a tool for assessing lesion size in plant leaf images.</p>
    <br />
    <div class="is-size-5">
      <p>Redpatch works by separating the image into sections using user-defined HSV colour specifications for healthy and infected leaf areas.</p>
      <br />
      <p>The process takes three steps:</p>
      <div class="content">
        <ol>
          <li>
            <p>Upload images</p>
          </li>
          <li>
            <p>Define parameters for lesion and healthy regions interactively in a test image</p>
          </li>
          <li>
            <p>Use parameters from Step 2 on remaining images and measure lesions</p>
          </li>
        </ol>
      </div>
    </div>
    <br />
    <b-field>
      <div ref="dashboardContainer"></div>
    </b-field>
    <br />

    <div class="content">
      <b-checkbox
        v-model="hasScaleCard"
      >Click this box if the images contain a scale card that you wish to use to estimate areas in real units. Scale cards must be square and a very different colour from the leaves. Pink is nice.</b-checkbox>
    </div>
    <div class="buttons">
      <b-button type="is-primary" :disabled="!canMoveOn" @click="moveOn">Move on</b-button>
    </div>
    <br />
    <br />
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
    return { hasScaleCard: false, canMoveOn: false };
  },
  methods: {
    moveOn() {
      this.$emit("oncompletion", { hasScaleCard: this.hasScaleCard });
    },
  },
  mounted() {
    if (process.browser) {
      this.uppy = Uppy({
        debug: true,
        // autoProceed: true,
        restrictions: {
          maxFileSize: 25 * 1000000, //25mb
          minNumberOfFiles: 1,
          maxNumberOfFiles: 50,
          allowedFileTypes: ["image/*"],
        },
      })
        .use(Dashboard, {
          inline: true,
          width: "100%",
          height: 450,
          target: this.$refs.dashboardContainer,
          replaceTargetContent: true,
          showProgressDetails: true,
          browserBackButtonClose: true,
        })
        .use(XHRUpload, {
          limit: 1, //REALLY IMPORTANT!, if more than one file uploads at a time there will be duplicate submissions
          endpoint: "/api/upload",
          formData: true,
          fieldName: "file",
          headers: {
            "REDPATCH-ID": this.uuid,
          },
        });

      this.uppy.on("complete", (event) => {
        if (event.successful[0] !== undefined) {
          this.canMoveOn = true;
        }
      });
    }
  },
};
</script>

<style>
.uppy-Dashboard {
  margin: 0 auto;
  display: inline-block;
  width: 100% !important;
}
</style>