import { createRouter, createWebHistory } from 'vue-router'
import Feed from '../views/Feed.vue'
import Trends from '../views/Trends.vue'

const routes = [
    { path: '/', component: Trends },
    { path: '/feed', component: Feed },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
