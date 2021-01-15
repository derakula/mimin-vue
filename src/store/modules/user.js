import { emailLogin, logout, getCurrentUser } from "../../api/firebase_auth";
import storage from "../../utils/storage";

const state = {
  isAuthenticated: false,
  token: storage.get("token"),
  name: "",
  avatar: "",
  roles: [],
  userOnlineInfo: null,
};

const mutations = {
  SET_AUTHENTICATED: (state, value) => {
    state.isAuthenticated = value;
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
    storage.save("token", token);
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles;
  },
  SET_USER_ONLINE_INFO: (state, userOnlineInfo) => {
    state.userOnlineInfo = userOnlineInfo;
  },
};

const actions = {
  setAuthenticated({ commit }, value) {
    commit("SET_AUTHENTICATED", value);
  },
  setToken({ commit }, idToken) {
    commit("SET_TOKEN", idToken);
  },
  // user login
  emailLogin({ commit }, loginModel) {
    return new Promise((resolve, reject) => {
      emailLogin(loginModel)
        .then((token) => {
          commit("SET_TOKEN", token);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          //Empty all
          commit("SET_TOKEN", null);
          commit("SET_NAME", "");
          commit("SET_AVATAR", "");
          commit("SET_ROLES", []);
          commit("SET_USER_ONLINE_INFO", null);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  //Get current user
  getCurrent({ commit }) {
    return new Promise((resolve, reject) => {
      getCurrentUser()
        .then((user) => {
          commit("SET_NAME", user.name);
          commit("SET_AVATAR", user.picture);
          commit("SET_USER_ONLINE_INFO", user);
          resolve();
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  },
  //Reset the current user information, usually after updating the user information
  resetCurrent({ commit }, userInfo) {
    commit("SET_NAME", userInfo.username);
    commit("SET_AVATAR", userInfo.avatar);
    commit("SET_USER_ONLINE_INFO", userInfo);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
