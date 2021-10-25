import upload  from './upload.js'
import artwork from './artwork.js'
import balance from './balance.js'
import warning from './tx-warning.js'

export default {
    computed: {
        in_tx () {
            return this.$state.in_tx
        },
        is_admin () {
            return this.$state.is_admin
        },
        artists () {
            return this.$state.artists
        },
        artworks () {
            return this.$state.artworks
        }
    },

    components: {
        artwork, upload, balance, warning
    },

    template: `
        <div class="vertical-container">
            <balance></balance>
            <warning v-if="in_tx"></warning>
            <upload v-if="!in_tx && is_admin"/>
            <div class="artworks">
                <artwork v-for="artwork in artworks"
                    v-bind:id="artwork.id"
                    v-bind:title="artwork.title"
                    v-bind:artist="(artists[artwork.pk] || {}).label"
                    v-bind:bytes="artwork.bytes"
                    v-bind:owned="artwork.owned"
                    v-bind:approved="artwork.approved"
                    v-bind:price="artwork.price"
                    v-bind:in_tx="in_tx"
                    v-on:sell="onSellArtwork"
                    v-on:buy="onBuyArtwork"
                />
            </div>
        </div>    
    `,

    methods: {
        onBuyArtwork (id) {
            this.$store.buyArtwork(id)
        },

        onSellArtwork (id) {
            try {
                let price = prompt("Enter the price in BEAM (need to implement regrular dialog with float values)")
                if (price == null) return
                price = parseInt(price) * 100000000
                this.$store.sellArtwork(id, price)
            } 
            catch (err) {
                this.$store.setError(err, "Failed to sell an item")
            }
        }
    }
}
