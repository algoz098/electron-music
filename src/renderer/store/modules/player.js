import { ipcRenderer } from 'electron'

const state = {
  list: [],
  config: {
    youtube_key: '',
    youtube_show_player: false
  }
}

const mutations = {
  SET_LIB (state, data) {
    state.list = data
  },

  SET_CONFIG (state, data) {
    state.config = data
  }
}

const actions = {
  async IMPORT ({commit, state}) {
    var importando = ipcRenderer.sendSync('dialog', '')

    var resposta = state.list.slice(0)

    for (var i = 0; i < importando.length; i++) {
      var file = importando[i]

      file = ipcRenderer.sendSync('metadata', file)

      var includes = window._.map(resposta, 'path')

      if (!window._.includes(includes, file.path)) {
        resposta.push({type: 'local',data: file})
      }
    }
    commit('SET_LIB', resposta)

    var config = new window.Config()
    config.set('lib', resposta)
  },

  async ADD ({commit, state}, data) {
    var resposta = state.list.slice(0)

    resposta.push(data)

    commit('SET_LIB', resposta)

    var config = new window.Config()
    config.set('lib', resposta)
  },

  async LOAD_LIB ({commit, state}) {
    var config = new window.Config()
    var lib = config.get('lib')

    if (lib.length) {
      commit('SET_LIB', lib)
    }
  },

  async LOAD_CONFIG ({commit, state}) {
    var config = new window.Config()
    var configs = config.get('config')

    if (configs) {
      commit('SET_CONFIG', configs)
    }
  },

  async CONFIG ({commit, state}, data) {
    var actualConfig = {}

    Object.assign(actualConfig, state.config)

    actualConfig[data.type] = data.value

    var config = new window.Config()
    config.set('config', actualConfig)

    commit('SET_CONFIG', actualConfig)

    if(data.type == 'youtube_key'){
      window.youtube = new window.YouTube(data.value);
    }
  },

  async REMOVE ({commit, state}, data) {
    var resposta = state.list.slice(0)
    window._.pullAt(resposta, data)

    commit('SET_LIB', resposta)

    var config = new window.Config()
    config.set('lib', resposta)
  },

}

export default {
  state,
  mutations,
  actions
}
