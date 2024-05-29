const {installSummaraizerCli, runSummaraizerSource, runSummaraizerProvider, comment} = require("../action")
const assert = require('assert')
const os = require('os')
const pathExists = require('path-exists')

describe('Action', function () {
    describe('#installSummaraizer()', function () {
        it('should install it and put to ~/go/bin/summaraizer', async function () {
            await installSummaraizerCli()

            let summaraizerExist = pathExists.sync(`${os.homedir()}/go/bin/summaraizer`)
            assert.equal(summaraizerExist, true)
        })
    })

    describe('#runSummaraizerSource()', function () {
        it('should return the fetched source', async function () {
            let source = await runSummaraizerSource("", "ioki-mobility", "summaraizer", "11")

            assert.match(source, /chb-ioki/)
            assert.match(source, /Analogous to the/)
            assert.match(source, /StefMa/)
            assert.match(source, /While projectId equals to the repo encode/)
        })
    })

    describe('#runSummaraizerProvider()', function () {
        it('should return a summarization from the provider', async function () {
            let sourceInput = '[{ "Author" : "StefMa", "Body" : "The World is a nice place" }]'
            let provider = 'ollama'
            let providerArgs = '--model phi3:mini --prompt "Whatever I say, please start you answer with Yes"'
            let summarization = await runSummaraizerProvider(sourceInput, provider, providerArgs)

            assert.equal(summarization.startsWith("Yes"), true)
        })
    })

    describe("#comment()", function () {
        // Ignored because this should only run manually in case its required.
        // Remove .skip to enable it
        it.skip('should comment on github', async function () {
            await comment(
                "[REPLACE_ME_WITH_VALID_TOKEN]",
                "ioki-mobility",
                "summaraizer",
                "1",
                "Hello World"
            )

            assert.equal(true, true)
        })
    })
})