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
      this.$emit('goToNextPage')
    },
    goToPreviousPage() {
      this.$emit('goToPreviousPage')
    },
    changePage(page) {
      this.currentPage = page
      this.$emit('changePage', this.currentPage)
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
        @click="changePage(p)"
        >{{ p }}</button>
      </div>
      
      <button 
        class="button-next"
        @click="goToNextPage"
      >Next</button>
    </div>
  `,
}
