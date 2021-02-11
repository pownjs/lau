const listWebArchiveURIs = async function*(domain, options) {
    const { scheduler, wildcard = '*.', pageSize = 100, headers = {}, retry = 5, timeout = 30000 } = options || {}

    let offset = 0

    while (true) {
        const data = await scheduler.requestJSON({ uri: `http://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(`${wildcard}${domain}`)}/*&output=json&collapse=urlkey&fl=original&limit=${pageSize}&offset=${offset}`, headers, retry, timeout })

        if (!data.length) {
            break
        }

        offset += pageSize

        for (let entry of data) {
            const url = entry[0]

            if (/^https?:\/\//i.test(url)) {
                yield url
            }
        }
    }
}

module.exports = { listWebArchiveURIs }
