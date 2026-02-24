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
    { path: '/community', redirect: '/feed' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
