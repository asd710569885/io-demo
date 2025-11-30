import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/',
      component: () => import('../views/layout/MainLayout.vue'),
      redirect: '/employees/active',
      children: [
        {
          path: 'employees/active',
          name: 'EmployeesActive',
          component: () => import('../views/employees/EmployeeList.vue'),
        },
        {
          path: 'employees/inactive',
          name: 'EmployeesInactive',
          component: () => import('../views/employees/EmployeeList.vue'),
        },
        {
          path: 'employees/add',
          name: 'EmployeeAdd',
          component: () => import('../views/employees/EmployeeAdd.vue'),
        },
        {
          path: 'employees/edit/:id',
          name: 'EmployeeEdit',
          component: () => import('../views/employees/EmployeeEdit.vue'),
        },
        {
          path: 'materials/types',
          name: 'MaterialTypes',
          component: () => import('../views/materials/MaterialTypes.vue'),
        },
        {
          path: 'materials/list',
          name: 'MaterialList',
          component: () => import('../views/materials/MaterialList.vue'),
        },
        {
          path: 'materials/records',
          name: 'MaterialRecords',
          component: () => import('../views/materials/MaterialRecords.vue'),
        },
        {
          path: 'materials/stock',
          name: 'MaterialStock',
          component: () => import('../views/materials/MaterialStock.vue'),
        },
        {
          path: 'logs',
          name: 'Logs',
          component: () => import('../views/Logs.vue'),
        },
        {
          path: 'admin/users',
          name: 'UserManagement',
          component: () => import('../views/admin/UserManagement.vue'),
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.path === '/login') {
    if (userStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
  } else {
    if (!userStore.isAuthenticated) {
      next('/login')
    } else {
      // 检查管理员权限
      if (to.path.startsWith('/admin') && !userStore.canAccessAdmin) {
        next('/')
      } else {
        next()
      }
    }
  }
})

export default router
