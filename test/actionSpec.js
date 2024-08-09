const {installSummaraizerCli, runSummaraizerSource, runSummaraizerProvider, comment} = require("../action")
const assert = require('assert')
const os = require('os')
const fs = require('fs')

describe('Action', function () {
    describe('#installSummaraizer()', function () {
        // To run this test locally, you have to set the env variables
        // `RUNNER_TEMP`, `RUNNER_TOOL_CACHE`, and `GH_TOKEN`.
        it('should install it and put to RUNNER_TOOL_CACHE', async function () {
            this.timeout(15000)

            let githubToken = process.env['GH_TOKEN']
            await installSummaraizerCli(githubToken, "v0.0.1-alpha.00")

            let summaraizerExist = fs.existsSync(`${process.env['RUNNER_TOOL_CACHE']}/summaraizer/v0.0.1-alpha.00`)
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
            this.timeout(50000)
            
            let sourceInput = '[{ "Author" : "StefMa", "Body" : "The World is a nice place" }]'
            let provider = 'ollama'
            let providerArgs = '--model phi3:mini --prompt "Hey, how are you? Can you please include ioki in your response? Thank you.'
            let summarization = await runSummaraizerProvider(sourceInput, provider, providerArgs)

            assert.equal(summarization.trim().includes("ioki"), true)
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