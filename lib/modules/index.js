const { generateOfParalel } = require('@pown/async/lib/generateOfParalel')

const { listAlienVaultURIs } = require('./alienvault')
const { listWebArchiveURIs } = require('./webarchive')
const { listCommonCrawlURIs } = require('./commoncrawl')

const sg = async function*(generator) {
    try {
        yield* generator
    }
    catch (e) {}
}

const listURIs = async function*(domain, { safeGenerator = sg, ...options } = {}) {
    yield* generateOfParalel([listAlienVaultURIs, listWebArchiveURIs, listCommonCrawlURIs].map(f => safeGenerator(f(domain, options))))
}

module.exports = { listURIs }
