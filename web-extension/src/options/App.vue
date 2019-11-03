<template>
  <v-app>
    <v-text-field
      :rules="rules"
      :value="url"
      label="GAS API URL: https://script.google.com/macros/s/******"
      @change="onChange"
    ></v-text-field>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { browser } from 'webextension-polyfill-ts'

export default Vue.extend({
  name: 'App',
  data: () => ({
    rules: [
      (value: string) => !!value || 'Required.',
      (value: string) => {
        const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
        return pattern.test(value) || 'Invalid url.'
      }
    ],
    url: ''
  }),
  created: async function() {
    const url = (await browser.storage.local.get('url'))['url'] as
      | string
      | undefined
    if (url === null || url === undefined || url === '') {
      this.url = 'https://example.com'
      await browser.storage.local.set({ url: this.url })
    } else {
      this.url = url
    }
  },
  methods: {
    onChange: async function(e: string) {
      this.url = e
      const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
      if (pattern.test(this.url)) {
        await browser.storage.local.set({ url: this.url })
      }
    }
  }
})
</script>
