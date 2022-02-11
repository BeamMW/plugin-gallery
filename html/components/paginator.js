export default {
  props: {
    totalPages: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      currentPage: 1,
      pages: this.defineAllPages(this.totalPages),
    }
  },

  methods: {
    goToNextPage() {
      this.currentPage < this.totalPages ? (this.currentPage += 1) : this.currentPage
      this.$emit('onChangePage', this.currentPage)
    },
    goToPreviousPage() {
      this.currentPage > 1 ? (this.currentPage -= 1) : this.currentPage
      this.$emit('onChangePage', this.currentPage)
    },
    onChangePage(page) {
      this.currentPage = page
      this.$emit('onChangePage', this.currentPage)
    },
    defineAllPages(num) {
      return Array.from({ length: num }, (_, idx) => idx + 1)
    },
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
        :class="{ buttonPageActive: p === currentPage }"
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
