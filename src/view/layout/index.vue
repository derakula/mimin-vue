<template>
  <div class="v-application--wrap">
    <!-- Menu navigation-->
    <navigation :enable-mini="enableMini" />
    <!--Application top navigation bar #344763-->
    <v-app-bar
      app
      dense
      :src="config.appBarBgSrc"
      :color="config.appBarColor"
      class="app-bar"
      elevation="0"
    >
      <v-app-bar-nav-icon small @click.stop="enableMini = !enableMini">
        <v-icon>{{ toggleNavIcon }}</v-icon>
      </v-app-bar-nav-icon>
      <!-- Breadcrumb Navigation -->
      <v-breadcrumbs
        v-if="config.breadcrumb"
        :items="breadCrumbs"
      ></v-breadcrumbs>

      <v-toolbar-title v-if="config.toolbarTitle">
        <v-img
          v-if="config.systemImageSrc"
          height="20"
          width="98"
          :src="config.systemImageSrc"
        />
        <div class="system-title" v-if="config.systemTitle">
          {{ config.systemTitle }}
        </div>
      </v-toolbar-title>

      <v-spacer />

      <!-- Here starts on the right side -->

      <!-- Avatar list, operation -->
      <v-menu bottom offset-y rounded="0" origin="bottom">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mr-1" small icon v-bind="attrs" v-on="on">
            <v-avatar
              color="#b9cdef"
              size="32"
            >
              <img v-if="userAvatar" :src="userAvatar" alt="" />
            </v-avatar>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="(operation, index) in actions"
            :key="index"
            @click="doAction(operation)"
          >
            <v-list-item-title>{{
              operation.text || operation.action
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <template v-slot:extension>
        <visited-bar />
      </template>
    </v-app-bar>

    <!--Integral container-->

    <v-main class="main-content">
      <v-container fluid class="height-100pc">
        <transition name="slide-left" appear>
          <router-view class="main-router-view" :key="routerKey" />
        </transition>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import Navigation from "./components/Navigation";
import VisitedBar from "./components/VisitedBar";
import { SYSTEM_CONFIG as config } from "../../config/app.config";
import { createBreadCrumbs } from "@/utils/app";

export default {
  name: "Layout",
  components: {
    Navigation,
    VisitedBar,
  },
  data: () => ({
    config,
    enableMini: true,
    enableSearch: false,
    actions: [
      {
        text: "My Account",
        action: "/usercenter",
      },
      {
        text: "Logout",
        action: "logout",
        method: true,
      },
    ],
  }),
  mounted() {
    if (this.currentUser.name) {
      this.$toast.info(`Welcome back, ${this.currentUser.name}`, {
        icon: {
          iconClass: "v-icon notranslate mdi mdi-emoticon-kiss-outline",
        },
      });
    }
  },
  computed: {
    toggleNavIcon() {
      return this.enableMini
        ? "mdi-format-indent-increase"
        : "mdi-format-indent-decrease";
    },
    currentUser() {
      return this.$store.getters.user;
    },
    routerKey() {
      return this.$route.meta.id;
    },
    breadCrumbs() {
      return createBreadCrumbs(this.$route);
    },
    userAvatar() {
      const userInfo = this.$store.getters.user;
      return userInfo.picture;
    },
  },
  methods: {
    doAction(operation) {
      if (operation.method) {
        this[operation.action]();
      } else {
        this.$router.push(operation.action);
      }
    },
    logout() {
      this.$store
        .dispatch("logout")
        .then(() => {
          this.$router.push("/login");
        })
        .catch((err) => {
          this.$toast.error(err.message, {
            position: "top-right",
          });
        });
    },
  },
};
</script>
<style scoped>
.app-bar {
  height: auto !important;
  z-index: 999 !important;
}

.app-bar >>> .v-toolbar__extension {
  padding: 0 !important;
  height: 36px !important;
}

.main-content {
  background-color: #f0f2f5;
  padding-top: 86px !important;
}

.system-title {
  color: #000;
  font-weight: bold;
}

.app-bar >>> .v-breadcrumbs__item--disabled {
  color: rgba(0, 0, 0, 0.87) !important;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.5s, transform 0.5s;
  top: 0;
  width: 100%;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
}

.slide-right-enter /* .fade-leave-active in below version 2.1.8 */ {
  opacity: 0;
  top: 0;
  transform: translateX(100%);
}

.slide-right-leave-to /* .fade-leave-active in below version 2.1.8 */ {
  opacity: 0;
  top: 0;
  transform: translateX(-100%);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: opacity 0.5s, transform 0.5s;
  top: 0;
  width: 100%;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
}

.slide-left-enter /* .fade-leave-active in below version 2.1.8 */ {
  opacity: 0;
  top: 0;
  transform: translateX(-100%);
}

.slide-left-leave-to /* .fade-leave-active in below version 2.1.8 */ {
  display: none;
  opacity: 0;
  top: 0;
  transform: translateX(100%);
}
</style>