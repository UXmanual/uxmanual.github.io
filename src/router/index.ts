import { createRouter, createWebHistory } from 'vue-router'
import Portfolio from '../views/Portfolio.vue'
import Community from '../views/Community.vue'

const routes = [
    { path: '/', component: Portfolio },
    { path: '/community', component: Community },
    { path: '/portfolio', redirect: '/' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
