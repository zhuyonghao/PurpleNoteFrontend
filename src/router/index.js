import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true, layout: 'blank' }
  },
  {
    path: '/register', 
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresGuest: true, layout: 'blank' }
  },
  {
    path: '/home',
    name: 'Home', 
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('@/views/Publish.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id?',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/content/:id',
    name: 'ContentDetail',
    component: () => import('@/views/ContentDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 需要登录的页面
  const requiresAuth = ['Home', 'Profile', 'Publish', 'ContentDetail']
  
  if (requiresAuth.includes(to.name) && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next('/login')
  } else if ((to.name === 'Login' || to.name === 'Register') && userStore.isLoggedIn) {
    next('/home')
  } else {
    next()
  }
})

export default router