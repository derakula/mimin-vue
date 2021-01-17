import store from '../store'

export default (to, from, next) => {
  if (store.getters.user.user_id !== null) {
    next()
  } else {
    next('/login')
  }
}
