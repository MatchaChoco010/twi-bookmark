<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-toolbar-title>
        <span>Twi-Bookmark</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text icon @click="openOptions">
        <v-icon>mdi-settings</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content class="text-center">
      {{ title }}
      <a :href="url">
        <div class="col-12 text-truncate text-left">{{ url }}</div>
      </a>
      <v-spacer></v-spacer>
      <v-overflow-btn
        v-model="category"
        :items="dropdown_categories"
        label="カテゴリ"
      ></v-overflow-btn>
      <v-textarea v-model="comment" hint="コメント"></v-textarea>
      <v-btn :loading="loading" :disabled="category.length <= 0" @click="send"
        >送信</v-btn
      >
    </v-content>

    <v-dialog v-model="dialog" color="error">
      <v-card>
        <h2>Error...</h2>
        {{ error_message }}
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { browser } from 'webextension-polyfill-ts'

export default Vue.extend({
  name: 'App',
  data: () => ({
    dropdown_categories: [
      '雑多',
      '作曲',
      '小説',
      'ゲーム制作',
      'エフェクト',
      'モーショングラフィックス',
      'アニメ作画',
      '画像',
      'gif・映像',
      'お絵かき'
    ],
    title: '',
    url: '',
    category: '',
    comment: '',
    loading: false,
    dialog: false,
    error_message: ''
  }),
  created: async function() {
    const tab = (await browser.tabs.query({
      currentWindow: true,
      active: true
    }))[0]
    if (tab.url === undefined) {
      this.title = 'example.com'
      this.url = 'http://example.com/'
    } else {
      this.title = tab.title as string
      this.url = tab.url
    }
  },
  methods: {
    openOptions: () => browser.runtime.openOptionsPage(),
    send: async function() {
      this.loading = true
      try {
        const apiUrl = (await browser.storage.local.get('url'))['url'] as string
        const body = {
          title: this.title,
          url: this.url,
          category: this.category,
          comment: this.comment
        }
        console.log(body)
        const res = await fetch(apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })
        if (res.status !== 200) throw new Error('Status code is not 200.')
        const resJson = await res.json()
        console.log(resJson)
        if (resJson.status !== 'success') {
          throw new Error(resJson.message)
        }
        this.category = ''
        this.comment = ''
      } catch (e) {
        console.log(e.message)
        this.dialog = true
        this.error_message = e.message
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
