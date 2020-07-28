<template>
  <div>
    <b-navbar type="is-primary">
      <template slot="brand">
        <a href="/" class="navbar-item">
          <p class="heading is-size-6">Redpatch</p>
        </a>
      </template>
      <template slot="start">
        <nuxt-link to="/faq" class="navbar-item">FAQ</nuxt-link>
        <nuxt-link to="/credits" class="navbar-item">Credits</nuxt-link>
      </template>

      <template slot="end">
        <a class="bd-navbar-icon navbar-item has-text-black">
          <b-icon icon="github"></b-icon>
        </a>
      </template>
    </b-navbar>
    <nuxt />
  </div>
</template>