const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')
const os = require('os')

async function run() {
    await installSummaraizerCli()

    let sourceOutput = await runSummaraizerSource(
        github.context.repo.owner,
        github.context.repo.repo,
        github.event.issue.number
    )
    let providerOutput = await runSummaraizerProvider(
        sourceOutput,
        core.getInput("provider", {required: true,}),
        core.getInput("provider-args")
    )

    await comment(
        process.env.GITHUB_TOKEN,
        github.context.repo.owner,
        github.context.repo.repo,
        github.event.issue.number,
        providerOutput
    )
}

function installSummaraizerCli() {
    return exec.exec('go install github.com/ioki-mobility/summaraizer/cmd/summaraizer@85b0914475ae755231446fc5a748f30a23301c36')
}

async function runSummaraizerSource(owner, repo, issue_number) {
    let output = ''
    const options = {
        listeners: {
            stdout: (data) => {
                output += data.toString()
            },
        }
    }
    await exec.exec(`${os.homedir()}/go/bin/summaraizer github --issue ${owner}/${repo}/${issue_number}`, [], options)
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