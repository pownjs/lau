const { requestJSON } = require('../scheduler')

const listCommonCrawURIs = async function*(domain, options) {
    const { logger, scheduler, wildcard = '*.', ...schedulerOptions } = options || {}

    logger.info(`commoncrawl: fetching latest index`)

    const data = await requestJSON(scheduler, { uri: 'http://index.commoncrawl.org/collinfo.json', headers, retry, timeout })

    const { 'cdx-api': uri } = data[0] || {}

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

        const data = await requestJSON(scheduler, { ...schedulerOptions, uri: `${uri}?url=${encodeURIComponent(`${wildcard}${domain}`)}/*&output=json&page=${page++}`, headers, retry, timeout }, { parser })

        if (!data.length) {
            break
        }

        for (let entry of data) {
            const url = entry.url.trim()

            if (/^https?:\/\//i.test(url)) {
                yield url
            }
        }
    }
}

module.exports = { listCommonCrawURIs }
