import Vue from "vue";
import VueRouter from "vue-router";
import Start from "../view/start/index";
import Login from "../view/login/index";
import Layout from "../view/layout/index";
import {createMenus, createDefaultVisitedBar, listToTree} from "../utils/app";
import {SYSTEM_CONFIG} from "../config/app.config";
import adminMenuConfig from "../config/admin.menu.config";
import store from "../store";
// import menu from "../store/modules/menu";

import firebase from'firebase/app';
import'firebase/auth';

import firebaseConfig from'../config/firebase.config';
firebase.initializeApp(firebaseConfig);

Vue.use(VueRouter);

/**
 * System routing
 */
const systemRoutes = [
  {
    path: "/",
    name: "start",
    component: Start,
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
        props: {namespace: "/rest/users" },
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
        props: {namespace: "/rest/roles" },
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
        props: {namespace: "/rest/organs" },
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
        props: {namespace: "/rest/menus" },
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
        props: {namespace: "/rest/resources" },
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
        props: {namespace: "/rest/scopes" },
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
        props: {namespace: "/rest/auth" },
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
});



firebase.auth().onIdTokenChanged(user => {
  console.log('onIdTokenChanged', user);
  let idToken = null;
  if (user != null)
    idToken = user.ya;
  store.dispatch("user/setToken", idToken);
});

firebase.auth().onAuthStateChanged(user => {
  console.log('onAuthStateChanged', user)
  if (user == null) {
    store.dispatch("user/setAuthenticated", false);
  } else {
    store.dispatch("user/setAuthenticated", true);
  }
});

router.beforeEach((to, from, next) => {
/* console.log('router.beforeEach', to);
  if (store.state.user.isAuthenticated ||
    SYSTEM_CONFIG.permitUrls.some((i) => i === to.path)) {

    if (store.state.user.isAuthenticated) {
      addRouters();
      next({ ...to, replace: true });
    } else {
      router.replace("/login");
    }

  } else if (to.path =='/login') {
    next();
  } else {
    router.replace("/login");
  }*/

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
    } else if (to.path !='/login') {
      router.replace("/login");
    }
});



// store.state.menu.menus = createMenus(constantRoutes);
const addRouters = () => {
  console.log('adminMenuConfig', adminMenuConfig)
  const menus = adminMenuConfig.menus;
  let menuTree = [];
  listToTree(menus, menuTree, undefined);

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
            props: {namespace: menu.path },
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