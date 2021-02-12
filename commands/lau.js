const { buildTool } = require('./lib/tool')

exports.yargs = buildTool('lau', () => {
    const { listURIs } = require('../lib/modules')

    return listURIs
})
