import { createRouter, createWebHistory } from 'vue-router'
import Community from '../views/Community.vue'
import Trends from '../views/Trends.vue'

const routes = [
    { path: '/', component: Trends },
    { path: '/feed', component: Community },
    { path: '/trends', redirect: '/' },
    { path: '/community', redirect: '/feed' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
