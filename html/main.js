import App      from './components/app.js'
import {store}  from './store.js'
import {router} from './router.js'
import utils    from './utils/utils.js'

utils.initialize(
    {
        "appname": "BEAM Gallery",
        "min_api_version": "6.1",
        "apiResultHandler": (...args) => store.onApiResult(...args)
    }, 
    (err) => {
        const vueApp = Vue.createApp(App)
        vueApp.config.globalProperties.$store = store
        vueApp.config.globalProperties.$state = store.state
        vueApp.use(router)
        vueApp.mount('body')

        const style = document.createElement('style');
        style.innerHTML = `.error {color: ${utils.getStyles().validator_error};}`
        document.head.appendChild(style)
        document.body.style.color = utils.getStyles().content_main

        if (err) {
            return store.setError(err)
        }

        store.start()
    }
)
