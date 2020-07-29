<template>
  <div class="container">
    <p>//TODO: redpatch-batch-process fails without '--scale_card_side_length'</p>
    <p>//TODO: schedule jobs</p>
    <p>//TODO: generate 2 versions or preview images (1600 and 800)</p>
    <div v-if="showUploader">
      <Upload @oncompletion="onUploadCompletion" :uuid="uuid" />
    </div>
    <div v-if="showPicker">
      <SelectImage :submission="submission" @oncompletion="onPickerCompletion" />
    </div>
    <div v-if="showPreLoading">
      <GeneratingPreviews :submission="submission" @oncompletion="onPreLoadCompleting" />
    </div>
    <div v-if="showSliders">
      <Sliders :submission="submission" @oncompletion="onSlidersCompletion" />
    </div>
    <div v-if="showProcessing">
      <GeneratingProcessed :submission="submission" />
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

import Upload from "~/components/upload";
import SelectImage from "~/components/selectImage";
import Sliders from "~/components/sliders";
import GeneratingPreviews from "~/components/generatingPreviews";
import GeneratingProcessed from "~/components/generatingProcessed";
import Results from "~/components/results";

function processHash(hash) {
  const splitted = hash.split("#");
  if (splitted.length > 1) {
    return splitted[1];
  } else {
    return null;
  }
}

async function _refresh(axios, uuid) {
  const res = await axios.get("/api/status", {
    params: {
      uuid: uuid,
    },
  });
  let showUploader = false;
  let showPicker = false;
  let showSliders = false;
  let showPreLoading = false;
  let showProcessing = false;
  let showResults = false;

  const submission = res.data && res.data.submission;
  if (submission && submission.files) {
    showUploader = false;
    if (submission.files.length === 1 || submission.previewFile) {
      if (submission.preLoaded) {
        if (submission.processingAll) {
          showProcessing = true;
        } else if (submission.processedAll) {
          showResults = true;
        } else {
          showPicker = false;
          showSliders = true;
        }
      } else {
        showPreLoading = true;
      }
    } else {
      showPicker = true;
    }
  } else {
    showUploader = true;
  }

  return {
    uuid: uuid,
    showUploader: showUploader,
    showPicker: showPicker,
    showSliders: showSliders,
    submission: submission,
    showPreLoading: showPreLoading,
    showProcessing: showProcessing,
    showResults: showResults,
  };
}

export default {
  components: {
    Upload,
    SelectImage,
    Sliders,
    GeneratingPreviews,
    GeneratingProcessed,
    Results,
  },
  asyncData({ $axios, route }) {
    //TODO check for hash
    const hash = (route && route.hash && processHash(route.hash)) || uuidv4();
    return _refresh($axios, hash);
  },
  data() {
    return {
      loading: true,
      showUploader: true,
      showPicker: false,
      showSliders: false,
      submission: null,
      showPreLoading: false,
    };
  },
  methods: {
    async refresh() {
      const output = await _refresh(this.$axios, this.uuid);
      //TODO this is pretty hacky, find a better way.
      Object.keys(output).map((key) => {
        this[key] = output[key];
      });
    },
    async onUploadCompletion({ hasScaleCard }) {
      //TODO post upload stuff
      //set submission.previewFile if only one image

      this.$axios
        .post("/api/postUploadStuff", {
          uuid: this.uuid,
          hasScaleCard: hasScaleCard,
        })
        .then(() => {
          history.pushState(
            {},
            null,
            this.$route.path + "#" + encodeURIComponent(this.uuid)
          );
          return this.refresh();
        });
    },
    onPickerCompletion(selected) {
      //TODO notify API of selected image
      return this.$axios
        .post("/api/setselected", {
          submission: this.submission.id,
          file: selected.selected.id,
        })
        .then(() => {
          this.refresh();
        });
    },
    onPreLoadCompleting() {
      return this.refresh();
    },
    onSlidersCompletion() {
      return this.$axios
        .post("/api/setProcessing", {
          submission: this.submission.id,
        })
        .then(() => {
          this.refresh();
        });
    },
  },
};
</script>
