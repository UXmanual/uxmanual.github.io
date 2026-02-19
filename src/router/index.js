import { createRouter, createWebHashHistory } from 'vue-router'
import Portfolio from '../views/Portfolio.vue'

const routes = [
    { path: '/', component: Portfolio },
    { path: '/portfolio', redirect: '/' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
