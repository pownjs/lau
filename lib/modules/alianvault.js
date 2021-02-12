const { requestJSON } = require('../scheduler')

const listAlienvaultURIs = async function*(domain, options) {
    const { logger, scheduler, pageSize = 50, ...schedulerOptions } = options || {}

    let page = 0

    for (;;) {
        logger.info(`alienvault: fetching page ${page}`)

        const data = await requestJSON(scheduler, { ...schedulerOptions, uri: `https://otx.alienvault.com/otxapi/indicator/hostname/url_list/${encodeURIComponent(domain)}?limit=${pageSize}&page=${page}` })

        const { has_next, url_list } = data

        for (let item of url_list) {
            const url = item.url.trim()

            if (/^https?:\/\//i.test(url)) {
                yield url
            }
        }

        if (has_next) {
            page += 1
        }
        else {
            break
        }
    }
}

module.exports = { listAlienvaultURIs }
