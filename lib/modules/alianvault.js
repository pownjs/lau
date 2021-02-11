const listAlienvaultURIs = async function*(domain, options) {
    const { logger, scheduler, pageSize = 50, headers = {}, retry = 5, timeout = 30000 } = options || {}

    let page = 0

    for (;;) {
        logger.info(`alienvault: fetching page ${page}`)

        const data = await scheduler.requestJSON({ uri: `https://otx.alienvault.com/otxapi/indicator/hostname/url_list/${encodeURIComponent(domain)}?limit=${pageSize}&page=${page}`, headers, retry, timeout })

        const { has_next, url_list } = data

        for (let item of url_list) {
            const { url } = item

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
