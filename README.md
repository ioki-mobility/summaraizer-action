[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ioki-mobility/summaraizer-action/blob/main/LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/ioki-mobility/summaraizer-action?include_prereleases)](https://github.com/ioki-mobility/summaraizer-action/releases/latest)

# summaraizer GitHub Action

## What?

Summaraizer summarizes your GitHub issues and pull requests discussions.

## How?

This is an example workflow file how to use this action:

```yml
name: Summaraizer
'on':
  issue_comment:
    types:
    - created
jobs:
  summarize:
    runs-on: ubuntu-latest
    if: contains(github.event.comment.body, 'AI summarize please')
    permissions:
      issues: write
    steps:
    - name: Summarize
      uses: ioki-mobility/summaraizer-action@{latestRelease or main}
      with:
        provider: 'ollama'
        provider-args: '--url https://ollama.example.com --model llama3.1'
        gh-token: ${{ secrets.GITHUB_TOKEN }}
```

The workflow will run if you create a comment that contains: _AI summarize please_.
It will then install the [summaraizer CLI](https://github.com/ioki-mobility/summaraizer) and
invoke it with the given provider parameters and the automatically added github parameters
from where this workflow was triggered by.
Finally, it will create a comment on that issue with the summarization of it.

Checkout the [summaraizer project](https://github.com/ioki-mobility/summaraizer) for all possible providers and their respective arguments.

Please note that you could also run `ollama` [within your GitHub Action](https://stackoverflow.com/a/78539440).

The permission `issue: write` is required to add the comment to your issue.

## Why?

Ever run into a situation to got a bit overhelmed with the amound of comments
inside an issue or pull request?
Or you just came back from a nice 3 weeks vacation trip and now has to read
a 75 comments long issue to keep on track?

Such problems are from the past now!
Just run the summaraizer over it to get a summarization of all comments
to get on track faster than ever before!

## Action Inputs

Full a full-reference, checkout the [`action.yml`](action.yml) file.

**gh-token**</br>
The GitHub token that read and write access to your repository. Defaults to `${{ github.token }}`.

**summaraizer-version**</br>
The version of the [summaraizer cli](https://github.com/ioki-mobility/summaraizer/releases) that is used. Defaults to `v0.0.1-alpha.00`.

**provider**</br>
The (ai) provider to use to summarize the comments. Defaults to `ollama`.

**provider-args**</br>
The arguments for the choosen provider. Checkout the [summaraizer documentation](https://github.com/ioki-mobility/summaraizer) for more information.

## Release

1. Navigate to the [Actions tab](../../actions) in your repository.
2. Select the ["Create Release" workflow](../../actions/workflows/release.yml).
3. Click on "Run workflow" and enter the new version number (e.g., `1.2.3`).

The new version tag will be created as well as the **major** tag will be created or updated.
Also a draft GitHub release will be generated. You can view the releases on the [Releases page](../../releases/latest).
