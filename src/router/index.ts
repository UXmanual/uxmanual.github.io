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
        return new Promise((resolve) => {
            // Delay the scroll to top until the 'fade-out' transition in App.vue completes (300ms)
            // This prevents the user from seeing the old page content flying up before switching.
            setTimeout(() => {
                if (savedPosition) {
                    resolve(savedPosition)
                } else {
                    resolve({ top: 0, left: 0 })
                }
            }, 300)
        })
    },
})

export default router
