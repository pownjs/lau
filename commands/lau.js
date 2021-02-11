exports.yargs = {
    command: 'lau <domain>',
    describe: 'List all URLs',

    builder: (yargs) => {
        yargs.options('header', {
            alias: ['H'],
            type: 'string',
            describe: 'Custom header'
        })

        yargs.options('wildcard', {
            alias: ['w'],
            type: 'string',
            describe: 'Domain wildcard',
            default: '*.'
        })

        yargs.options('retry', {
            alias: ['r'],
            type: 'number',
            default: 5
        })

        yargs.options('timeout', {
            alias: ['t'],
            type: 'number',
            default: 30000
        })

        yargs.options('whole', {
            alias: ['l'],
            type: 'boolean',
            default: true
        })

        yargs.options('unique', {
            alias: ['u'],
            type: 'boolean',
            default: false
        })

        yargs.options('summary', {
            alias: ['s'],
            type: 'boolean',
            default: false
        })

        yargs.options('concurrency', {
            alias: ['c'],
            type: 'number',
            default: Infinity
        })

        yargs.options('filter-extensions', {
            alias: ['extensions', 'extension'],
            type: 'string',
            default: ''
        })
    },

    handler: async(args) => {
        let { header } = args

        const { wildcard, retry, timeout, whole, unique, summary, concurrency, filterExtensions, domain: maybeDomain } = args

        let domain = maybeDomain.trim()

        if (/^https?:\/\//i.test(domain)) {
            domain = require('url').parse(domain).hostname
        }

        const { listURIs } = require('../lib/modules')
        const { Scheduler } = require('../lib/scheduler')

        const headers = {}

        if (header) {
            if (!Array.isArray(header)) {
                header = [header]
            }

            for (let entry of header) {
                let [name = '', value = ''] = entry.split(':', 1)

                name = name.trim() || entry
                value = value.trim() || ''

                if (headers[name]) {
                    if (!Array.isArray(headers[name])) {
                        headers[name] = [headers[name]]
                    }

                    headers[name].push(value)
                }
                else {
                    headers[name] = value
                }
            }
        }

        const scheduler = new Scheduler({ maxConcurrent: concurrency })

        const options = {
            scheduler,
            headers,
            wildcard,
            retry,
            timeout
        }

        let processUrl = (url) => url

        if (!whole) {
            const url = require('url')

            processUrl = ((processUrl) => {
                return (uri) => {
                    uri = processUrl(uri)

                    const parts = url.parse(uri)

                    parts.search = ''
                    parts.query = ''

                    return url.format(parts)
                }
            })(processUrl)
        }

        if (unique) {
            const hash = {}

            processUrl = ((processUrl) => {
                return (url) => {
                    url = processUrl(url)

                    if (!hash[url]) {
                        console.log(url)

                        hash[url] = 1
                    }
                }
            })(processUrl)
        }
        else {
            processUrl = ((processUrl) => {
                return (url) => {
                    url = processUrl(url)

                    console.log(url)
                }
            })(processUrl)
        }

        let processSummary

        if (summary) {
            let count = 0

            processUrl = ((processUrl) => {
                return (url) => {
                    count += 1

                    return processUrl(url)
                }
            })(processUrl)

            processSummary = () => {
                console.info(`count: ${count}`)
            }
        }
        else {
            processSummary = () => {}
        }

        let filter

        if (filterExtensions) {
            const lookupExtension = filterExtensions.split(/\|/g).map(e => e.trim()).filter(e => e).map(e => e.startsWith('.') ? e : `.${e}`)

            const url = require('url')
            const path = require('path')

            filter = (uri) => {
                const { pathname } = url.parse(uri)

                return lookupExtension.includes(path.extname(pathname))
            }
        }
        else {
            filter = () => true
        }

        for await (let url of listURIs(domain, options)) {
            if (filter(url)) {
                processUrl(url)
            }
        }

        processSummary()
    }
}
