import { createRouter, createWebHistory } from 'vue-router'
import AuthMain from '../pages/Auth/Main.vue'
import DataRepairMain from '../pages/DataRepair/Main.vue'
import RepairTask from '../pages/DataRepair/subpages/RepairTask.vue'
import HomeMain from '../pages/Home/Main.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeMain
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthMain
  },
  {
    path: '/data-repair',
    name: 'data-repair',
    component: DataRepairMain,
    children: [
      {
        path: ':category/:taskKey',
        name: 'repair-task',
        component: RepairTask,
        props: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.path !== '/auth' && to.path !== '/') {
    // 这里可以添加登录检查逻辑
    // const isLoggedIn = auth.isLoggedIn();
    // if (!isLoggedIn) {
    //   next('/auth');
    //   return;
    // }
  }
  next();
})

export default router