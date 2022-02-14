export default {
  props: {
    total_pages: {
      type: Number,
      required: true,
      default: 1,
    },
    current_page: {
      type: Number,
      required: true,
      default: 1,
    }
  },

  computed: {
    pages () {
      return Array.from({ length: this.total_pages }, (_, idx) => idx + 1)
    }
  },

  methods: {
    goToNextPage() {
      let page = this.current_page < this.total_pages ? (this.current_page + 1) : this.current_page
      this.onChangePage(page)
    },
    goToPreviousPage() {
      let page = this.current_page > 1 ? (this.current_page - 1) : this.current_page
      this.onChangePage(page)
    },
    onChangePage(page) {
      this.$emit('onChangePage', page)
    }
  },

  template: `
    <div class="paginator">
      <button 
        class="button-prev "
        @click="goToPreviousPage"
      >Prev</button>
      
      <div class="paginator-pages">
        <button
        class="button-page"
        :class="{ buttonPageActive: p === current_page }"
        v-for="p in pages"
        @click="onChangePage(p)"
        >{{ p }}</button>
      </div>
      
      <button 
        class="button-next"
        @click="goToNextPage"
      >Next</button>
    </div>
  `,
}
