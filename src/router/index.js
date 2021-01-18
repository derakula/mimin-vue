import Vue from "vue";
import VueRouter from "vue-router";
import { createMenus, createDefaultVisitedBar, listToTree } from "../utils/app";
import { SYSTEM_CONFIG } from "../config/app.config";
import adminMenuConfig from "../config/admin.menu.config";
import store from "../store";
// import menu from "../store/modules/menu";

import AuthGuard from "./auth-guard";

Vue.use(VueRouter);

const Start = () => import('./../view/start/index');
const Login = () => import('./../view/login/index');
const Layout = () => import('./../view/layout/index');

/**
 * System routing
 */
const systemRoutes = [
  {
    path: "/",
    name: "start",
    component: Start,
    beforeEnter: AuthGuard
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/",
    name: "layout",
    component: Layout,
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/view/dashboard/home/index.vue"),
        meta: {
          text: "Home",
          defaultVisited: true,
        },
      },
    ],
  },
  {
    path: "/",
    name: "userlayout",
    component: Layout,
    children: [
      {
        path: "/usercenter",
        name: "usercenter",
        component: () => import("@/view/user/index.vue"),
        meta: {
          text: "My Account",
        },
      },
    ],
  },
];

/**
 * Static menu routing
 */
export const constantRoutes = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/users",
        name: "users",
        component: () => import("../components/CrudTable.vue"),
        props: { namespace: "/rest/users" },
        meta: {
          text: "User Management",
          icon: "mdi-account",
        },
      },
    ],
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/roles",
        name: "roles",
        component: () => import("../components/CrudTable.vue"),
        props: { namespace: "/rest/roles" },
        meta: {
          text: "Role Management",
          icon: "mdi-account-cowboy-hat",
        },
      },
    ],
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/organs",
        name: "organs",
        component: () => import("../components/CrudTree.vue"),
        props: { namespace: "/rest/organs" },
        meta: {
          text: "Organization Management",
          icon: "mdi-file-tree-outline",
        },
      },
    ],
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/menus",
        name: "menus",
        component: () => import("../components/CrudTree.vue"),
        props: { namespace: "/rest/menus" },
        meta: {
          text: "Menu Management",
          icon: "mdi-microsoft-xbox-controller-menu",
        },
      },
    ],
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/resources",
        name: "resources",
        component: () => import("../components/CrudTable.vue"),
        props: { namespace: "/rest/resources" },
        meta: {
          text: "Resource Management",
          icon: "mdi-semantic-web",
        },
      },
    ],
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/scopes",
        name: "scopes",
        component: () => import("../view/system/DataScopes.vue"),
        props: { namespace: "/rest/scopes" },
        meta: {
          text: "Data Range Management",
          icon: "mdi-account-arrow-left",
        },
      },
    ],
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/auth",
        name: "auth",
        component: () => import("../view/system/Authority.vue"),
        props: { namespace: "/rest/auth" },
        meta: {
          text: "Permission Management",
          icon: "mdi-shield-account-outline",
        },
      },
    ],
  },
];

const router = new VueRouter({
  routes: [...systemRoutes],
  mode: 'history'
});


store.state.menu.menus = createMenus(constantRoutes);
store.state.menu.inited = true;

/*
router.beforeEach((to, from, next) => {
  if (
    store.state.user.token ||
    SYSTEM_CONFIG.permitUrls.some((i) => i === to.path)
  ) {
    if (store.state.user.token && !store.state.user.userOnlineInfo) {
      store
        .dispatch("user/getCurrent").then(() => {
          addRouters();
          next({ ...to, replace: true });
        })
        .catch(() => {
          router.replace("/login");
        });
    } else {
      // addRouters();
      next();
    }
  } else if (to.path != '/login') {
    router.replace("/login");
  }
});
*/
/*
router.beforeEach((to, from, next) => {
  addRouters();
});
*/
// store.state.menu.menus = createMenus(constantRoutes);

const addRouters = () => {
  console.log('adminMenuConfig', adminMenuConfig)
  const menus = adminMenuConfig.menus;

  const routers = menus
    .filter((menu) => menu.path)
    .map((menu) => {
      const parent = menus.filter(
        (menuItem) => menuItem.resourceId === menu.parentId
      )[0];
      return {
        path: "/",
        component: Layout,
        children: [
          {
            path: menu.path || "",
            name: menu.resourceName,
            component: loadComponent(menu.component),
            props: { namespace: menu.path },
            meta: {
              id: menu.resourceId,
              parentId: menu.parentId,
              text: menu.resourceName,
              icon: menu.icon,
              parent,
            },
          },
        ],
      };
    });

  router.addRoutes(routers);

  let menuTree = [];
  listToTree(menus, menuTree, undefined);
  if (menuTree.length === 0) {
    menuTree = menus;
  }
  store.state.menu.menus = createMenus(menuTree);
  store.state.menu.inited = true;
};


const loadComponent = (component) => {
  return (resolve) => require([`@/${component}`], resolve);
};

store.state.visited.visitedItems = createDefaultVisitedBar(systemRoutes);
export default router;