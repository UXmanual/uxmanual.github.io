import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import Feed from '../views/Feed.vue'
import Trends from '../views/Trends.vue'

const routes = [
    {
        path: '/',
        component: Trends,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
            // Robust fallback: if p query exists, jump to it directly
            if (to.query.p) {
                const target = to.query.p as string;
                next({ path: target, query: {}, replace: true });
            } else {
                next();
            }
        }
    },
    { path: '/feed', component: Feed },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0, left: 0 }
        }
    },
})

export default router
