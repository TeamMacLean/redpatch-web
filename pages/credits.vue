<template>
  <div class="section">
    <div class="container">
      <h1 class="title">Credits</h1>
      <br />
      <div class="content">
        <p class="title is-4">HSV segmentation process</p>
        <p>Ciaran Griffin and George Littlejohn, University of Plymouth</p>
      </div>
      <br />
      <div class="content">
        <p class="title is-4">Redpatch web tool and python package</p>
        <p>Dan MacLean and Martin Page, The Sainsbury Laboratory</p>
      </div>
      <br />
      <div class="content">
        <p class="title is-4">Citing redpatch</p>
        <p>
          Remember that bioinformatics software and pipelines should be cited like any other piece of research. To fulfill your moral and professional obligation in this regard please cite: <CiteBadge/>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import CiteBadge from "~/components/_cite_badge";
export default {
  components: {CiteBadge},
};
</script>