const { requestJSON } = require('../scheduler')

const getCommonCrawIndex = async function(options) {
    const { scheduler, headers = {}, retry = 5, timeout = 30000 } = options || {}

    const data = await requestJSON(scheduler, { uri: 'http://index.commoncrawl.org/collinfo.json', headers, retry, timeout })

    const { 'cdx-api': uri } = data[0] || {}

    return uri
}

const listCommonCrawURIs = async function*(domain, options) {
    const { logger, scheduler, wildcard = '*.', headers = {}, retry = 5, timeout = 30000 } = options || {}

    logger.info(`commoncrawl: fetching latest index`)

    const uri = await getCommonCrawIndex({ scheduler, headers, retry, timeout })

    const parser = (input) => {
        const items = []

        for (let line of input.toString().split('\n')) {
            line = line.trim()

            if (!line) {
                continue
            }

            try {
                items.push(JSON.parse(line))
            }
            catch (e) {}
        }

        return items
    }

    let page = 0

    while (true) {
        logger.info(`commoncrawl: fetching page ${page}`)

        const data = await requestJSON(scheduler, { uri: `${uri}?url=${encodeURIComponent(`${wildcard}${domain}`)}/*&output=json&page=${page++}`, headers, retry, timeout }, { parser })

        if (!data.length) {
            break
        }

        for (let entry of data) {
            const { url } = entry

            if (/^https?:\/\//i.test(url)) {
                yield url
            }
        }
    }
}

module.exports = { getCommonCrawIndex, listCommonCrawURIs }
