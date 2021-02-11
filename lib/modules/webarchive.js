const listWebArchiveURIs = async function*(domain, options) {
    const { scheduler, wildcard = '*.', headers = {}, retry = 5, timeout = 30000 } = options || {}

    const data = await scheduler.requestJSON({ uri: `http://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(`${wildcard}${domain}`)}/*&output=json&collapse=urlkey&fl=original`, headers, retry, timeout })

    for (let entry of data) {
        const url = entry[0]

        if (/^https?:\/\//i.test(url)) {
            yield url
        }
    }
}

module.exports = { listWebArchiveURIs }
