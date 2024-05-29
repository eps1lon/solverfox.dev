const core = require('@actions/core');
const github = require('@actions/github');
const childProcess = require('child_process');
const { promisify } = require('util');

const exec = promisify(childProcess.exec);

/**
 * @param {string} command
 * @returns
 */
async function git(command) {
	const { stdout, stderr } = await exec(`git ${command}`);
	if (stdout) core.debug(`stdout: ${stdout}`);
	if (stderr) core.debug(`stderr: ${stderr}`);
	return { stdout, stderr };
}

async function main() {
	const githubToken = core.getInput('token');

	await exec('node scripts/loadContributions static/contributions.json', {
		env: {
			...process.env,
			GITHUB_TOKEN: githubToken,
		},
	});

	const { stdout: gotUpdated } = await git('status --porcelain');

	if (gotUpdated) {
		await git('config --local user.email "action@github.com"');
		await git('config --local user.name "GitHub Action"');

		const branch = `github-actions/daily-updates`;
		await git(`checkout -b ${branch}`);
		await git('add -A');
		await git('commit -m "Monthly updates"');

		await git(`push origin -f ${branch}`);
		const octokit = github.getOctokit(githubToken);
		try {
			await octokit.rest.pulls.create({
				owner: github.context.repo.owner,
				repo: github.context.repo.repo,
				base: 'main',
				head: branch,
				title: `Monthly updates`,
				body: 'Automatically generated',
				maintainer_can_modify: true,
			});
		} catch (error) {
			core.warning(
				/**
				 * @type {any}
				 */ (error),
			);
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
