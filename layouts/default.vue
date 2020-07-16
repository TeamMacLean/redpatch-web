<template>
  <div>
    <b-navbar>
      <template slot="brand">
        <b-navbar-item href="/">
          <p class="heading is-size-6 has-text-primary">Redpatch</p>
        </b-navbar-item>
      </template>
      <!-- <template slot="start"> -->
      <!-- <b-navbar-item href="#">Documentation</b-navbar-item> -->
      <!-- </template> -->

      <template slot="end">
        <a class="bd-navbar-icon navbar-item has-text-black">
          <b-icon icon="github"></b-icon>
        </a>
      </template>
    </b-navbar>
    <nuxt />
  </div>
</template>