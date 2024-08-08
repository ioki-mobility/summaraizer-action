const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')
const os = require('os')
const fs = require('fs')
const tc = require('@actions/tool-cache')

async function run() {
    let ghToken = core.getInput("gh-token", {required: true})
    let summaraizerVersion = core.getInput("summaraizer-version", {required: false})
    let provider = core.getInput("provider", {required: true})
    let providerArgs = core.getInput("provider-args", {required: true})

    await installSummaraizerCli(ghToken, summaraizerVersion)

    let sourceOutput = await runSummaraizerSource(
        ghToken,
        github.context.repo.owner,
        github.context.repo.repo,
        github.context.payload.issue.number
    )
    let providerOutput = await runSummaraizerProvider(
        sourceOutput,
        provider,
        providerArgs
    )

    await comment(
        ghToken,
        github.context.repo.owner,
        github.context.repo.repo,
        github.context.payload.issue.number,
        providerOutput
    )
}

async function installSummaraizerCli(githubToken, summaraizerVersion) {
    const octokit = github.getOctokit(githubToken)
    const release = await octokit.rest.repos.getReleaseByTag({
        owner: 'ioki-mobility',
        repo: 'summaraizer',
        tag: summaraizerVersion
    })

    const assetId = release.data.assets.find(a => a.name === findAssetName())?.id
    if (!assetId) {
        throw new Error(`Unable to locate asset for summaraizer release version: ${summaraizerVersion}`)
    }

    const asset = await octokit.rest.repos.getReleaseAsset({
        owner: 'ioki-mobility',
        repo: 'summaraizer',
        asset_id: assetId
    })

    const binaryPath = await tc.downloadTool(asset.data.browser_download_url)
    const permissionsMode = 0o711
    await fs.chmod(binaryPath, permissionsMode, (err) => {
    })
    const cachedPath = await tc.cacheFile(
        binaryPath,
        'summaraizer',
        'summaraizer',
        summaraizerVersion
    )
    core.addPath(cachedPath)
}

function findAssetName() {
    const op = os.platform()
    const arch = os.arch()

    switch (op) {
        case 'linux':
            return 'summaraizer-linux-amd64'
        case 'darwin':
            switch (arch) {
                case 'x64':
                    return 'summaraizer-macos-amd64'
                case 'arm64':
                    return 'summaraizer-macos-arm64'
            }
            break
        case 'win32':
            return 'summaraizer-windows-amd64'
    }

    throw new Error(`Couldn't find asset name for ${op}-${arch}`)
}

async function runSummaraizerSource(token, owner, repo, issue_number) {
    let output = ''
    const options = {
        listeners: {
            stdout: (data) => {
                output += data.toString()
            },
        }
    }
    let command = `summaraizer github --issue ${owner}/${repo}/${issue_number} `
    if (token !== "") {
        command += `--token ${token}`
    }
    await exec.exec(command, [], options)
    return output
}

async function runSummaraizerProvider(sourceInput, provider, providerArgs) {
    console.error(sourceInput)
    let output = ''
    const options = {
        listeners: {
            stdout: (data) => {
                output += data.toString()
            },
        },
        input: Buffer.from(sourceInput)
    }
    await exec.exec(`summaraizer ${provider} ${providerArgs}`, [], options)
    return output
}

async function comment(
    token,
    owner,
    repo,
    issue_number,
    body
) {
    let comment = `<sub>This is a AI generated summarization of this issue. Powered by [summaraizer](https://github.com/ioki-mobility/summaraizer) via [summaraizer-action](https://github.com/ioki-mobility/summaraizer-action):</sub></br></br> ${body}`
    return github.getOctokit(token).rest.issues.createComment({
        owner,
        repo,
        issue_number,
        body: comment
    })
}

module.exports = {
    run,
    installSummaraizerCli,
    runSummaraizerSource,
    runSummaraizerProvider,
    comment
}