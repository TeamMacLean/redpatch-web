<template>
  <b-notification :closable="false">
    Please wait while we generate the previews.
    If the images are very large this can take a while.
    If you don’t want to wait, you can access this page and keep your progress using this link
    "TODO"

    <b-loading :is-full-page="true" :active="true" :can-cancel="false"></b-loading>
  </b-notification>
</template>