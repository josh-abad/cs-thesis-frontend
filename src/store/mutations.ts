import { MutationTree } from 'vuex'
import * as MutationTypes from './mutation-types'
import { State, Mutations } from '@/store/interfaces'

export default {
  [MutationTypes.SET_USER](state, user) {
    state.user = user
  },
  [MutationTypes.SET_VERIFIED](state, userId) {
    if (state.user && state.user.id === userId) {
      state.user.verified = true
    }
  }
} as MutationTree<State> & Mutations
