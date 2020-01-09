const core = require('@actions/core')
const github = require('@actions/github')
const { filter } = require('lodash')

const {
  GITHUB_SHA,
  GITHUB_EVENT_PATH,
  GITHUB_TOKEN,
  GITHUB_WORKSPACE,
} = process.env


async function run() {
  if (!github.context.payload.pull_request) {
    core.error('This action is only valid on Pull Requests')
    return
  }

  const token = core.getInput('repo-token')
  const octokit = new github.GitHub(token)

  core.debug('Fetching PR files...')
  const { data: files } = await octokit.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
  })

  core.debug('Filtering promoted experiment files...')
  const promoted =
    filter(files, file =>
      file.status === 'renamed' &&
      /experiment/.test(file.previous_filename) &&
      !/experiment/.test(file.filename)
    )

  core.debug('Promoted experiments files:')
  console.log(promoted, !!promoted.length)
}



run()