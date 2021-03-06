import firebase from 'firebase/app';
import 'firebase/auth';

const defaultUser = {
  user_id: null,
  picture: null,
  name: null,
  email_verified: null,
  is_logged_in: false
};

export default {
  state: {
    user: defaultUser
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload
    }
  },
  actions: {
    signUserUp({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          _user => {
            commit('setLoading', false)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserIn({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(_user => {
          commit('setLoading', false)
        }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserInGoogle({ commit }) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(
          _user => {
            commit('setLoading', false)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserInFacebook({ commit }) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then(
          _user => {
            commit('setLoading', false)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserInGithub({ commit }) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider())
        .then(
          _user => {
            commit('setLoading', false)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserInTwitter({ commit }) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithPopup(new firebase.auth.TwitterAuthProvider())
        .then(
          _user => {
            commit('setLoading', false)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    autoSignIn({ commit }, payload) {
      console.log('payload', payload);
      console.log('this.state.user', this.getters.user);
      commit('setUser', { ...this.getters.user, ...payload })
    },
    resetPasswordWithEmail({ commit }, payload) {
      const { email } = payload
      commit('setLoading', true)
      firebase.auth().sendPasswordResetEmail(email)
        .then(
          () => {
            commit('setLoading', false)
            console.log('Email Sent')
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    async logout({ commit }) {
      return firebase.auth().signOut().then(() => {
        commit('setUser', defaultUser);
      }).catch(error => {
        console.log(error)
      })
    }
  },
  getters: {
    user(state) {
      return state.user
    }
  }
}
