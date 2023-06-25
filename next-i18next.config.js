const ChainedBackend = require('i18next-chained-backend').default

const HttpBackend = require('i18next-http-backend/cjs')

const {instance: axios} = require("./lib/axios");


const isBrowser = typeof window !== 'undefined'
const isDev = process.env.NODE_ENV === 'development'
const backendOptions = {
    loadPath: "{{lng}}|{{ns}}",
    request: async (options, url, payload, callback) => {
        try {
            const [lng, ns] = url.split("|");
            await axios.get("/translations", {
                params: {ns},
            }).then((response) => {
                callback(null, {
                    data: response.data.data[lng][ns],
                    status: 200
                });
            }).catch((error) => {
                console.log(error.response);
            });
        } catch (e) {
            callback(null, {
                status: 500
            });
        }
    }
}
const backend = {
    backends: [HttpBackend],
    backendOptions: [backendOptions]
};

if (isBrowser) {
    const LocalStorageBackend = require('i18next-localstorage-backend').default
    backend.backends.unshift(LocalStorageBackend)
    backend.backendOptions.unshift({
        expirationTime: 60 * 60 * 1000,
        prefix: 'i18next_res_'
    })
} else {
    const FSBackend = require('i18next-fs-backend/cjs')
    backend.backends.unshift(FSBackend)
    backend.backendOptions.unshift({
        expirationTime: 60 * 60 * 1000,
        loadPath: './public/locales_cache/{{lng}}/{{ns}}.json',
    })
}

module.exports = {
    debug: isDev,
    i18n: {
        locales: ["ar"],
        defaultLocale: "ar"
    },
    use: [ChainedBackend],
    ns: ["common"],
    backend,
    serializeConfig: false
};
