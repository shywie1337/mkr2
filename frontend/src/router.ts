import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'registry', component: () => import('./views/RegistryView.vue') },
    { path: '/substations/new', name: 'station-new', component: () => import('./views/StationFormView.vue') },
    { path: '/substations/:id/edit', name: 'station-edit', component: () => import('./views/StationFormView.vue') },
    { path: '/substations/:id', name: 'station', component: () => import('./views/StationView.vue') },
    { path: '/analytics', name: 'analytics', component: () => import('./views/AnalyticsView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue') },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return to.path === from.path ? false : { top: 0 }
  },
})
