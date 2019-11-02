module.exports = {
  pages: {
    options: {
      entry: 'src/options/main.ts',
      template: 'public/options.html',
      filename: 'options.html'
    },
    popup: {
      entry: 'src/popup/main.ts',
      template: 'public/popup.html',
      filename: 'popup.html'
    }
  },
  transpileDependencies: ['vuetify']
}
