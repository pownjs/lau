exports.yargs = {
    command: 'lau <domain>',
    describe: 'List all URLs',

    builder: (yargs) => {},

    handler: async(args) => {
        const { domain } = args

        const { Scheduler } = require('../lib/scheduler')
        const { listCommonCrawURIs } = require('../lib/commoncraw')
        const { listWebArchiveURIs } = require('../lib/webarchive')
        const { listAlienvaultURIs } = require('../lib/alianvault')

        const scheduler = new Scheduler()

        const options = {
            scheduler,

            wildcard: '*.',
            headers: {},
            retry: 5,
            timeout: 30000,
        }

        await Promise.all(Object.entries({ listCommonCrawURIs, listWebArchiveURIs, listAlienvaultURIs }).map(async([name, func]) => {
            try {
                for await (let url of func(domain, options)) {
                    console.log(url)
                }
            }
            catch (e) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(new Error(`Listing resources with ${name} failed`))
                    console.error(e)
                }
            }
        }))
    }
}
