import { createRouter, createWebHistory } from 'vue-router'
import Portfolio from '../views/Portfolio.vue'
import Community from '../views/Community.vue'
import Trends from '../views/Trends.vue'

const routes = [
    { path: '/', component: Trends },
    { path: '/community', component: Community },
    { path: '/trends', redirect: '/' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
