import { createRouter, createWebHistory } from 'vue-router'
import Portfolio from '../views/Portfolio.vue'

const routes = [
    { path: '/', component: Portfolio },
    { path: '/portfolio', redirect: '/' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
