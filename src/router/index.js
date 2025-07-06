import { createRouter, createWebHistory } from 'vue-router'
import AuthMain from '../pages/Auth/Main.vue'
import DataManagerMain from '../pages/DataManager/Main.vue'
import DutyMain from '../pages/Duty/Main.vue'
import HomeMain from '../pages/Home/Main.vue'
import WCMain from '../pages/WC/Main.vue'

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
    path: '/data-manager',
    name: 'data-manager',
    component: DataManagerMain,
    children: [
      {
        path: ':pathMatch(.*)*',
        component: DataManagerMain
      }
    ]
  },
  {
    path: '/duty',
    name: 'duty',
      component: DutyMain
  },
    {
        path: '/wc_status',
        name: 'wc_status',
        component: WCMain
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
