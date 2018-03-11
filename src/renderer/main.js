import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import VueYouTubeEmbed from 'vue-youtube-embed'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

window.YouTube = require('simple-youtube-api');
window._ = require('lodash');

window.Config = require('electron-config')
var config = new window.Config()
window.youtube = new YouTube(config.get('config').youtube_key);

var config = new window.Config()
var remote = config.get('remote')

Vue.use(VueYouTubeEmbed)
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  mounted () {
    this.load_configuration()
  },
  methods: {
    load_configuration () {
      this.$store.dispatch('LOAD_LIB')
      this.$store.dispatch('LOAD_CONFIG')
    }
  },
  template: '<App/>',
}).$mount('#app')
