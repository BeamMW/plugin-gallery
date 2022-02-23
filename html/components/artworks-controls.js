import html from '../utils/html.js'
import { tabs } from '../utils/consts.js'
import CustomSelect from './selector.js'

export default {
  computed: {
    active_tab() {
      return this.$state.active_tab
    },

    ////////////////
    //// DELETE ////
    ////////////////
    // mine_tab_state () {
    //     return this.$state.visible_arts.find((art) => art.art_state.isMine);
    // },
    // liked_tab_state () {
    //     return this.$state.visible_arts.find((art) => art.art_state.isLiked);
    // },
    // sold_tab_state () {
    //     return this.$state.visible_arts.find((art) => art.art_state.isSold);
    // },
    // sale_tab_state () {
    //     return this.$state.visible_arts.find((art) => art.art_state.isSale);
    // },
    // get_pages_count() {
    //   return Math.ceil(this.$state.artworks[this.$state.active_tab].length / 2)
    // },
    // get_current_page() {
    //   return this.$state.current_page
    // },
  },

  components: {
    CustomSelect,
  },

  render() {
    const selectorOptions = [
      'Creator: A to Z',
      'Creator: Z to A',
      'Price: Low to High',
      'Price: High to Low',
      'Likes: Low to High',
      'Likes: High to Low',
    ]

    //TODO: catch event from custom-select
    return html`
      <div class="actions-container">
        <div class="artworks-controls">
          <div class="artworks-controls__tabs">
            ${this.$state.artworks[tabs.ALL].length > 0 ? this.renderTab(tabs.ALL, 'ALL') : null}
            ${this.$state.artworks[tabs.MINE].length > 0 ? this.renderTab(tabs.MINE, 'MINE') : null}
            ${this.$state.artworks[tabs.SALE].length > 0 ? this.renderTab(tabs.SALE, 'SALE') : null}
            ${this.$state.artworks[tabs.LIKED].length > 0 ? this.renderTab(tabs.LIKED, 'LIKED') : null}
            ${this.$state.artworks[tabs.SOLD].length > 0 ? this.renderTab(tabs.SOLD, 'SOLD') : null}
          </div>
        </div>
      </div>
    `

    //enable after author load fix
    // <${CustomSelect}
    // options=${selectorOptions}
    // default="Sort by"
    // class="select"
    // />
  },

  methods: {
    onTabClicked(id) {
      if (this.active_tab !== id) {
        this.$store.setActiveTab(id)
      }
    },

    renderActiveLine(id) {
      if (id === this.active_tab) {
        return html` <div class="tab-item__bottom-line"></div> `
      }
    },

    renderTab(type, title) {
      return html`
        <span
          class="tab-item ${this.active_tab === type ? 'tab-active' : ''}"
          onclick=${() => {
            this.onTabClicked(type)
          }}
        >
          <div class="tab-item__title">${title}</div>
          ${this.renderActiveLine(type)}
        </span>
      `
    },
  },
}
