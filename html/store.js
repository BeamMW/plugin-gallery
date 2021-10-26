import {router} from './router.js'
import utils from './utils/utils.js'

const defaultState = () => {
    return {
        loading: true,
        error: undefined,
        shader: undefined,
        cid: "ea3a002da2b8f8d24c5f5e7056e4c06aad6309097588c6946d10ac00349a9f52",
        artist_key: "",
        is_artist: false,
        is_admin: false,
        artworks: [], 
        artists: {},
        artists_count: 0,
        balance_beam: 0,
        in_tx: false,
        selected_artist: undefined,
    }
}

export const store = {
    state: Vue.reactive(defaultState()),

    //
    // Errors
    //
    setError(error, context) {
        this.state.error = {error, context}
    },

    checkError (err) {
        if (err) this.setError(err)
    },

    clearError() {
        this.state.error = undefined
        this.start()
    },

    //
    // Shader, CID, debug helpers
    //
    start () {
        Object.assign(this.state, defaultState())
        router.push({name: 'gallery'})

        Vue.nextTick(() => {
            utils.download("./galleryManager.wasm", (err, bytes) => {
                if (err) return this.setError(err, "Failed to download shader")
                this.state.shader = bytes

                //utils.invokeContract("", (...args) => this.onShowMethods(...args), this.state.shader)
                utils.callApi("ev_subunsub", {ev_txs_changed: true, ev_system_state: true}, (err) => this.checkError(err))
                utils.invokeContract("role=manager,action=view", (...args) => this.onCheckCID(...args), this.state.shader)
            })
        })
    },

    refreshAllData () {
        this.loadParams()
    },

    onCheckCID (err, res) {
        if (err) {
            return this.setError(err, "Failed to verify cid")     
        }

        if (!res.contracts.some(el => el.cid == this.state.cid)) {
            throw `CID not found '${this.state.cid}'`
        }

        utils.invokeContract(
            `role=artist,action=get_key,cid=${this.state.cid}`, 
            (...args) => this.onGetArtistKey(...args), this.shader
        )
    },

    onShowMethods (err, res) {
        if (err) return this.setError(err)
        alert(utils.formatJSON(res))
    },

    //
    // Transactions
    //
    onApiResult(err, res, full) {
        if (err) {
            return this.setError(err,  "API handling error")
        }

        if (full.id == 'ev_txs_changed') {   
            let inTx = false            
            let txs = full.result.txs
            
            for (let tx of txs) {
                if (tx.status == 0 || tx.status == 1 || tx.status == 5) {
                    inTx = true
                    break
                }
            }

            this.state.in_tx = inTx
            return
        }

        if (full.id == 'ev_system_state') {
            // we update our data on each block
            this.refreshAllData()
            return
        }

        this.setError(full, "Unexpected API result")
    },

    //
    // Self info, balance & stuff
    //
    onGetArtistKey(err, res) {
        if (err) {
            return this.setError(err, "Failed to get artist key")     
        }
        
        utils.ensureField(res, "key", "string")
        this.state.artist_key = res.key
        this.refreshAllData()
    },

    loadParams () {
        // TODO: move loading sequence to promises, now loadBalance initiates update chain
        //       do not chain functions, but execue promises arrayy
        //       cancel all pending promises in new ev_system_state
        utils.invokeContract(
            `role=manager,action=view_params,cid=${this.state.cid}`, 
            (...args) => this.onLoadParams(...args)
        )
    },

    onLoadParams (err, res) {
        if (err) {
            return this.setError(err, "Failed to load contract params")
        }

        // TODO: res.Exibits == count of artworks
        //       check it and if not changed do not reload
        utils.ensureField(res, "Admin", "number")
        this.state.is_admin = !!res.Admin
        this.loadBalance()
    },
    
    loadBalance() {
        utils.invokeContract(
            `role=user,action=view_balance,cid=${this.state.cid}`, 
            (...args) => this.onLoadBalance(...args)
        )
    },

    onLoadBalance(err, res) {
        if (err) {
            return this.setError(err, "Failed to load balance")
        }

        // totals can be missing if user has nothing at all
        // also there can be not only beam. We just interested
        // only in beam for now
        if (res.totals) {
            utils.ensureField(res, "totals", "array")
            for (let item of res.totals) {
                if (item.aid == 0) {
                    this.state.balance_beam = item.amount
                }
            }
        }

        this.loadArtists()
    },

    withdrawBEAM () {
        // TODO: this will not happen in demo but all the amounts might not fit into one block
        //       need to set nMaxCount to 100 max and reflet that in UI
        //       AND
        //       withdrawal in bulk negates privacy. Need to ask user what to do - in bulk
        //       or for each piece separately
        utils.invokeContract(
            `role=user,action=withdraw,nMaxCount=0,cid=${this.state.cid}`, 
            (...args) => this.onMakeTx(...args)
        )
    },

    //
    // Artists
    //
    loadArtists () {
        utils.invokeContract(
            `role=manager,action=view_artists,cid=${this.state.cid}`, 
            (...args) => this.onLoadArtists(...args)
        )
    },

    onLoadArtists(err, res) {
        if (err) {
            return this.setError(err, "Failed to load artists list")
        }

        utils.ensureField(res, "artists", "array")
        //
        // OPTIMIZE: 
        //       code below is not optimized, need to ask Vlad  if it is possible for contract/app to
        //       return artists old artists before new. In this case we can skip artists_count in res.artists
        //
        //       for (let idx = this.state.artists_count; idx < res.artists.length; ++idx) {
        //          let artist = res.artists[idx]
        //          if (artist.key == this.state.artist_key) {
        //            this.state.is_artist = true
        //          }
        //          this.state.artists[artist.key] = artist
        //       }
        //
        if (this.state.artists_count != res.artists.length) {
            let artists = []
            for (let artist of res.artists) {
                if (artist.key == this.state.artist_key) {
                    this.state.is_artist = true
                }
                this.state.artists[artist.key] = artist
            }
        } 
        // END OF NOT OPTIMIZED
        this.state.artists_count = res.artists.length
        this.loadArtworks()
    },

    //
    // Artworks
    //
    loadArtworks () {
        utils.invokeContract(
            `role=user,action=view_all,cid=${this.state.cid}`, 
            (...args) => this.onLoadArtworks(...args)
        )    
    },

    onLoadArtworks (err, res) {
        if (err) {
            return this.setError(err, "Failed to load artwork list")
        }
    
        utils.ensureField(res, "items", "array")
        let artworks = []
        for (const artwork of res.items) {
            // TODO: remove if < 2, this is for test only
            if (artwork.id < 3) continue

            // just for convenience, to make more clear what pk is
            artwork.pk_owner = artwork.pk
            delete artwork.pk
        
            if (artwork["price.aid"] != undefined) {
                artwork.price = {
                    aid: artwork["price.aid"],
                    amount: artwork["price.amount"]
                }
            }

            // TODO: optimize
            let found = false
            for (let idx = 0; idx < this.state.artworks.length; ++idx) {
                let old = this.state.artworks[idx]
                if (old.id == artwork.id) {
                    artwork.title     = old.title
                    artwork.bytes     = old.bytes
                    artwork.pk_author = old.pk_author
                    found = true
                    break
                }
            }

            artworks.push(artwork)
            if (!found) {
                this.loadArtwork(artworks.length - 1, artwork.id)
            }   
        }
        
        // TODO: update existing artworks, not replace
        this.state.artworks = artworks
        this.state.loading = false 
    },

    loadArtwork(idx, id) {
        utils.invokeContract(
            `role=user,action=download,cid=${this.state.cid},id=${id}`, 
            (err, res) => this.onLoadArtwork(err, res, idx, id)
        )  
    },

    // TODO: check if we need to pass idx
    onLoadArtwork(err, res, idx) {
        if (err) {
            return this.setError(err, "Failed to download an artwork")
        }

        utils.ensureField(res, "artist", "string")
        let pk_author = res.artist

        utils.ensureField(res, "data", "string")
        var data = utils.hexDecodeU8A(res.data)

        // check version
        if (data[0] != 1) {
            throw `Invalid format version: ${data[0]}`
        }

        // parse name
        let nend = data.findIndex(val => val == 0)
        if (nend == -1 || nend + 1 == data.length) {
            throw "Unable to parse image name"
        }

        let rawName = data.subarray(1, nend)
        let name = (new TextDecoder()).decode(rawName)

        // parse bytes
        let bytes = data.subarray(nend + 2)

        // save parsed data
        // list may have been changed, so we check if artwork with this id is still present
        let artwork = this.state.artworks[idx]
        if (artwork && artwork.id) {
            artwork.title = name
            artwork.bytes = bytes
            artwork.pk_author = pk_author
        }
    },

    //
    // Buy & Sell
    //
    buyArtwork (id) {
        // TODO: what will happen if two different users would hit buy during the same block?
        utils.invokeContract(
            `role=user,action=buy,id=${id},cid=${this.state.cid}`, 
            (...args) => this.onMakeTx(...args)
        )
    },

    sellArtwork (id, price) {
        utils.invokeContract(
            `role=user,action=set_price,id=${id},amount=${price},aid=0,cid=${this.state.cid}`, 
            (...args) => this.onMakeTx(...args)
        )
    },

    onMakeTx (err, sres, full) {
        if (err) {
            return this.setError(err, "Failed to generate transaction request")
        }

        utils.ensureField(full.result, "raw_data", "array")
        utils.callApi(
            'process_invoke_data', {data: full.result.raw_data}, 
            (...args) => this.onSendToChain(...args)
        )
    },

    onSendToChain(err, res) {
        if (err) {
            if (utils.isUserCancelled(err)) return
            return this.setError(err, "Failed to create transaction")
        }
        utils.ensureField(res, "txid", "string")
    },

    //
    // Admin stuff
    //
    addArtist (key, name) {
        utils.invokeContract(
            `role=manager,action=set_artist,pkArtist=${key},label=${name},bEnable=1,cid=${this.state.cid}`, 
            (...args) => this.onMakeTx(...args)
        )
    },

    uploadArtwork (file, artist_key, artist_name) {
        let name = file.name.split('.')[0]
        name = [name[0].toUpperCase(), name.substring(1)].join('')
            
        try {
            let reader = new FileReader()
            reader.readAsArrayBuffer(file)

            reader.onload = ()=> {
                let aver  = Uint8Array.from([1])
                let aname = (new TextEncoder()).encode(name)
                let asep  = Uint8Array.from([0, 0])
                let aimg  = new Uint8Array(reader.result)
                let hex   = [utils.hexEncodeU8A(aver), 
                            utils.hexEncodeU8A(aname), 
                            utils.hexEncodeU8A(asep), 
                            utils.hexEncodeU8A(aimg)
                            ].join('')
                        
                utils.invokeContract(`role=manager,action=upload,cid=${this.state.cid},pkArtist=${artist_key},data=${hex}`, 
                    (...args) => this.onMakeTx(...args)
                )
            }
        }
        catch(err) {
            this.setError(err, "Failed to upload artwork")
        }
    }
}