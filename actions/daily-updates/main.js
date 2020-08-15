const core = require('@actions/core');
const github = require('@actions/github');
const childProcess = require('child_process');
const { promisify } = require('util');

const exec = promisify(childProcess.exec);

async function git(command, ...args) {
	const { stdout, stderr } = await exec(`git ${command}`, ...args);
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
	await exec('yarn format');

	const { stdout: gotUpdated } = await git('status --porcelain');

	if (gotUpdated) {
		await git('config --local user.email "action@github.com"');
		await git('config --local user.name "GitHub Action"');

		const branch = `github-actions/daily-updates`;
		await git(`checkout -b ${branch}`);
		await git('add -A');
		await git('commit -m "Daily updates"');

		await git(`push origin -f ${branch}`);
		const octokit = new github.GitHub(githubToken);
		try {
			await octokit.pulls.create({
				owner: github.context.repo.owner,
				repo: github.context.repo.repo,
				base: 'master',
				head: branch,
				title: `Daily updates`,
				body: 'Automatically generated',
				maintainer_can_modify: true,
			});
		} catch (error) {
			core.warning(`'${JSON.stringify(error, null, 2)}'`);
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
