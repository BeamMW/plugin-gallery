import adminui from './admin-ui.js'
import artwork from './artwork.js'
import balance from './balance.js'
import headless from './headless.js'
import warning from './tx-warning.js'
import artworksControls from './artworks-controls.js'
import { popups, tabs } from '../utils/consts.js'
import publicKeyPopup from './public-key-popup.js'
import paginator from './paginator.js'

export default {
  computed: {
    in_tx() {
      return this.$state.in_tx
    },
    is_admin() {
      return this.$state.is_admin
    },
    artists() {
      return this.$state.artists
    },
    active_tab() {
      return this.$state.active_tab
    },
    can_vote() {
      return this.$state.balance_reward > 0
    },
    is_popup_visible() {
      return this.$state.is_popup_visible
    },
    is_headless() {
      return this.$state.is_headless
    },
    total_pages() {
      return this.$state.total_pages
    },
    current_artworks() {
      return this.$state.visible_artworks
    },
    current_page() {
      return this.$state.current_page
    },
  },

  components: {
    artwork,
    adminui,
    balance,
    warning,
    artworksControls,
    publicKeyPopup,
    headless,
    paginator,
  },

  template: `
    <div class="vertical-container" id="container">
      <headless v-if="is_headless"></headless>
      <balance v-else></balance>
      <warning v-if="in_tx"></warning>
      <adminui v-if="!in_tx && is_admin"/>
      <artworksControls></artworksControls>
      <publicKeyPopup v-if="is_popup_visible"></publicKeyPopup>
      <template v-if="current_artworks.length > 0">
        <div class="artworks">
          <paginator
            :total_pages="total_pages"
            :current_page="current_page"
            @onChangePage="onChangePage($event)"
          />
        
          <artwork v-for="artwork in current_artworks"
          v-bind:id="artwork.id"
          v-bind:title="artwork.title"
          v-bind:author="(artists[artwork.pk_author] || {}).label"
          v-bind:bytes="artwork.bytes"
          v-bind:owned="artwork.owned"
          v-bind:price="artwork.price"
          v-bind:likes_cnt="artwork.impressions"
          v-bind:liked="artwork.my_impression == 1"
          v-bind:in_tx="in_tx"
          v-bind:can_vote="can_vote"
          v-bind:is_admin="is_admin"
          v-on:sell="onSellArtwork"
          v-on:buy="onBuyArtwork"
          v-on:like="onLikeArtwork"
          v-on:unlike="onUnlikeArtwork"
          v-on:change_price="onChangePrice"
          v-on:delete="onDeleteArtwork"
          :key="artwork.id"
          />
        </div>
        </template>
        <template v-else>
          <div class="empty-gallery">
            <img class="empty-gallery__icon" src="./assets/icon-empty-gallery.svg"/>
            <div class="empty-gallery__text">There are no artworks at the moment.</div>
          </div>
        </template>
    </div>
    `,

  methods: {
    onBuyArtwork(id) {
      this.$store.buyArtwork(id)
    },

    onSellArtwork(id) {
      try {
        this.$store.setPopupType(popups.SELL)
        this.$store.setIdToSell(id)
        this.$store.changePopupState(true)
      } catch (err) {
        this.$store.setError(err, 'Failed to sell an item')
      }
    },

    onChangePrice(id) {
      try {
        this.$store.setPopupType(popups.CHANGE_PRICE)
        this.$store.setIdToSell(id)
        this.$store.changePopupState(true)
      } catch (err) {
        this.$store.setError(err, 'Failed to sell an item')
      }
    },

    onLikeArtwork(id) {
      this.$store.likeArtwork(id)
    },

    onUnlikeArtwork(id) {
      this.$store.unlikeArtwork(id)
    },

    onDeleteArtwork(id) {
      this.$store.deleteArtwork(id)
    },

    onChangePage(value) {
      this.$store.setCurrentPage(value)
    },
  },
}
