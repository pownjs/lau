const getCommonCrawIndex = async function(options) {
    const { scheduler, headers = {}, retry = 5, timeout = 30000 } = options || {}

    const data = await scheduler.requestJSON({ uri: 'http://index.commoncrawl.org/collinfo.json', headers, retry, timeout })

    const { 'cdx-api': uri } = data[0] || {}

    return uri
}

const listCommonCrawURIs = async function*(domain, options) {
    const { scheduler, wildcard = '*.', headers = {}, retry = 5, timeout = 30000 } = options || {}

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
        const data = await scheduler.requestJSON({ uri: `${uri}?url=${encodeURIComponent(`${wildcard}${domain}`)}/*&output=json&page=${page++}`, headers, retry, timeout }, { parser })

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
