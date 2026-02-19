import { createRouter, createWebHashHistory } from 'vue-router'
import Portfolio from '../views/Portfolio.vue'

const routes = [
    { path: '/', component: Portfolio },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
