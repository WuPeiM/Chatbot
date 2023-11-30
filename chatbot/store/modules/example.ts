// initial state
const state = {
    selectedItem: null
}

// getters
const getters = {
    //
}

// mutations
const mutations = {
    setList(state, newData) {
        state.list = newData
    }
}

// actions
const actions = {
    updateList({ commit }, newData) {
        commit('setList', newData)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
