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
    pages() {
      return Array.from({ length: this.total_pages }, (_, idx) => idx + 1)
    },
    show_pages() {
      const firstPage = this.pages[0]
      const lastPage = this.pages.length
      const RANGE = 3
      const SPACE = '...'

      if (this.pages.length <= 5) {
        return this.pages
      }
      
      if (this.current_page <= (RANGE + 1)) {
        const restPages = [...this.pages].slice(firstPage, RANGE + 1)

        return this.current_page === (RANGE + 1) 
          ? [firstPage, restPages, this.current_page + 1, SPACE, lastPage].flat()
          : [firstPage, restPages, SPACE, lastPage].flat()
      } else if (this.current_page >= (lastPage - RANGE)) {
        const restPages = [...this.pages].slice(lastPage - RANGE - 1, lastPage - 1)

        return this.current_page === (lastPage - RANGE)
          ? [firstPage, SPACE, this.current_page - 1, restPages, lastPage].flat()
          : [firstPage, SPACE, restPages, lastPage].flat()
      } else {
        return [firstPage, SPACE, this.current_page - 1, this.current_page, this.current_page + 1, SPACE, lastPage]
      }

    },
    is_previous_disabled() {
      return this.current_page === 1
    },
    is_next_disabled() {
      return this.current_page === this.total_pages
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
        class="button-prev"
        @click="goToPreviousPage"
        :disabled="is_previous_disabled"
      >Prev</button>
      
      <div class="paginator-pages">
        <button
        class="button-page"
        :class="{ 'page-active': p === current_page }"
        v-for="p in show_pages"
        @click="onChangePage(p)"
        :disabled="p === '...' || p === current_page"
        >{{ p }}</button>
      </div>
      
      <button 
        class="button-next"
        @click="goToNextPage"
        :disabled="is_next_disabled"
      >Next</button>
    </div>
  `,
}
