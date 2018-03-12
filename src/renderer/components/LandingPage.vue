<template>
  <div>
    <div class="columns is-gapless is-marginless is-fixed" style="top: 0px">
      <div class="column">
        <div class="buttons has-addons">

            <div class="field has-addons" style="width: 100%">
              <button class="button is-large" @click="list_local_add">
                <span class="icon is-small" >
                  <font-awesome-icon icon="plus"/>
                </span>
              </button>

              <button class="button is-large" @click="prev_music">
                <span class="icon is-small" >
                  <font-awesome-icon icon="fast-backward"/>
                </span>
              </button>

              <button class="button is-large" @click="change_state">
                <span class="icon is-small" >
                  <font-awesome-icon icon="pause"  v-if="status=='1'"/>
                  <font-awesome-icon icon="play"  v-else/>
                </span>
              </button>

              <button class="button is-large" @click="next_music">
                <span class="icon is-small" >
                  <font-awesome-icon icon="fast-forward" />
                </span>
              </button>

              <button class="button is-large" :class="{'is-info': redoActive}" @click="redoActive=!redoActive">
                <span class="icon is-small" >
                  <font-awesome-icon icon="redo" />
                </span>
              </button>

              <button class="button is-large" :class="{'is-info': randomActive}" @click="randomActive=!randomActive">
                <span class="icon is-small" >
                  <font-awesome-icon icon="random" />
                </span>
              </button>

              <button class="button is-large" :class="{'is-info': volumeControls}">
                <span class="icon is-small" @click="volumeControls=!volumeControls">
                  <font-awesome-icon icon="volume-up"  v-if="volume"/>
                  <font-awesome-layers class="fa-lg" v-else>
                    <font-awesome-icon icon="ban" />
                    <font-awesome-icon icon="volume-off" />
                  </font-awesome-layers>
                </span>
              </button>

              <p class="control"  v-if="volumeControls">
                <a class="button is-static  is-large">
                  {{volume}}%
                </a>
              </p>
              <div class="control" style="width: 100%"  v-if="volumeControls">
                <input class="input  is-large" type="range" min="0" max="100" step="5" :value="volume" @input="input_volume($event.target.value)">
              </div>

              <p class="control  is-large"  v-if="!volumeControls">
                <a class="button is-static  is-large">
                  {{time_actual}}/{{time_max}}
                </a>
              </p>
              <div class="control" style="width: 100%"  v-if="!volumeControls">
                <input class="input  is-large" type="range" min="0" :max="time_max" step="0.01" :value="time_actual" @input="input_time($event.target.value)">
              </div>
            </div>
          </div>

        </div>
    </div>

    <div class="columns is-gapless">
      <div class="column ">

        <nav ref="playlistPanel" class="panel is-fixed" style="top: 54px">
          <p class="panel-heading">
            Playlist
          </p>
          <div class="panel-block">
            <p class="control has-icons-left">
              <input class="input is-small" type="text" v-model="search" @input="yt_pre_search">

              <span class="icon is-small is-left">
                <font-awesome-icon icon="search" />
              </span>
            </p>
          </div>

          <p class="panel-tabs">
            <a :class="{'is-active': tabActive=='list'}" @click="tabActive='list'">
              <span class="icon is-small is-left">
                <font-awesome-icon icon="list" />
              </span>
            </a>
            <a :class="{'is-active': tabActive=='trashing'}" @click="tabActive='trashing'">
              <span class="icon is-small is-left">
                <font-awesome-icon icon="trash" />
              </span>
            </a>
            <a :class="{'is-active': tabActive=='configuration'}" @click="tabActive='configuration'">
              <span class="icon is-small is-left">
                <font-awesome-icon icon="cogs" />
              </span>
            </a>
          </p>

          <span v-if="tabActive=='configuration'">
            <div class="panel-block" >
              <div class="field">
                <label class="label">Youtube APP Key</label>
                <p class="control has-icons-left">
                  <input class="input is-small" type="text" :value="config.youtube_key" @change="$store.dispatch('CONFIG', {'type':'youtube_key', 'value':$event.target.value})">

                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="key" />
                  </span>
                </p>

                <p class="help">To use it you will need to create a Youtube api key. It sucks! Link: https://developers.google.com/youtube/v3/getting-started</p>
              </div>
            </div>

            <label class="panel-block">
              <input type="checkbox" :value="true" @change="$store.dispatch('CONFIG', {'type':'youtube_show_player', 'value':!config.youtube_show_player})" :checked="config.youtube_show_player">
              Show YT player
            </label>
          </span>

          <div class="panel-block" @click="remove_trashed" v-if="tabActive=='trashing'">
            <button class="button is-link is-outlined is-fullwidth">
              Remove selected
            </button>
          </div>

          <a class="panel-block" :class="{'is-background-warning': is_trashed(index)}" v-for="(item, index) in listFiltered" @click="trash_this(index)" v-if="tabActive=='trashing'">
            <span class="panel-icon">
              <font-awesome-icon icon="ban" v-if="is_trashed(index)"/>
              <font-awesome-icon icon="trash" v-else/>
            </span>
            <span class="tag is-info">{{item.type}}</span>
            &nbsp;
            {{item.data.title}}
          </a>

          <a class="panel-block" v-for="item in listFiltered" @click="play_this(item)" v-if="tabActive=='list'">
            <span class="panel-icon">
              <font-awesome-icon icon="play" v-if="is_playing(item)" />
              <font-awesome-icon icon="pause" v-else />
            </span>
            <span class="tag is-info">{{item.type}}</span>
            &nbsp;
            {{item.data.title}}
          </a>

          <div class="panel-block">
            By Artur Sena!
            &nbsp;
            <font-awesome-icon icon="thumbs-up" />
          </div>
        </nav>

      </div>
      <div class="column is-10" style="top: 52px;">

        <article class="message is-info">
          <div class="message-header">
            <p>Welcome</p>
            <button class="delete" aria-label="delete"></button>
          </div>
          <div class="message-body">
            This is "Electron Music", where you can play some music locally, or, from youtube and save it. But. You will need a API Key, and is tricky to get one.<br>

            As this is a work in progress, access the git to suggest things, or to help.<br>

            This is just a hobby, and you can use this code for whatever you want, just give me some credit. Thanks!
          </div>
        </article>

        <youtube :video-id="yt.id" @ready="yt_ready" @ended="yt_ended" :player-vars="{ autoplay: 1 }" v-show="config.youtube_show_player" player-width="100%"></youtube>

        <article class="media" v-for="result in yt.searchResults">
          <figure class="media-left">
            <p class="image" :class="'is-3x4'" @click="yt.id=result.id">
              <img :src="result.thumbnails.medium.url" style="width: 128px; height: 72px;">
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <strong @click="yt.id=result.id">{{result.title}}</strong> <small>{{result.channel.title}}</small>
                <br>
                {{result.description}}
              </p>
            </div>
            <nav class="level is-mobile">
              <div class="level-left">
                <a class="level-item" @click="yt.id=result.id">
                  <span class="icon is-small">
                    <font-awesome-icon icon="play" />
                  </span>
                </a>
                <a class="level-item" @click="list_add('YT', result)">
                  <span class="icon is-small">
                    <font-awesome-icon icon="list-ol" />
                  </span>
                </a>
              </div>
            </nav>
          </div>
        </article>

      </div>
    </div>

    <audio ref="audioLocal" @play="local_status" @pause="local_status" @timeupdate="local_time" controls v-show="false">
      <source :src="local.src" type="audio/mpeg" v-if="local.src">
    </audio>

  </div>
</template>
<script>
const _ = require('lodash');
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import fontawesome from '@fortawesome/fontawesome'
import solids from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(solids)
import { ipcRenderer } from 'electron'

  export default {
    components: {
      FontAwesomeIcon, FontAwesomeLayers
    },
    data () {
      return {
        search: '',
        tabActive: 'list',
        volumeControls: false,
        redoActive: false,
        randomActive: false,
        type_playing: null,
        trashed: [],
        yt: {
          player: null,
          id: null,
          time: 0,
          volume: 0,
          duration: 0,
          searchResults: null,
          status: null,
          playing: null,
        },
        local:{
          src: null,
          status: null,
          playing: null,
          volume: 0,
          time: 0,
          duration: 0,
        }
      }
    },
    mounted(){
      this.resize_panel()
      var self = this
      window.addEventListener('resize', function(e){
        self.resize_panel()
      })
    },
    beforeDestroy: function () {
      document.removeEventListener('resize', this.resize_panel())
    },
    methods: {
      test (a) {
        console.log(a)
      },

      open_external(link) {
        // sh.openExternal(link)
      },

      resize_panel(){
        var height = window.innerHeight - 54
        height = height + 'px'
        this.$refs.playlistPanel.style.maxHeight = height
      },

      remove_trashed() {
        this.$store.dispatch("REMOVE", this.trashed)
        this.trashed = []
      },

      trash_this(index){
        if(!_.includes(this.trashed, index)){
          this.trashed.push(index)
        } else {
          this.trashed.splice(index, 1)
        }
      },

      is_trashed(index){
        var result = _.includes(this.trashed, index)
        return result
      },

      pause(){
        this.$refs.audioLocal.pause()
        this.yt.player.pauseVideo()
      },

      play_this(item){
        this.pause()
        this.type_playing = item.type

        if(item.type=='YT'){
          this.yt.id = item.data.id
        } else {
          this.local.src = 'file://' + item.data.path
          this.local.playing = item.data
          this.$refs.audioLocal.load(this.local.src)
          this.$refs.audioLocal.play()
        }

      },

      local_time(){
        if(this.$refs.audioLocal.duration!=='NaN'){
          this.local.duration = this.$refs.audioLocal.duration
        }
        this.local.time = this.$refs.audioLocal.currentTime
      },

      local_status(){
        this.local.volume = this.$refs.audioLocal.volume * 100
        if (this.$refs.audioLocal.paused){
          this.local.status = '2'
        } else {
          this.local.status = '1'
        }
      },

      list_local_add(){
        this.$store.dispatch('IMPORT')
      },

      list_add(type, obj){
        this.$store.dispatch('ADD', {
          type: type,
          data: obj
        })
      },

      prev_music(){
        if (this.playing_type == 'YT'){
          var playing = this.yt.playing
          var index = _.findIndex(this.list, function(o) { return o.data.id == playing.video_id; });
        } else {
          var playing = this.local.playing
          var index = _.findIndex(this.list, function(o) { return o.data.path == playing.path; });
        }

        if(this.list[index - 1]){
          this.play_this(this.list[index - 1])
        } else {
          this.play_this(this.list[this.list.length-1])
        }
      },

      next_music(){
        if(this.randomActive){
          var index = _.random(0, this.list.length-1)
        } else if (this.type_playing == 'YT'){
          var playing = this.yt.playing
          var index = _.findIndex(this.list, function(o) { return o.data.id == playing.video_id; });
        } else {
          var playing = this.local.playing
          var index = _.findIndex(this.list, function(o) { return o.data.path == playing.path; });
        }

        if(this.list[index + 1]){
          this.play_this(this.list[index + 1])
        } else {
          this.play_this(this.list[0])
        }
      },

      yt_ended(){
        if(this.redoActive){
          this.yt.player.seekTo(0)
        } else {
          this.next_music()
        }
      },

      is_playing(item){
        if(item.type=="yt"){
          if (this.yt.playing.video_id == item.data.id) {
            return true
          }
        } else {
          if (this.local.src == 'file://' + item.data.path) {
            return true
          }
        }
        return false
      },

      change_state(){
        if(this.type_playing=='YT'){
          if(this.yt.status==2) {
            this.yt.player.playVideo()
          } else {
            this.yt.player.pauseVideo()
          }
        } else {
          if(this.$refs.audioLocal.paused){
            this.$refs.audioLocal.play()
          } else {
            this.$refs.audioLocal.pause()
          }
        }
      },

      input_volume(e){
        if (this.type_playing == 'YT') {
          this.yt.player.setVolume(e)
        } else {
          this.$refs.audioLocal.volume = e / 100
          this.local.volume = e
        }
      },

      input_time (e) {
        this.yt.player.seekTo(e)
      },

      yt_pre_search (e){
        this.yt_search(e.target.value, this)
      },

      yt_search: _.debounce((e, self) => {
        youtube.searchVideos(e, 30)
          .then(results => {
              self.yt.searchResults = results
          })
      }, 300),

      yt_ready (player) {
        this.yt.player = player
        this.yt.player.playVideo()

        var self = this
        setInterval(function () {
          self.yt.time = self.yt.player.getCurrentTime()
          self.yt.volume = self.yt.player.getVolume()
          self.yt.status = self.yt.player.getPlayerState()
          self.yt.duration = self.yt.player.getDuration()
          self.yt.playing = self.yt.player.getVideoData()
        }, 100)
      },

      yt_playing (player) {
      }
    },
    computed: {
      listFiltered(){
        return this.list.filter(item => {
          return item.data.title.toLowerCase().includes(this.search.toLowerCase())
        })
      },

      list () {
        return this.$store.state.player.list
      },

      status() {
        if(this.type_playing == 'YT'){
          if (this.yt.player) {
            return this.yt.status
          }
        } else {
          return this.local.status
        }

        return false
      },

      volume() {
        if (this.type_playing == 'YT' && this.yt.volume) {
          var vol = this.yt.volume
          return vol
        } else if(this.$refs.audioLocal){
          var vol = this.local.volume
          return vol
        }

        return 0
      },

      time_max(){
        if (this.type_playing == 'YT' && this.yt.player) {
          var time = this.yt.duration.toFixed(0)
          var minutes = Math.floor(time / 60)
          var seconds = time % 60;
          seconds =  ("0" + seconds).slice(-2);
          return minutes + ':' + seconds;
        } else {
          var time = this.local.duration.toFixed(0)
          var minutes = Math.floor(time / 60)
          var seconds = time % 60;
          seconds =  ("0" + seconds).slice(-2);
          return minutes + ':' + seconds;
        }
        return 0;
      },

      time_actual() {
        if (this.type_playing == 'YT' && this.yt.time) {
          var time = this.yt.time.toFixed(0)
          var minutes = Math.floor(time / 60)
          var seconds = time % 60;
          seconds =  ("0" + seconds).slice(-2);
          return minutes + ':' + seconds;
        } else {
          var time = this.local.time.toFixed(0)
          var minutes = Math.floor(time / 60)
          var seconds = time % 60;
          seconds =  ("0" + seconds).slice(-2);
          return minutes + ':' + seconds;
        }

        return 0;
      },

      config(){
        return this.$store.state.player.config
      }
    }
  }
</script>

<style lang="scss">
  @import '~bulma';

  .is-background-warning{
    background-color: $warning;
  }

  .is-fixed{
    position: sticky;
    z-index: 498;
    max-height: 300px;
    overflow: auto;
  }
</style>
