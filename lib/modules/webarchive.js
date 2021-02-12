const querystring = require('querystring')

const { requestJSON } = require('../scheduler')

const listWebArchiveURIs = async function*(domain, options) {
    const { logger, scheduler, wildcard = '*.', filter = 'statuscode:200', from, to, pageSize = 1000, order = 'desc', ...schedulerOptions } = options || {}

    const search = `url=${encodeURIComponent(`${wildcard}${domain}`)}/*`

    console.info(`webarchive: fetching total pages`)

    const preQuery = querystring.stringify({
        output: 'json',

        collapse: 'urlkey',
        fl: 'original',

        filter: filter,

        from: from,
        to: to,

        pageSize: pageSize
    })

    const pageTotal = await requestJSON(scheduler, { ...schedulerOptions, uri: `http://web.archive.org/cdx/search/cdx?${search}&${preQuery}&showNumPages=true` })

    let generatePages

    if (order === 'desc') {
        generatePages = function*() {
            for (let page = pageTotal - 1; page >= 0; page--) {
                yield { page, status: `${pageTotal - page - 1}/${pageTotal}` }
            }
        }
    }
    else {
        generatePages = function*() {
            for (let page = 0; page < pageTotal; page++) {
                yield { page, status: `${page}/${pageTotal}` }
            }
        }
    }

    for (let { page, status } of generatePages()) {
        logger.info(`webarchive: fetching page ${status}`)

        const postQuery = querystring.stringify({
            page: page
        })

        const data = await requestJSON(scheduler, { ...schedulerOptions, uri: `http://web.archive.org/cdx/search/cdx?${search}&${preQuery}&${postQuery}` })

        for (let entry of data) {
            const url = entry[0].trim()

            if (/^https?:\/\//i.test(url)) {
                yield url
            }
        }
    }
}

module.exports = { listWebArchiveURIs }
