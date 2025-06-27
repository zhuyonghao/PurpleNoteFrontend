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
    path: '/hot',
    name: 'Hot',
    component: () => import('@/views/Hot.vue'),
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
    path: '/profile/edit',
    name: 'EditProfile',
    component: () => import('@/views/EditProfile.vue'),
    meta: {
      requiresAuth: true,
      title: '编辑资料'
    }
  },
  {
    path: '/content/:id',
    name: 'ContentDetail',
    component: () => import('@/views/ContentDetail.vue'),
    meta: { requiresAuth: true }
  },
  // 临时注释掉搜索路由，直到Search.vue文件创建完成
  // {
  //   path: '/search',
  //   name: 'Search',
  //   component: () => import('@/views/Search.vue'),
  //   meta: { requiresAuth: true }
  // },
  // 404页面路由 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { layout: 'blank' }
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
  const requiresAuth = ['Home', 'Profile', 'Publish', 'ContentDetail', 'Search']
  
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