const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')
const os = require('os')

async function run() {
    await installSummaraizerCli()

    let ghToken = core.getInput("gh-token", {required: true,})
    let provider = core.getInput("provider", {required: true,})
    let providerArgs = core.getInput("provider-args", {required: true,})

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

function installSummaraizerCli() {
    return exec.exec('go install github.com/ioki-mobility/summaraizer/cmd/summaraizer@85b0914475ae755231446fc5a748f30a23301c36')
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
    let command = `${os.homedir()}/go/bin/summaraizer github --issue ${owner}/${repo}/${issue_number} `
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
    await exec.exec(`${os.homedir()}/go/bin/summaraizer ${provider} ${providerArgs}`, [], options)
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