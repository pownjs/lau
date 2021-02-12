const buildTool = (name, getLister) => {
    return {
        command: `${name} <domain>`,
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

            yargs.options('from', {
                alias: ['F'],
                type: 'string',
                describe: 'To date range',
                default: ''
            })

            yargs.options('to', {
                alias: ['T'],
                type: 'string',
                describe: 'To data range',
                default: ''
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

            yargs.options('pdp', {
                alias: ['l'],
                type: 'boolean',
                default: false
            })

            yargs.options('max-results', {
                alias: ['m', 'max'],
                type: 'number',
                default: Infinity
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

            yargs.options('filter', {
                alias: ['f'],
                type: 'string',
                default: 'statuscode:200'
            })

            yargs.options('filter-extensions', {
                alias: ['extensions', 'extension'],
                type: 'string',
                default: ''
            })
        },

        handler: async(args) => {
            const { Scheduler } = require('@pown/request/lib/scheduler')

            let { header } = args

            const { wildcard, from, to, retry, timeout, pdp, maxResults, unique, summary, concurrency, filter, filterExtensions, domain: maybeDomain } = args

            let domain = maybeDomain.trim()

            if (/^https?:\/\//i.test(domain)) {
                domain = require('url').parse(domain).hostname
            }

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

            const logger = console

            const scheduler = new Scheduler({ maxConcurrent: concurrency })

            const options = {
                logger,
                scheduler,
                wildcard,
                filter,
                from,
                to,
                headers,
                retry,
                timeout
            }

            let processUrl = (url) => url

            if (pdp) {
                processUrl = ((processUrl) => {
                    return (url) => {
                        url = processUrl(url)
                        url = url.replace(/[?#].*/, '')

                        return url
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

            let count = 0

            processUrl = ((processUrl) => {
                return (url) => {
                    count += 1

                    return processUrl(url)
                }
            })(processUrl)

            let processSummary

            if (summary) {
                processSummary = () => {
                    console.info(`count: ${count}`)
                }
            }
            else {
                processSummary = () => {}
            }

            let localFilter

            if (filterExtensions) {
                const lookupExtension = filterExtensions.split(/\|/g).map(e => e.trim()).filter(e => e).map(e => e.startsWith('.') ? e : `.${e}`)

                const url = require('url')
                const path = require('path')

                localFilter = (uri) => {
                    const { pathname } = url.parse(uri)

                    return lookupExtension.includes(path.extname(pathname))
                }
            }
            else {
                localFilter = () => true
            }

            const listURIs = getLister()

            for await (let url of listURIs(domain, options)) {
                if (localFilter(url)) {
                    processUrl(url)
                }

                if (count >= maxResults) {
                    break
                }
            }

            processSummary()
        }
    }
}

module.exports = { buildTool }
