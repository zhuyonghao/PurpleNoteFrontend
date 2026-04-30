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
    path: '/profile/:id/following',
    name: 'FollowingList',
    component: () => import('@/views/FollowingList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id/followers',
    name: 'FollowersList',
    component: () => import('@/views/FollowersList.vue'),
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
    path: '/content/:id/edit',
    name: 'EditContent',
    component: () => import('@/views/EditContent.vue'),
    meta: {
      requiresAuth: true,
      title: '编辑内容'
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
  // 管理后台路由
  {
    path: '/admin',
    component: () => import('@/views/admin/index.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { requiresAdmin: true }  // 仅 admin
      },
      {
        path: 'contents',
        name: 'AdminContents',
        component: () => import('@/views/admin/ContentManage.vue'),
        meta: { requiresAdmin: true }  // 仅 admin
      },
      {
        path: 'audit',
        name: 'AdminAudit',
        component: () => import('@/views/admin/AuditList.vue'),
        meta: { requiresAuditor: true }  // 仅 auditor
      },
      {
        path: 'content/:id',
        name: 'AdminContentDetail',
        component: () => import('@/views/admin/ContentDetail.vue')
      }
    ]
  },
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

  // 管理后台权限检查
  if (to.meta.requiresAdmin || to.meta.requiresAuditor) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      next('/login')
      return
    }

    if (!userStore.canAccessAdmin) {
      ElMessage.warning('您没有权限访问管理后台')
      next('/home')
      return
    }

    if (to.meta.requiresAdmin && !userStore.isAdmin) {
      ElMessage.warning('此功能仅管理员可用')
      next('/admin/dashboard')
      return
    }

    if (to.meta.requiresAuditor && !userStore.isAuditor) {
      ElMessage.warning('此功能仅审核员可用')
      next('/admin/dashboard')
      return
    }
  }

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