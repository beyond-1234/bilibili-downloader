import Vue from 'vue'
import App from './App.vue'
import bulma from 'bulma'
// import axios from 'axios'

Vue.config.productionTip = false

Vue.use(bulma)
// Vue.prototype.$axios = axios

new Vue({
  render: h => h(App),
}).$mount('#app')
