import Vue from 'vue'
import App from './App.vue'
import bulma from 'bulma'
// import VueRouter from 'vue-router'
// import routers from './routers'
// import axios from 'axios'

Vue.config.productionTip = false

Vue.use(bulma)
// Vue.use(VueRouter)
// Vue.prototype.$axios = axios

// const router = new VueRouter(
//   {
//     mode:'history',
//     routes:routers
//   }
// )

new Vue({
  render: h => h(App),
}).$mount('#app')
