exports.yargs = {
    command: 'lau <domain>',
    describe: 'List all URLs',

    builder: (yargs) => {
        yargs.options('header', {
            alias: 'H',
            type: 'string',
            describe: 'Custom header'
        })

        yargs.options('wildcard', {
            alias: 'w',
            type: 'string',
            describe: 'Domain wildcard',
            default: '*.'
        })

        yargs.options('retry', {
            alias: 'r',
            type: 'number',
            default: 5
        })

        yargs.options('timeout', {
            alias: 't',
            type: 'number',
            default: 30000
        })

        yargs.options('unique', {
            alias: 'u',
            type: 'boolean',
            default: false
        })

        yargs.options('summary', {
            alias: 's',
            type: 'boolean',
            default: false
        })

        yargs.options('concurrency', {
            alias: 'c',
            type: 'number',
            default: Infinity
        })
    },

    handler: async(args) => {
        let { header } = args

        const { wildcard, retry, timeout, unique, summary, concurrency, domain: maybeDomain } = args

        let domain = maybeDomain.trim()

        if (/^https?:\/\//i.test(domain)) {
            domain = require('url').parse(domain).hostname
        }

        const { Scheduler } = require('../lib/scheduler')
        const { listCommonCrawURIs } = require('../lib/commoncraw')
        const { listWebArchiveURIs } = require('../lib/webarchive')
        const { listAlienvaultURIs } = require('../lib/alianvault')

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

        let processUrl

        if (unique) {
            const hash = {}

            processUrl = (url) => {
                if (!hash[url]) {
                    console.log(url)

                    hash[url] = 1
                }
            }
        }
        else {
            processUrl = (url) => {
                console.log(url)
            }
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

        await Promise.all(Object.entries({ listCommonCrawURIs, listWebArchiveURIs, listAlienvaultURIs }).map(async([name, func]) => {
            try {
                for await (let url of func(domain, options)) {
                    processUrl(url)
                }
            }
            catch (e) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(new Error(`Listing resources with ${name} failed`))
                    console.error(e)
                }
            }
        }))

        processSummary()
    }
}
