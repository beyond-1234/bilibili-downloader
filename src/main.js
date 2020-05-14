import Vue from 'vue'
import App from './App.vue'
import bulma from 'bulma'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlay, faPause, faBan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// import VueRouter from 'vue-router'
// import routers from './routers'
// import axios from 'axios'

Vue.config.productionTip = false

Vue.use(bulma)


library.add(faPlay, faPause, faBan)
Vue.component('font-awesome-icon', FontAwesomeIcon)


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
